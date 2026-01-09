import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/messages - Get message threads or messages with an employer
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (partnerId) {
      // Get conversation with specific partner (employer)
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, recipientId: partnerId },
            { senderId: partnerId, recipientId: userId },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      // Mark received messages as read
      await prisma.message.updateMany({
        where: {
          senderId: partnerId,
          recipientId: userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({ messages });
    }

    // Get all conversation threads
    const sentMessages = await prisma.message.findMany({
      where: { senderId: userId },
      select: { recipientId: true },
      distinct: ['recipientId'],
    });

    const receivedMessages = await prisma.message.findMany({
      where: { recipientId: userId },
      select: { senderId: true },
      distinct: ['senderId'],
    });

    // Get unique conversation partners
    const partnerIds = new Set([
      ...sentMessages.map(m => m.recipientId),
      ...receivedMessages.map(m => m.senderId),
    ]);

    // Get last message, unread count, and job context for each conversation
    const threads = await Promise.all(
      Array.from(partnerIds).map(async (pId) => {
        const [lastMessage, unreadCount, partner] = await Promise.all([
          prisma.message.findFirst({
            where: {
              OR: [
                { senderId: userId, recipientId: pId },
                { senderId: pId, recipientId: userId },
              ],
            },
            orderBy: { createdAt: 'desc' },
          }),
          prisma.message.count({
            where: {
              senderId: pId,
              recipientId: userId,
              isRead: false,
            },
          }),
          prisma.user.findUnique({
            where: { id: pId },
            select: {
              id: true,
              name: true,
              avatar: true,
              title: true,
              role: true,
              tenantId: true,
            },
          }),
        ]);

        // Get company info if partner is employer
        let company = null;
        if (partner?.tenantId) {
          company = await prisma.tenant.findUnique({
            where: { id: partner.tenantId },
            select: {
              id: true,
              name: true,
              logo: true,
            },
          });
        }

        // Get job info if message has jobId
        let jobTitle = null;
        if (lastMessage?.jobId) {
          const job = await prisma.job.findUnique({
            where: { id: lastMessage.jobId },
            select: { title: true },
          });
          jobTitle = job?.title;
        }

        return {
          partnerId: pId,
          partner: {
            ...partner,
            company,
          },
          lastMessage,
          unreadCount,
          jobTitle,
          companyName: company?.name,
        };
      })
    );

    // Sort by last message date
    threads.sort((a, b) => {
      const aDate = a.lastMessage?.createdAt || new Date(0);
      const bDate = b.lastMessage?.createdAt || new Date(0);
      return bDate.getTime() - aDate.getTime();
    });

    return NextResponse.json({ threads });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST /api/messages - Send message to employer
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { recipientId, content, jobId, threadId } = body;

    if (!recipientId || !content) {
      return NextResponse.json(
        { error: 'Recipient and content are required' },
        { status: 400 }
      );
    }

    // Verify recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    // Create or get thread ID
    let messageThreadId = threadId;
    if (!messageThreadId) {
      const ids = [userId, recipientId].sort();
      messageThreadId = `thread_${ids.join('_')}`;
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId: userId,
        recipientId,
        threadId: messageThreadId,
        content: content.trim(),
        jobId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Create notification for recipient
    const sender = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'message_received',
        title: 'New Message',
        message: `${sender?.name || 'A job seeker'} sent you a message`,
        link: `/employer/messages?candidateId=${userId}`,
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

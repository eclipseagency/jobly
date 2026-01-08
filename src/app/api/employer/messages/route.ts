import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/employer/messages - Get message threads or messages with a candidate
export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (candidateId) {
      // Get conversation with specific candidate
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: tenantId, recipientId: candidateId },
            { senderId: candidateId, recipientId: tenantId },
          ],
        },
        orderBy: { createdAt: 'asc' },
      });

      // Mark as read
      await prisma.message.updateMany({
        where: {
          senderId: candidateId,
          recipientId: tenantId,
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
      where: { senderId: tenantId },
      select: { recipientId: true },
      distinct: ['recipientId'],
    });

    const receivedMessages = await prisma.message.findMany({
      where: { recipientId: tenantId },
      select: { senderId: true },
      distinct: ['senderId'],
    });

    // Get unique conversation partners
    const partnerIds = new Set([
      ...sentMessages.map(m => m.recipientId),
      ...receivedMessages.map(m => m.senderId),
    ]);

    // Get last message and unread count for each conversation
    const threads = await Promise.all(
      Array.from(partnerIds).map(async (partnerId) => {
        const [lastMessage, unreadCount, partner] = await Promise.all([
          prisma.message.findFirst({
            where: {
              OR: [
                { senderId: tenantId, recipientId: partnerId },
                { senderId: partnerId, recipientId: tenantId },
              ],
            },
            orderBy: { createdAt: 'desc' },
          }),
          prisma.message.count({
            where: {
              senderId: partnerId,
              recipientId: tenantId,
              isRead: false,
            },
          }),
          prisma.user.findUnique({
            where: { id: partnerId },
            select: {
              id: true,
              name: true,
              avatar: true,
              title: true,
            },
          }),
        ]);

        return {
          partnerId,
          partner,
          lastMessage,
          unreadCount,
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

// POST /api/employer/messages - Send message to candidate
export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { recipientId, subject, content, jobId, inviteId, threadId, isTemplate } = body;

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

    // Check if blocked
    const isBlocked = await prisma.candidateBlock.findUnique({
      where: {
        employerId_candidateId: {
          employerId: tenantId,
          candidateId: recipientId,
        },
      },
    });

    if (isBlocked) {
      return NextResponse.json(
        { error: 'Cannot message blocked candidate' },
        { status: 400 }
      );
    }

    // Create or get thread ID
    let messageThreadId = threadId;
    if (!messageThreadId) {
      // Use a deterministic thread ID based on participants
      const ids = [tenantId, recipientId].sort();
      messageThreadId = `thread_${ids.join('_')}`;
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId: tenantId,
        recipientId,
        threadId: messageThreadId,
        subject,
        content: isTemplate ? content : content.trim(),
        jobId,
        inviteId,
      },
    });

    // Create notification for recipient
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'message_received',
        title: 'New Message',
        message: subject || 'You have received a new message from an employer',
        link: `/dashboard/messages/${tenantId}`,
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

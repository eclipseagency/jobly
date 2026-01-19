import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/superadmin-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET /api/superadmin/notifications - Get notifications for super admin
export async function GET(request: NextRequest) {
  const authResult = await requireSuperAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const where = unreadOnly ? { isRead: false } : {};

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.superAdminNotification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.superAdminNotification.count({ where }),
      prisma.superAdminNotification.count({ where: { isRead: false } }),
    ]);

    return NextResponse.json({
      notifications,
      total,
      unreadCount,
      hasMore: offset + notifications.length < total,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/superadmin/notifications - Mark notifications as read
export async function POST(request: NextRequest) {
  const authResult = await requireSuperAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { action, notificationId, notificationIds } = body;

    if (action === 'mark_read' && notificationId) {
      // Mark single notification as read
      await prisma.superAdminNotification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'mark_all_read') {
      // Mark all notifications as read
      await prisma.superAdminNotification.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'mark_multiple_read' && notificationIds?.length) {
      // Mark multiple notifications as read
      await prisma.superAdminNotification.updateMany({
        where: { id: { in: notificationIds } },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'delete' && notificationId) {
      // Delete single notification
      await prisma.superAdminNotification.delete({
        where: { id: notificationId },
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'delete_all_read') {
      // Delete all read notifications
      await prisma.superAdminNotification.deleteMany({
        where: { isRead: true },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}

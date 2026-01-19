import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// PUT /api/notifications/[id] - Update notification (mark as read)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const notification = await prisma.notification.findFirst({
      where: { id: params.id, userId },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    const body = await request.json();
    const { read } = body;

    const updated = await prisma.notification.update({
      where: { id: params.id },
      data: { read },
    });

    return NextResponse.json({ notification: updated });
  } catch (error) {
    console.error('[Notification] Error updating:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/[id] - Delete notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const notification = await prisma.notification.findFirst({
      where: { id: params.id, userId },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    await prisma.notification.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Notification] Error deleting:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}

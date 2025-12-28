import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// DELETE /api/saved-jobs/[id] - Remove a saved job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the saved job belongs to the user
    const savedJob = await prisma.savedJob.findFirst({
      where: { id, userId },
    });

    if (!savedJob) {
      return NextResponse.json({ error: 'Saved job not found' }, { status: 404 });
    }

    await prisma.savedJob.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing saved job:', error);
    return NextResponse.json(
      { error: 'Failed to remove saved job' },
      { status: 500 }
    );
  }
}

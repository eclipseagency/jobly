import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// PUT /api/employee/career-goals/[id]/milestones/[milestoneId] - Update milestone
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; milestoneId: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify goal ownership
    const goal = await prisma.careerGoal.findFirst({
      where: { id: params.id, userId },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Verify milestone belongs to goal
    const existingMilestone = await prisma.careerMilestone.findFirst({
      where: { id: params.milestoneId, goalId: params.id },
    });

    if (!existingMilestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, dueDate, isCompleted } = body;

    const milestone = await prisma.careerMilestone.update({
      where: { id: params.milestoneId },
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        isCompleted,
        completedAt: isCompleted && !existingMilestone.isCompleted
          ? new Date()
          : isCompleted
            ? existingMilestone.completedAt
            : null,
      },
    });

    return NextResponse.json({ milestone });
  } catch (error) {
    console.error('[Milestone] Error updating:', error);
    return NextResponse.json(
      { error: 'Failed to update milestone' },
      { status: 500 }
    );
  }
}

// DELETE /api/employee/career-goals/[id]/milestones/[milestoneId] - Delete milestone
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; milestoneId: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify goal ownership
    const goal = await prisma.careerGoal.findFirst({
      where: { id: params.id, userId },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    // Verify milestone belongs to goal
    const existingMilestone = await prisma.careerMilestone.findFirst({
      where: { id: params.milestoneId, goalId: params.id },
    });

    if (!existingMilestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    await prisma.careerMilestone.delete({
      where: { id: params.milestoneId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Milestone] Error deleting:', error);
    return NextResponse.json(
      { error: 'Failed to delete milestone' },
      { status: 500 }
    );
  }
}

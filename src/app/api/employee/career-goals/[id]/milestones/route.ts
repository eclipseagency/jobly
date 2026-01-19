import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/employee/career-goals/[id]/milestones - Get milestones for a goal
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const milestones = await prisma.careerMilestone.findMany({
      where: { goalId: params.id },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ milestones });
  } catch (error) {
    console.error('[Milestones] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch milestones' },
      { status: 500 }
    );
  }
}

// POST /api/employee/career-goals/[id]/milestones - Add milestone to goal
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const body = await request.json();
    const { title, description, dueDate } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Get the highest order number
    const lastMilestone = await prisma.careerMilestone.findFirst({
      where: { goalId: params.id },
      orderBy: { order: 'desc' },
    });

    const milestone = await prisma.careerMilestone.create({
      data: {
        goalId: params.id,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        order: (lastMilestone?.order ?? -1) + 1,
      },
    });

    return NextResponse.json({ milestone }, { status: 201 });
  } catch (error) {
    console.error('[Milestones] Error creating:', error);
    return NextResponse.json(
      { error: 'Failed to create milestone' },
      { status: 500 }
    );
  }
}

// PUT /api/employee/career-goals/[id]/milestones - Reorder milestones
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const body = await request.json();
    const { milestoneIds } = body;

    if (!Array.isArray(milestoneIds)) {
      return NextResponse.json(
        { error: 'milestoneIds array required' },
        { status: 400 }
      );
    }

    // Update order for each milestone
    await prisma.$transaction(
      milestoneIds.map((id: string, index: number) =>
        prisma.careerMilestone.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    const milestones = await prisma.careerMilestone.findMany({
      where: { goalId: params.id },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ milestones });
  } catch (error) {
    console.error('[Milestones] Error reordering:', error);
    return NextResponse.json(
      { error: 'Failed to reorder milestones' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/employee/career-goals/[id] - Get a specific career goal
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const goal = await prisma.careerGoal.findFirst({
      where: { id: params.id, userId },
      include: {
        milestones: {
          orderBy: { order: 'asc' },
        },
        skillTargets: true,
      },
    });

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json({ goal });
  } catch (error) {
    console.error('[Career Goal] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch career goal' },
      { status: 500 }
    );
  }
}

// PUT /api/employee/career-goals/[id] - Update a career goal
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
    const existing = await prisma.careerGoal.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      targetRole,
      targetIndustry,
      targetSalary,
      targetCompanies,
      targetDate,
      priority,
      status,
      description,
      motivation,
    } = body;

    const goal = await prisma.careerGoal.update({
      where: { id: params.id },
      data: {
        title,
        targetRole,
        targetIndustry,
        targetSalary: targetSalary ? parseInt(targetSalary) : null,
        targetCompanies: targetCompanies || [],
        targetDate: targetDate ? new Date(targetDate) : null,
        priority,
        status,
        description,
        motivation,
        achievedAt: status === 'achieved' && existing.status !== 'achieved'
          ? new Date()
          : existing.achievedAt,
      },
      include: {
        milestones: true,
        skillTargets: true,
      },
    });

    return NextResponse.json({ goal });
  } catch (error) {
    console.error('[Career Goal] Error updating:', error);
    return NextResponse.json(
      { error: 'Failed to update career goal' },
      { status: 500 }
    );
  }
}

// DELETE /api/employee/career-goals/[id] - Delete a career goal
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
    const existing = await prisma.careerGoal.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    await prisma.careerGoal.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Career Goal] Error deleting:', error);
    return NextResponse.json(
      { error: 'Failed to delete career goal' },
      { status: 500 }
    );
  }
}

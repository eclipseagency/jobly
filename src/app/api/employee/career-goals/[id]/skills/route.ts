import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/employee/career-goals/[id]/skills - Get skill targets for a goal
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

    const skillTargets = await prisma.skillTarget.findMany({
      where: { goalId: params.id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ skillTargets });
  } catch (error) {
    console.error('[Skill Targets] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skill targets' },
      { status: 500 }
    );
  }
}

// POST /api/employee/career-goals/[id]/skills - Add skill target to goal
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
    const { skillName, currentLevel, targetLevel } = body;

    if (!skillName || currentLevel === undefined || targetLevel === undefined) {
      return NextResponse.json(
        { error: 'skillName, currentLevel, and targetLevel are required' },
        { status: 400 }
      );
    }

    if (currentLevel < 0 || currentLevel > 100 || targetLevel < 0 || targetLevel > 100) {
      return NextResponse.json(
        { error: 'Skill levels must be between 0 and 100' },
        { status: 400 }
      );
    }

    const skillTarget = await prisma.skillTarget.create({
      data: {
        goalId: params.id,
        skillName,
        currentLevel,
        targetLevel,
        isAchieved: currentLevel >= targetLevel,
      },
    });

    return NextResponse.json({ skillTarget }, { status: 201 });
  } catch (error) {
    console.error('[Skill Targets] Error creating:', error);
    return NextResponse.json(
      { error: 'Failed to create skill target' },
      { status: 500 }
    );
  }
}

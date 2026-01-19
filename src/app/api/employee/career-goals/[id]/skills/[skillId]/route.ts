import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// PUT /api/employee/career-goals/[id]/skills/[skillId] - Update skill target
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; skillId: string } }
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

    // Verify skill target belongs to goal
    const existingSkill = await prisma.skillTarget.findFirst({
      where: { id: params.skillId, goalId: params.id },
    });

    if (!existingSkill) {
      return NextResponse.json({ error: 'Skill target not found' }, { status: 404 });
    }

    const body = await request.json();
    const { skillName, currentLevel, targetLevel } = body;

    if (currentLevel !== undefined && (currentLevel < 0 || currentLevel > 100)) {
      return NextResponse.json(
        { error: 'Current level must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (targetLevel !== undefined && (targetLevel < 0 || targetLevel > 100)) {
      return NextResponse.json(
        { error: 'Target level must be between 0 and 100' },
        { status: 400 }
      );
    }

    const newCurrentLevel = currentLevel ?? existingSkill.currentLevel;
    const newTargetLevel = targetLevel ?? existingSkill.targetLevel;

    const skillTarget = await prisma.skillTarget.update({
      where: { id: params.skillId },
      data: {
        skillName,
        currentLevel: newCurrentLevel,
        targetLevel: newTargetLevel,
        isAchieved: newCurrentLevel >= newTargetLevel,
        achievedAt: newCurrentLevel >= newTargetLevel && !existingSkill.isAchieved
          ? new Date()
          : existingSkill.achievedAt,
      },
    });

    return NextResponse.json({ skillTarget });
  } catch (error) {
    console.error('[Skill Target] Error updating:', error);
    return NextResponse.json(
      { error: 'Failed to update skill target' },
      { status: 500 }
    );
  }
}

// DELETE /api/employee/career-goals/[id]/skills/[skillId] - Delete skill target
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; skillId: string } }
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

    // Verify skill target belongs to goal
    const existingSkill = await prisma.skillTarget.findFirst({
      where: { id: params.skillId, goalId: params.id },
    });

    if (!existingSkill) {
      return NextResponse.json({ error: 'Skill target not found' }, { status: 404 });
    }

    await prisma.skillTarget.delete({
      where: { id: params.skillId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Skill Target] Error deleting:', error);
    return NextResponse.json(
      { error: 'Failed to delete skill target' },
      { status: 500 }
    );
  }
}

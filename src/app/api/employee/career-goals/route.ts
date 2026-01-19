import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/employee/career-goals - Get all career goals for user
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const goals = await prisma.careerGoal.findMany({
      where: { userId },
      include: {
        milestones: {
          orderBy: { order: 'asc' },
        },
        skillTargets: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate progress for each goal
    const goalsWithProgress = goals.map(goal => {
      const totalMilestones = goal.milestones.length;
      const completedMilestones = goal.milestones.filter(m => m.isCompleted).length;
      const totalSkills = goal.skillTargets.length;
      const achievedSkills = goal.skillTargets.filter(s => s.isAchieved).length;

      let progressPercent = 0;
      if (totalMilestones > 0 || totalSkills > 0) {
        const milestoneProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 50 : 50;
        const skillProgress = totalSkills > 0 ? (achievedSkills / totalSkills) * 50 : 50;
        progressPercent = Math.round(milestoneProgress + skillProgress);
      }

      return {
        ...goal,
        progressPercent,
        stats: {
          totalMilestones,
          completedMilestones,
          totalSkills,
          achievedSkills,
        },
      };
    });

    return NextResponse.json({ goals: goalsWithProgress });
  } catch (error) {
    console.error('[Career Goals] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch career goals' },
      { status: 500 }
    );
  }
}

// POST /api/employee/career-goals - Create a new career goal
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      description,
      motivation,
      milestones,
      skillTargets,
    } = body;

    if (!title || !targetRole) {
      return NextResponse.json(
        { error: 'Title and target role are required' },
        { status: 400 }
      );
    }

    const goal = await prisma.careerGoal.create({
      data: {
        userId,
        title,
        targetRole,
        targetIndustry,
        targetSalary: targetSalary ? parseInt(targetSalary) : null,
        targetCompanies: targetCompanies || [],
        targetDate: targetDate ? new Date(targetDate) : null,
        priority: priority || 'medium',
        description,
        motivation,
        milestones: milestones?.length > 0 ? {
          create: milestones.map((m: any, index: number) => ({
            title: m.title,
            description: m.description,
            dueDate: m.dueDate ? new Date(m.dueDate) : null,
            order: index,
          })),
        } : undefined,
        skillTargets: skillTargets?.length > 0 ? {
          create: skillTargets.map((s: any) => ({
            skillName: s.skillName,
            currentLevel: s.currentLevel,
            targetLevel: s.targetLevel,
          })),
        } : undefined,
      },
      include: {
        milestones: true,
        skillTargets: true,
      },
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error('[Career Goals] Error creating:', error);
    return NextResponse.json(
      { error: 'Failed to create career goal' },
      { status: 500 }
    );
  }
}

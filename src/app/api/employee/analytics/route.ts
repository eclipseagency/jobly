import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/employee/analytics - Get application analytics for job seeker
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        skills: true,
        yearsOfExp: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get application statistics
    const [
      totalApplications,
      statusCounts,
      recentApplications,
      profileViews,
      savedJobsCount,
      interviewsCount,
    ] = await Promise.all([
      // Total applications
      prisma.application.count({ where: { userId } }),

      // Applications by status
      prisma.application.groupBy({
        by: ['status'],
        where: { userId },
        _count: true,
      }),

      // Recent applications with job details
      prisma.application.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              tenant: { select: { name: true, logo: true } },
            },
          },
        },
      }),

      // Profile views in last 30 days
      prisma.profileView.count({
        where: {
          viewedId: userId,
          viewedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),

      // Saved jobs
      prisma.savedJob.count({ where: { userId } }),

      // Interviews
      prisma.interviewInvite.count({
        where: { candidateId: userId, status: 'accepted' },
      }),
    ]);

    // Calculate status breakdown
    const statusBreakdown: Record<string, number> = {
      new: 0,
      shortlisted: 0,
      reviewing: 0,
      interviewed: 0,
      offered: 0,
      rejected: 0,
      hired: 0,
    };

    statusCounts.forEach(item => {
      statusBreakdown[item.status] = item._count;
    });

    // Calculate response rate (applications that got a response vs total)
    const respondedCount = totalApplications - statusBreakdown.new;
    const responseRate = totalApplications > 0 ? (respondedCount / totalApplications) * 100 : 0;

    // Calculate interview rate
    const interviewRate = totalApplications > 0
      ? ((statusBreakdown.interviewed + statusBreakdown.offered + statusBreakdown.hired) / totalApplications) * 100
      : 0;

    // Calculate offer rate
    const offerRate = totalApplications > 0
      ? ((statusBreakdown.offered + statusBreakdown.hired) / totalApplications) * 100
      : 0;

    // Get application trends (last 12 weeks)
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

    const weeklyApplications = await prisma.application.groupBy({
      by: ['createdAt'],
      where: {
        userId,
        createdAt: { gte: twelveWeeksAgo },
      },
      _count: true,
    });

    // Group by week
    const weeklyTrends: { week: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7 + 7));
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - (i * 7));
      weekEnd.setHours(23, 59, 59, 999);

      const count = weeklyApplications.filter(app => {
        const date = new Date(app.createdAt);
        return date >= weekStart && date <= weekEnd;
      }).length;

      weeklyTrends.push({
        week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count,
      });
    }

    // Get job match insights (top industries/companies that responded)
    const respondedApplications = await prisma.application.findMany({
      where: {
        userId,
        status: { notIn: ['new', 'rejected'] },
      },
      include: {
        job: {
          include: {
            tenant: { select: { industry: true, name: true } },
          },
        },
      },
    });

    const industrySuccess: Record<string, number> = {};
    respondedApplications.forEach(app => {
      const industry = app.job.tenant.industry || 'Other';
      industrySuccess[industry] = (industrySuccess[industry] || 0) + 1;
    });

    const topIndustries = Object.entries(industrySuccess)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([industry, count]) => ({ industry, count }));

    // Profile completeness
    const profileFields = [
      user.name,
      user.skills && user.skills.length > 0,
      user.yearsOfExp,
    ];
    const completedFields = profileFields.filter(Boolean).length;
    const profileCompleteness = Math.round((completedFields / 10) * 100); // Assuming 10 total fields

    return NextResponse.json({
      summary: {
        totalApplications,
        responseRate: Math.round(responseRate),
        interviewRate: Math.round(interviewRate),
        offerRate: Math.round(offerRate),
        profileViews,
        savedJobs: savedJobsCount,
        interviews: interviewsCount,
      },
      statusBreakdown,
      recentApplications: recentApplications.map(app => ({
        id: app.id,
        status: app.status,
        appliedAt: app.createdAt,
        job: {
          id: app.job.id,
          title: app.job.title,
          company: app.job.tenant.name,
          logo: app.job.tenant.logo,
        },
      })),
      trends: weeklyTrends,
      insights: {
        topIndustries,
        profileCompleteness,
        memberSince: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

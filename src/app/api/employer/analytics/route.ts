import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/employer/analytics - Get hiring analytics for employer
export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Calculate date range
    const now = new Date();
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    // Get all jobs for this employer
    const jobs = await prisma.job.findMany({
      where: { tenantId },
      select: {
        id: true,
        title: true,
        isActive: true,
        createdAt: true,
        applications: {
          where: {
            createdAt: { gte: startDate },
          },
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    // Aggregate statistics
    let totalApplications = 0;
    let totalInterviewed = 0;
    let totalOffered = 0;
    let totalHired = 0;

    const jobPerformance = jobs.map(job => {
      const apps = job.applications;
      const interviewed = apps.filter(a =>
        ['interviewed', 'offered', 'hired'].includes(a.status)
      ).length;
      const offered = apps.filter(a =>
        ['offered', 'hired'].includes(a.status)
      ).length;
      const hired = apps.filter(a => a.status === 'hired').length;

      totalApplications += apps.length;
      totalInterviewed += interviewed;
      totalOffered += offered;
      totalHired += hired;

      return {
        id: job.id,
        title: job.title,
        isActive: job.isActive,
        applications: apps.length,
        interviewed,
        offered,
        hired,
        conversionRate: apps.length > 0
          ? Math.round((interviewed / apps.length) * 100)
          : 0,
      };
    });

    // Sort by applications (most active first)
    jobPerformance.sort((a, b) => b.applications - a.applications);

    // Calculate rates
    const interviewRate = totalApplications > 0
      ? Math.round((totalInterviewed / totalApplications) * 100)
      : 0;
    const offerRate = totalApplications > 0
      ? Math.round((totalOffered / totalApplications) * 100)
      : 0;
    const hireRate = totalApplications > 0
      ? Math.round((totalHired / totalApplications) * 100)
      : 0;

    // Get application trend (group by date)
    const applicationTrend: Record<string, number> = {};
    jobs.forEach(job => {
      job.applications.forEach(app => {
        const date = app.createdAt.toISOString().split('T')[0];
        applicationTrend[date] = (applicationTrend[date] || 0) + 1;
      });
    });

    // Convert to sorted array
    const trendData = Object.entries(applicationTrend)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get status breakdown
    const statusBreakdown = {
      new: 0,
      reviewing: 0,
      shortlisted: 0,
      interviewed: 0,
      offered: 0,
      hired: 0,
      rejected: 0,
    };

    jobs.forEach(job => {
      job.applications.forEach(app => {
        const status = app.status as keyof typeof statusBreakdown;
        if (status in statusBreakdown) {
          statusBreakdown[status]++;
        }
      });
    });

    // Summary stats
    const summary = {
      totalJobs: jobs.length,
      activeJobs: jobs.filter(j => j.isActive).length,
      totalApplications,
      interviewRate,
      offerRate,
      hireRate,
      avgApplicationsPerJob: jobs.length > 0
        ? Math.round(totalApplications / jobs.length)
        : 0,
    };

    return NextResponse.json({
      summary,
      jobPerformance: jobPerformance.slice(0, 10), // Top 10 jobs
      applicationTrend: trendData,
      statusBreakdown,
      timeRange,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

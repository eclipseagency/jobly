import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/superadmin-auth';

export const dynamic = 'force-dynamic';

// GET /api/superadmin/dashboard - Get dashboard statistics
export async function GET(request: NextRequest) {
  const authResult = requireSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get counts in parallel
    const [
      totalUsers,
      totalEmployers,
      totalJobSeekers,
      totalJobs,
      pendingJobs,
      approvedJobs,
      rejectedJobs,
      totalApplications,
      totalTenants,
      suspendedUsers,
      suspendedTenants,
      newUsersThisWeek,
      newUsersThisMonth,
      newJobsThisWeek,
      newApplicationsThisWeek,
      recentUsers,
      recentJobs,
      recentApplications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'EMPLOYER' } }),
      prisma.user.count({ where: { role: 'EMPLOYEE' } }),
      prisma.job.count(),
      prisma.job.count({ where: { approvalStatus: 'PENDING' } }),
      prisma.job.count({ where: { approvalStatus: 'APPROVED' } }),
      prisma.job.count({ where: { approvalStatus: 'REJECTED' } }),
      prisma.application.count(),
      prisma.tenant.count(),
      prisma.user.count({ where: { isSuspended: true } }),
      prisma.tenant.count({ where: { isSuspended: true } }),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.job.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.application.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          isActive: true,
          isSuspended: true,
        },
      }),
      prisma.job.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          approvalStatus: true,
          isActive: true,
          createdAt: true,
          tenant: { select: { name: true } },
        },
      }),
      prisma.application.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
          job: { select: { title: true, tenant: { select: { name: true } } } },
        },
      }),
    ]);

    // Calculate growth percentages
    const userGrowthPercent = totalUsers > 0 ? Math.round((newUsersThisMonth / totalUsers) * 100) : 0;

    return NextResponse.json({
      stats: {
        users: {
          total: totalUsers,
          employers: totalEmployers,
          jobSeekers: totalJobSeekers,
          suspended: suspendedUsers,
          newThisWeek: newUsersThisWeek,
          newThisMonth: newUsersThisMonth,
          growthPercent: userGrowthPercent,
        },
        jobs: {
          total: totalJobs,
          pending: pendingJobs,
          approved: approvedJobs,
          rejected: rejectedJobs,
          newThisWeek: newJobsThisWeek,
        },
        applications: {
          total: totalApplications,
          newThisWeek: newApplicationsThisWeek,
        },
        tenants: {
          total: totalTenants,
          suspended: suspendedTenants,
        },
      },
      recentActivity: {
        users: recentUsers,
        jobs: recentJobs.map(job => ({
          ...job,
          company: job.tenant.name,
        })),
        applications: recentApplications.map(app => ({
          id: app.id,
          status: app.status,
          createdAt: app.createdAt,
          applicant: app.user.name || app.user.email,
          jobTitle: app.job.title,
          company: app.job.tenant.name,
        })),
      },
    });
  } catch (error) {
    console.error('[SuperAdmin Dashboard] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard' },
      { status: 500 }
    );
  }
}

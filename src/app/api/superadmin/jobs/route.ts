import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSuperAdmin, hasPermission } from '@/lib/superadmin-auth';

export const dynamic = 'force-dynamic';

// GET /api/superadmin/jobs - List all jobs with filters
export async function GET(request: NextRequest) {
  const authResult = requireSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;
  const { admin } = authResult;

  if (!hasPermission(admin, 'canApproveJobs')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status'); // PENDING, APPROVED, REJECTED
    const isActive = searchParams.get('isActive');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { tenant: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.approvalStatus = status;
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          locationType: true,
          salary: true,
          jobType: true,
          isActive: true,
          approvalStatus: true,
          approvedAt: true,
          approvedBy: true,
          rejectionReason: true,
          isFeatured: true,
          featuredUntil: true,
          createdAt: true,
          expiresAt: true,
          tenant: {
            select: {
              id: true,
              name: true,
              logo: true,
              isVerified: true,
              isSuspended: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({
      jobs: jobs.map(job => ({
        ...job,
        company: job.tenant.name,
        companyLogo: job.tenant.logo,
        companyVerified: job.tenant.isVerified,
        companySuspended: job.tenant.isSuspended,
        applicationsCount: job._count.applications,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[SuperAdmin Jobs] List error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

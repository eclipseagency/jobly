import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSuperAdmin, hasPermission } from '@/lib/superadmin-auth';

export const dynamic = 'force-dynamic';

// GET /api/superadmin/employers - List all employers/tenants
export async function GET(request: NextRequest) {
  const authResult = requireSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;
  const { admin } = authResult;

  if (!hasPermission(admin, 'canManageEmployers')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status'); // active, suspended, unverified
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status === 'active') {
      where.isSuspended = false;
    } else if (status === 'suspended') {
      where.isSuspended = true;
    } else if (status === 'unverified') {
      where.isVerified = false;
    } else if (status === 'verified') {
      where.isVerified = true;
    }

    const [employers, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          email: true,
          phone: true,
          website: true,
          industry: true,
          size: true,
          city: true,
          country: true,
          isVerified: true,
          verifiedAt: true,
          isSuspended: true,
          suspendedAt: true,
          suspensionReason: true,
          createdAt: true,
          _count: {
            select: {
              users: true,
              jobs: true,
            },
          },
        },
      }),
      prisma.tenant.count({ where }),
    ]);

    // Get additional stats
    const employersWithStats = await Promise.all(
      employers.map(async (employer) => {
        const [activeJobs, totalApplications] = await Promise.all([
          prisma.job.count({
            where: {
              tenantId: employer.id,
              isActive: true,
              approvalStatus: 'APPROVED',
            },
          }),
          prisma.application.count({
            where: {
              job: { tenantId: employer.id },
            },
          }),
        ]);

        return {
          ...employer,
          usersCount: employer._count.users,
          jobsCount: employer._count.jobs,
          activeJobsCount: activeJobs,
          totalApplications,
        };
      })
    );

    return NextResponse.json({
      employers: employersWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[SuperAdmin Employers] List error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employers' },
      { status: 500 }
    );
  }
}

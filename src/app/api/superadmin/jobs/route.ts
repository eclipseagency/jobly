import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSuperAdmin, hasPermission } from '@/lib/superadmin-auth';
import { JobApprovalStatus } from '@prisma/client';

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
          requirements: true,
          location: true,
          locationType: true,
          salary: true,
          jobType: true,
          department: true,
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

// POST /api/superadmin/jobs - Create a new job
export async function POST(request: NextRequest) {
  const authResult = requireSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;
  const { admin } = authResult;

  if (!hasPermission(admin, 'canApproveJobs')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      tenantId,
      title,
      description,
      requirements,
      location,
      locationType,
      salary,
      jobType,
      department,
      autoApprove = true,
    } = body;

    // Validate required fields
    if (!tenantId) {
      return NextResponse.json({ error: 'Company (tenant) is required' }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ error: 'Job title is required' }, { status: 400 });
    }
    if (!description) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Create the job
    const job = await prisma.job.create({
      data: {
        title,
        description,
        requirements,
        location,
        locationType,
        salary,
        jobType,
        department,
        tenantId,
        isActive: true,
        approvalStatus: autoApprove ? JobApprovalStatus.APPROVED : JobApprovalStatus.PENDING,
        approvedAt: autoApprove ? new Date() : null,
        approvedBy: autoApprove ? admin.adminId : null,
      },
      include: {
        tenant: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      job: {
        ...job,
        company: job.tenant.name,
      },
      message: autoApprove ? 'Job created and approved' : 'Job created (pending approval)',
    }, { status: 201 });
  } catch (error) {
    console.error('[SuperAdmin Jobs] Create error:', error);
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}

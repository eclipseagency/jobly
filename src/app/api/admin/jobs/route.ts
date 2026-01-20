import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { JobApprovalStatus } from '@prisma/client';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Verify admin token
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { adminId: string; email: string };
    const admin = await prisma.superAdmin.findUnique({
      where: { id: decoded.adminId },
    });
    return admin;
  } catch {
    return null;
  }
}

// GET /api/admin/jobs - List all jobs
export async function GET(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.approvalStatus = status as JobApprovalStatus;
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
              isVerified: true,
            },
          },
          _count: {
            select: { applications: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    // Get stats
    const stats = await prisma.job.groupBy({
      by: ['approvalStatus'],
      _count: true,
    });

    const statsMap = {
      total,
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    stats.forEach((s) => {
      if (s.approvalStatus === 'PENDING') statsMap.pending = s._count;
      if (s.approvalStatus === 'APPROVED') statsMap.approved = s._count;
      if (s.approvalStatus === 'REJECTED') statsMap.rejected = s._count;
    });

    return NextResponse.json({
      jobs: jobs.map((job) => ({
        id: job.id,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        location: job.location,
        locationType: job.locationType,
        salary: job.salary,
        jobType: job.jobType,
        department: job.department,
        isActive: job.isActive,
        approvalStatus: job.approvalStatus,
        isFeatured: job.isFeatured,
        createdAt: job.createdAt,
        tenant: job.tenant,
        applicationsCount: job._count.applications,
      })),
      stats: statsMap,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

// POST /api/admin/jobs - Create a new job
export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      description,
      requirements,
      location,
      locationType,
      salary,
      jobType,
      department,
      tenantId,
      isActive = true,
      isFeatured = false,
    } = body;

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // If no tenantId provided, get the first tenant or create a default one
    let finalTenantId = tenantId;
    if (!finalTenantId) {
      const existingTenant = await prisma.tenant.findFirst({
        orderBy: { createdAt: 'asc' },
      });

      if (existingTenant) {
        finalTenantId = existingTenant.id;
      } else {
        // Create a default tenant for admin-created jobs
        const defaultTenant = await prisma.tenant.create({
          data: {
            name: 'Jobly Featured',
            slug: 'jobly-featured',
            description: 'Featured job postings by Jobly',
            isVerified: true,
          },
        });
        finalTenantId = defaultTenant.id;
      }
    }

    // Create the job (auto-approved since created by admin)
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
        tenantId: finalTenantId,
        isActive,
        isFeatured,
        approvalStatus: JobApprovalStatus.APPROVED,
        approvedAt: new Date(),
        approvedBy: admin.id,
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        title: job.title,
        tenant: job.tenant,
      },
    });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}

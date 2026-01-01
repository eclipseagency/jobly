import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Helper function to ensure tenant exists
async function ensureTenantExists(tenantId: string, userId?: string): Promise<string> {
  // Check if tenant exists
  const existingTenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (existingTenant) {
    return tenantId;
  }

  // If tenant doesn't exist (localStorage fallback case), create one
  // Generate a unique slug
  const baseSlug = `company-${tenantId.substring(0, 8)}`;
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.tenant.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix++;
  }

  const newTenant = await prisma.tenant.create({
    data: {
      id: tenantId, // Use the same ID from localStorage
      name: 'My Company',
      slug,
    },
  });

  // If we have a userId, link the user to this tenant
  if (userId) {
    await prisma.user.updateMany({
      where: { id: userId },
      data: { tenantId: newTenant.id },
    });
  }

  return newTenant.id;
}

// GET /api/employer/jobs - List employer's job postings
export async function GET(request: NextRequest) {
  try {
    // TODO: Get tenantId from auth session
    const tenantId = request.headers.get('x-tenant-id');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const jobs = await prisma.job.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      jobs: jobs.map((job) => ({
        id: job.id,
        title: job.title,
        description: job.description,
        location: job.location,
        locationType: job.locationType,
        salary: job.salary,
        jobType: job.jobType,
        department: job.department,
        isActive: job.isActive,
        createdAt: job.createdAt,
        expiresAt: job.expiresAt,
        applicationsCount: job._count.applications,
      })),
    });
  } catch (error) {
    console.error('Error fetching employer jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

// POST /api/employer/jobs - Create new job posting
export async function POST(request: NextRequest) {
  try {
    const tenantIdHeader = request.headers.get('x-tenant-id');
    const userId = request.headers.get('x-user-id');

    if (!tenantIdHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, requirements, location, locationType, salary, jobType, department, expiresAt } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Ensure tenant exists (creates one if using localStorage fallback)
    const tenantId = await ensureTenantExists(tenantIdHeader, userId || undefined);

    const job = await prisma.job.create({
      data: {
        tenantId,
        title,
        description,
        requirements,
        location,
        locationType,
        salary,
        jobType,
        department,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      },
    });

    return NextResponse.json({ job });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}

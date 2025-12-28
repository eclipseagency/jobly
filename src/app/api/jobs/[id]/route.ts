import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/jobs/[id] - Get a single job by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            logo: true,
            city: true,
            isVerified: true,
            industry: true,
            size: true,
            website: true,
            description: true,
          },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      job: {
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
        createdAt: job.createdAt,
        expiresAt: job.expiresAt,
        company: {
          id: job.tenant.id,
          name: job.tenant.name,
          logo: job.tenant.logo,
          location: job.tenant.city,
          isVerified: job.tenant.isVerified,
          industry: job.tenant.industry,
          size: job.tenant.size,
          website: job.tenant.website,
          description: job.tenant.description,
        },
        applicationsCount: job._count.applications,
      },
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    );
  }
}

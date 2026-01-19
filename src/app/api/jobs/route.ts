import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/jobs - List all active jobs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const location = searchParams.get('location') || '';
    const jobType = searchParams.get('jobType') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where = {
      isActive: true,
      approvalStatus: 'APPROVED',
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(location && { location: { contains: location, mode: 'insensitive' as const } }),
      ...(jobType && { jobType }),
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              logo: true,
              city: true,
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
        createdAt: job.createdAt,
        company: {
          id: job.tenant.id,
          name: job.tenant.name,
          logo: job.tenant.logo,
          location: job.tenant.city,
          isVerified: job.tenant.isVerified,
        },
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
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

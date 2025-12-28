import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/applications - List user's applications
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from auth session
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const applications = await prisma.application.findMany({
      where: { userId },
      include: {
        job: {
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                logo: true,
                city: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      applications: applications.map((app) => ({
        id: app.id,
        status: app.status,
        coverLetter: app.coverLetter,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        job: {
          id: app.job.id,
          title: app.job.title,
          location: app.job.location,
          jobType: app.job.jobType,
          salary: app.job.salary,
          company: {
            id: app.job.tenant.id,
            name: app.job.tenant.name,
            logo: app.job.tenant.logo,
            location: app.job.tenant.city,
          },
        },
      })),
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

// POST /api/applications - Create new application
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { jobId, coverLetter, resumeUrl } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Check if already applied
    const existing = await prisma.application.findUnique({
      where: {
        userId_jobId: { userId, jobId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 400 }
      );
    }

    const application = await prisma.application.create({
      data: {
        userId,
        jobId,
        coverLetter,
        resumeUrl,
        status: 'pending',
      },
      include: {
        job: {
          include: {
            tenant: {
              select: { name: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      application: {
        id: application.id,
        status: application.status,
        createdAt: application.createdAt,
        job: {
          id: application.job.id,
          title: application.job.title,
          company: application.job.tenant.name,
        },
      },
    });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}

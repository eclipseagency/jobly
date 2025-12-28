import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/employer/applicants - List all applicants for employer's jobs
export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const applications = await prisma.application.findMany({
      where: {
        job: {
          tenantId,
          ...(jobId && { id: jobId }),
        },
        ...(status && { status }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            title: true,
            location: true,
            skills: true,
            resumeUrl: true,
            linkedinUrl: true,
            portfolioUrl: true,
            yearsOfExp: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            department: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      applicants: applications.map((app) => ({
        id: app.id,
        status: app.status,
        coverLetter: app.coverLetter,
        resumeUrl: app.resumeUrl,
        appliedAt: app.createdAt,
        updatedAt: app.updatedAt,
        candidate: {
          id: app.user.id,
          name: app.user.name,
          email: app.user.email,
          avatar: app.user.avatar,
          title: app.user.title,
          location: app.user.location,
          skills: app.user.skills,
          resumeUrl: app.user.resumeUrl,
          linkedinUrl: app.user.linkedinUrl,
          portfolioUrl: app.user.portfolioUrl,
          yearsOfExp: app.user.yearsOfExp,
        },
        job: {
          id: app.job.id,
          title: app.job.title,
          department: app.job.department,
        },
      })),
    });
  } catch (error) {
    console.error('Error fetching applicants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applicants' },
      { status: 500 }
    );
  }
}

// PATCH /api/employer/applicants - Update application status
export async function PATCH(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { applicationId, status, notes } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: 'Application ID and status are required' },
        { status: 400 }
      );
    }

    // Verify the application belongs to the employer's job
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        job: { tenantId },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status,
        ...(notes && { notes }),
      },
    });

    return NextResponse.json({ application: updated });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}

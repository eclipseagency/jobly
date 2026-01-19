import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Pipeline stages
const PIPELINE_STAGES = [
  { id: 'new', label: 'New', color: 'blue' },
  { id: 'reviewing', label: 'Reviewing', color: 'yellow' },
  { id: 'shortlisted', label: 'Shortlisted', color: 'purple' },
  { id: 'interview', label: 'Interview', color: 'cyan' },
  { id: 'offered', label: 'Offered', color: 'green' },
  { id: 'hired', label: 'Hired', color: 'emerald' },
  { id: 'rejected', label: 'Rejected', color: 'red' },
];

// GET /api/employer/applicants/pipeline - Get applicants in pipeline view
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const tenantId = request.headers.get('x-tenant-id');

    if (!userId || !tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    // Build where clause
    const whereClause: Record<string, unknown> = {
      job: {
        tenantId,
      },
    };

    if (jobId) {
      whereClause.jobId = jobId;
    }

    // Get all applications
    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            title: true,
            skills: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            tenant: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Group by status
    const pipeline: Record<string, Array<{
      id: string;
      userId: string;
      name: string | null;
      email: string;
      avatar: string | null;
      title: string | null;
      skills: string[];
      jobId: string;
      jobTitle: string;
      company: string | null;
      status: string;
      createdAt: string;
      updatedAt: string;
    }>> = {};

    PIPELINE_STAGES.forEach((stage) => {
      pipeline[stage.id] = [];
    });

    applications.forEach((app) => {
      const status = app.status.toLowerCase().replace(' ', '_');
      const stage = PIPELINE_STAGES.find((s) => s.id === status) || PIPELINE_STAGES[0];

      pipeline[stage.id].push({
        id: app.id,
        userId: app.userId,
        name: app.user.name,
        email: app.user.email,
        avatar: app.user.avatar,
        title: app.user.title,
        skills: app.user.skills,
        jobId: app.job.id,
        jobTitle: app.job.title,
        company: app.job.tenant?.name || null,
        status: app.status,
        createdAt: app.createdAt.toISOString(),
        updatedAt: app.updatedAt.toISOString(),
      });
    });

    // Get jobs for filter dropdown
    const jobs = await prisma.job.findMany({
      where: { tenantId },
      select: {
        id: true,
        title: true,
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate stats
    const stats = {
      total: applications.length,
      byStage: Object.fromEntries(
        PIPELINE_STAGES.map((stage) => [stage.id, pipeline[stage.id].length])
      ),
    };

    return NextResponse.json({
      pipeline,
      stages: PIPELINE_STAGES,
      jobs: jobs.map((j) => ({
        id: j.id,
        title: j.title,
        applicantCount: j._count.applications,
      })),
      stats,
    });
  } catch (error) {
    console.error('[Pipeline] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pipeline data' },
      { status: 500 }
    );
  }
}

// PUT /api/employer/applicants/pipeline - Move applicant to new stage
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const tenantId = request.headers.get('x-tenant-id');

    if (!userId || !tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { applicationId, newStatus } = body;

    if (!applicationId || !newStatus) {
      return NextResponse.json(
        { error: 'applicationId and newStatus are required' },
        { status: 400 }
      );
    }

    // Verify the application belongs to tenant's job
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        job: { tenantId },
      },
      include: {
        job: { select: { id: true, title: true } },
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Validate new status
    const validStage = PIPELINE_STAGES.find((s) => s.id === newStatus.toLowerCase());
    if (!validStage) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Format status for database (capitalize first letter)
    const formattedStatus = validStage.label;

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: formattedStatus,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create notification for the applicant
    await prisma.notification.create({
      data: {
        userId: updatedApplication.userId,
        type: 'application_status',
        title: 'Application Status Updated',
        message: `Your application for ${application.job.title} has been moved to ${formattedStatus}`,
        link: `/dashboard/applications/${updatedApplication.id}`,
      },
    });

    return NextResponse.json({
      application: {
        id: updatedApplication.id,
        status: updatedApplication.status,
        updatedAt: updatedApplication.updatedAt,
      },
      message: `Application moved to ${formattedStatus}`,
    });
  } catch (error) {
    console.error('[Pipeline] Error updating:', error);
    return NextResponse.json(
      { error: 'Failed to update application status' },
      { status: 500 }
    );
  }
}

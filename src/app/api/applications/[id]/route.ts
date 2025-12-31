import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/applications/[id] - Get application details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const application = await prisma.application.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        job: {
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                city: true,
                country: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Build timeline based on application status and dates
    const timeline = buildTimeline(application);

    return NextResponse.json({
      application: {
        id: application.id,
        status: application.status,
        coverLetter: application.coverLetter,
        resumeUrl: application.resumeUrl,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
        job: {
          id: application.job.id,
          title: application.job.title,
          description: application.job.description,
          requirements: application.job.requirements,
          location: application.job.location,
          locationType: application.job.locationType,
          salary: application.job.salary,
          jobType: application.job.jobType,
          department: application.job.department,
          isActive: application.job.isActive,
          company: application.job.tenant,
        },
        timeline,
      },
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

// POST /api/applications/[id] - Withdraw application
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (action !== 'withdraw') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Find the application and verify ownership
    const application = await prisma.application.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check if application can be withdrawn
    if (application.status === 'withdrawn') {
      return NextResponse.json(
        { error: 'Application has already been withdrawn' },
        { status: 400 }
      );
    }

    if (application.status === 'rejected') {
      return NextResponse.json(
        { error: 'Cannot withdraw a rejected application' },
        { status: 400 }
      );
    }

    // Update application status to withdrawn
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: { status: 'withdrawn' },
    });

    return NextResponse.json({
      success: true,
      application: updatedApplication,
    });
  } catch (error) {
    console.error('Error withdrawing application:', error);
    return NextResponse.json(
      { error: 'Failed to withdraw application' },
      { status: 500 }
    );
  }
}

interface ApplicationWithDates {
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

function buildTimeline(application: ApplicationWithDates) {
  const timeline = [
    {
      status: 'submitted',
      label: 'Application Submitted',
      date: application.createdAt,
      completed: true,
    },
  ];

  const statusOrder = ['pending', 'reviewing', 'interviewed', 'offered', 'rejected', 'withdrawn'];
  const currentStatusIndex = statusOrder.indexOf(application.status);

  if (currentStatusIndex >= 1 || application.status === 'reviewing') {
    timeline.push({
      status: 'reviewing',
      label: 'Application Under Review',
      date: application.status === 'reviewing' ? application.updatedAt : null,
      completed: currentStatusIndex >= 1,
    } as typeof timeline[0]);
  }

  if (currentStatusIndex >= 2 || application.status === 'interviewed') {
    timeline.push({
      status: 'interviewed',
      label: 'Interview Stage',
      date: application.status === 'interviewed' ? application.updatedAt : null,
      completed: currentStatusIndex >= 2,
    } as typeof timeline[0]);
  }

  if (application.status === 'offered') {
    timeline.push({
      status: 'offered',
      label: 'Offer Received',
      date: application.updatedAt,
      completed: true,
    });
  }

  if (application.status === 'rejected') {
    timeline.push({
      status: 'rejected',
      label: 'Application Not Selected',
      date: application.updatedAt,
      completed: true,
    });
  }

  if (application.status === 'withdrawn') {
    timeline.push({
      status: 'withdrawn',
      label: 'Application Withdrawn',
      date: application.updatedAt,
      completed: true,
    });
  }

  return timeline;
}

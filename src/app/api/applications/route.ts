import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Helper to ensure user exists in database
// Returns the actual user ID to use (may be different from input if email already exists)
async function ensureUserExists(userId: string, userName?: string, userEmail?: string): Promise<{ success: boolean; finalUserId: string }> {
  try {
    // First check if user with this ID exists
    const existingUserById = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (existingUserById) {
      return { success: true, finalUserId: userId };
    }

    // User ID doesn't exist - check if email exists (for localStorage users who registered before)
    if (userEmail) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: userEmail },
      });

      if (existingUserByEmail) {
        // Email exists with different ID - use the existing user's ID
        return { success: true, finalUserId: existingUserByEmail.id };
      }

      // Neither ID nor email exists - create new user
      await prisma.user.create({
        data: {
          id: userId,
          email: userEmail,
          name: userName || 'Job Seeker',
          passwordHash: 'localStorage-user', // Placeholder for localStorage users
          role: 'EMPLOYEE',
        },
      });

      return { success: true, finalUserId: userId };
    }

    // No email provided and user doesn't exist - cannot create
    return { success: false, finalUserId: userId };
  } catch (error) {
    console.error('Error ensuring user exists:', error);
    return { success: false, finalUserId: userId };
  }
}

// GET /api/applications - List user's applications
export async function GET(request: NextRequest) {
  try {
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
    const userName = request.headers.get('x-user-name');
    const userEmail = request.headers.get('x-user-email');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to apply for jobs.' },
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

    // Verify job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        tenant: {
          select: { name: true },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found. It may have been removed.' },
        { status: 404 }
      );
    }

    if (!job.isActive) {
      return NextResponse.json(
        { error: 'This job is no longer accepting applications.' },
        { status: 400 }
      );
    }

    // Ensure user exists in database
    const userResult = await ensureUserExists(userId, userName || undefined, userEmail || undefined);
    if (!userResult.success) {
      return NextResponse.json(
        { error: 'Unable to verify your account. Please try logging in again.' },
        { status: 400 }
      );
    }

    // Use the final user ID (may be different if email matched existing user)
    const finalUserId = userResult.finalUserId;

    // Check if already applied
    const existing = await prisma.application.findUnique({
      where: {
        userId_jobId: { userId: finalUserId, jobId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 400 }
      );
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        userId: finalUserId,
        jobId,
        coverLetter: coverLetter || null,
        resumeUrl: resumeUrl || null,
        status: 'pending',
      },
    });

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        status: application.status,
        createdAt: application.createdAt,
        job: {
          id: job.id,
          title: job.title,
          company: job.tenant.name,
        },
      },
    });
  } catch (error) {
    console.error('Error creating application:', error);

    // Provide more specific error messages
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('Foreign key constraint')) {
      return NextResponse.json(
        { error: 'Unable to process application. Please ensure you are logged in.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    );
  }
}

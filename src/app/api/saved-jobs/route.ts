import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

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
          passwordHash: 'localStorage-user',
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

// GET /api/saved-jobs - List user's saved jobs
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const savedJobs = await prisma.savedJob.findMany({
      where: { userId },
      include: {
        job: {
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                logo: true,
                isVerified: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      savedJobs: savedJobs.map((sj) => ({
        id: sj.id,
        savedAt: sj.createdAt,
        job: {
          id: sj.job.id,
          title: sj.job.title,
          description: sj.job.description,
          location: sj.job.location,
          locationType: sj.job.locationType,
          salary: sj.job.salary,
          jobType: sj.job.jobType,
          createdAt: sj.job.createdAt,
          isActive: sj.job.isActive,
          company: {
            id: sj.job.tenant.id,
            name: sj.job.tenant.name,
            logo: sj.job.tenant.logo,
            isVerified: sj.job.tenant.isVerified,
          },
        },
      })),
    });
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved jobs' },
      { status: 500 }
    );
  }
}

// POST /api/saved-jobs - Save a job
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userName = request.headers.get('x-user-name');
    const userEmail = request.headers.get('x-user-email');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Verify job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
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

    // Check if already saved
    const existing = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: { userId: finalUserId, jobId },
      },
    });

    if (existing) {
      return NextResponse.json({
        savedJob: {
          id: existing.id,
          jobId: existing.jobId,
          savedAt: existing.createdAt,
        },
        message: 'Job already saved',
      });
    }

    const savedJob = await prisma.savedJob.create({
      data: { userId: finalUserId, jobId },
    });

    return NextResponse.json({
      success: true,
      savedJob: {
        id: savedJob.id,
        jobId: savedJob.jobId,
        savedAt: savedJob.createdAt,
      },
    });
  } catch (error) {
    console.error('Error saving job:', error);
    return NextResponse.json(
      { error: 'Failed to save job' },
      { status: 500 }
    );
  }
}

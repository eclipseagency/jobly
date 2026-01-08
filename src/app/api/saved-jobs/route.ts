import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Helper to ensure user exists in database
async function ensureUserExists(userId: string, userName?: string, userEmail?: string): Promise<boolean> {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (existingUser) {
      return true;
    }

    // Create user if they don't exist (localStorage fallback users)
    if (!userEmail) {
      return false;
    }

    await prisma.user.create({
      data: {
        id: userId,
        email: userEmail,
        name: userName || 'Job Seeker',
        passwordHash: 'localStorage-user',
        role: 'EMPLOYEE',
      },
    });

    return true;
  } catch (error) {
    console.error('Error ensuring user exists:', error);
    return false;
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
    const userExists = await ensureUserExists(userId, userName || undefined, userEmail || undefined);
    if (!userExists) {
      return NextResponse.json(
        { error: 'Unable to verify your account. Please try logging in again.' },
        { status: 400 }
      );
    }

    // Check if already saved
    const existing = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: { userId, jobId },
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
      data: { userId, jobId },
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

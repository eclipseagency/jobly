import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  processScreeningApplication,
  ScreeningForm,
  ScreeningQuestion,
  ScreeningRule,
  AnswerSubmission,
  AnswerValue,
} from '@/lib/screening';

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

// Helper to convert DB screening form to internal type
function convertToScreeningForm(dbForm: {
  id: string;
  jobId: string;
  version: number;
  isActive: boolean;
  title: string | null;
  description: string | null;
  shortlistThreshold: number | null;
  passingThreshold: number | null;
  questions: Array<{
    id: string;
    questionText: string;
    questionType: string;
    order: number;
    isRequired: boolean;
    config: unknown;
    helpText: string | null;
    placeholder: string | null;
    rules: Array<{
      id: string;
      ruleType: string;
      operator: string;
      value: unknown;
      scoreValue: number | null;
      message: string | null;
      priority: number;
      isActive: boolean;
    }>;
  }>;
}): ScreeningForm {
  return {
    id: dbForm.id,
    jobId: dbForm.jobId,
    version: dbForm.version,
    isActive: dbForm.isActive,
    title: dbForm.title ?? undefined,
    description: dbForm.description ?? undefined,
    shortlistThreshold: dbForm.shortlistThreshold ?? undefined,
    passingThreshold: dbForm.passingThreshold ?? undefined,
    questions: dbForm.questions.map((q): ScreeningQuestion => ({
      id: q.id,
      questionText: q.questionText,
      questionType: q.questionType as ScreeningQuestion['questionType'],
      order: q.order,
      isRequired: q.isRequired,
      config: q.config as ScreeningQuestion['config'],
      helpText: q.helpText ?? undefined,
      placeholder: q.placeholder ?? undefined,
      rules: q.rules.map((r): ScreeningRule => ({
        id: r.id,
        ruleType: r.ruleType as ScreeningRule['ruleType'],
        operator: r.operator as ScreeningRule['operator'],
        value: r.value,
        scoreValue: r.scoreValue ?? undefined,
        message: r.message ?? undefined,
        priority: r.priority,
        isActive: r.isActive,
      })),
    })),
  };
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
    const { jobId, coverLetter, resumeUrl, screeningAnswers } = body;

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

    // Get active screening form if exists
    const dbScreeningForm = await prisma.screeningForm.findFirst({
      where: {
        jobId,
        isActive: true,
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            rules: {
              where: { isActive: true },
              orderBy: { priority: 'asc' },
            },
          },
        },
      },
    });

    let screeningResult = null;
    let applicationStatus = 'new';
    let screeningScore: number | null = null;
    let hasKnockout = false;
    let knockoutReason: string | null = null;

    // Process screening if form exists
    if (dbScreeningForm) {
      // Screening form exists - answers are required
      if (!screeningAnswers || !Array.isArray(screeningAnswers)) {
        return NextResponse.json(
          { error: 'Screening answers are required for this job' },
          { status: 400 }
        );
      }

      // Convert DB form to internal type
      const screeningForm = convertToScreeningForm(dbScreeningForm);

      // Process screening
      const answers: AnswerSubmission[] = screeningAnswers.map((a: { questionId: string; answer: unknown }) => ({
        questionId: a.questionId,
        answer: a.answer as AnswerValue,
      }));

      screeningResult = processScreeningApplication(screeningForm, answers);

      // Check validation errors
      if (!screeningResult.isValid) {
        return NextResponse.json({
          error: 'Screening validation failed',
          validationErrors: screeningResult.validationErrors,
        }, { status: 400 });
      }

      // Set application status based on screening result
      if (screeningResult.hasKnockout) {
        applicationStatus = 'rejected';
        hasKnockout = true;
        knockoutReason = screeningResult.knockoutReason ?? null;
      } else if (screeningResult.recommendedStatus === 'shortlisted') {
        applicationStatus = 'shortlisted';
      } else {
        applicationStatus = 'new';
      }

      screeningScore = screeningResult.totalScore;
    }

    // Create application with screening data in a transaction
    const application = await prisma.$transaction(async (tx) => {
      // Create the application
      const app = await tx.application.create({
        data: {
          userId: finalUserId,
          jobId,
          coverLetter: coverLetter || null,
          resumeUrl: resumeUrl || null,
          status: applicationStatus,
          screeningFormId: dbScreeningForm?.id || null,
          screeningScore,
          hasKnockout,
          knockoutReason,
        },
      });

      // Create screening answers if we have them
      if (dbScreeningForm && screeningResult && screeningAnswers) {
        const answerData = screeningAnswers.map((a: { questionId: string; answer: unknown }) => {
          // Find the result for this question
          const questionResult = screeningResult.answerResults.find(
            r => r.questionId === a.questionId
          );

          return {
            applicationId: app.id,
            questionId: a.questionId,
            answer: a.answer,
            isKnockout: questionResult?.isKnockout ?? false,
            scoreEarned: questionResult?.scoreEarned ?? 0,
          };
        });

        await tx.screeningAnswer.createMany({
          data: answerData,
        });
      }

      return app;
    });

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        status: application.status,
        screeningScore: application.screeningScore,
        hasKnockout: application.hasKnockout,
        createdAt: application.createdAt,
        job: {
          id: job.id,
          title: job.title,
          company: job.tenant.name,
        },
      },
      screeningResult: screeningResult ? {
        totalScore: screeningResult.totalScore,
        hasKnockout: screeningResult.hasKnockout,
        recommendedStatus: screeningResult.recommendedStatus,
      } : null,
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

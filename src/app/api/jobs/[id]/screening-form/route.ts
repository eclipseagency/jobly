import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/jobs/[id]/screening-form
 * Get the active screening form for a job (public endpoint for applicants)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;

    // Verify job exists and is active
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, isActive: true, title: true },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (!job.isActive) {
      return NextResponse.json(
        { error: 'This job is no longer accepting applications' },
        { status: 400 }
      );
    }

    // Get active screening form with questions (but not rules - those are internal)
    const form = await prisma.screeningForm.findFirst({
      where: {
        jobId,
        isActive: true,
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            questionText: true,
            questionType: true,
            order: true,
            isRequired: true,
            config: true,
            helpText: true,
            placeholder: true,
            // Exclude rules - applicants shouldn't see knockout/scoring logic
          },
        },
      },
    });

    if (!form) {
      // No screening form for this job - that's okay
      return NextResponse.json({
        hasScreeningForm: false,
        form: null,
      });
    }

    return NextResponse.json({
      hasScreeningForm: true,
      form: {
        id: form.id,
        version: form.version,
        title: form.title,
        description: form.description,
        questions: form.questions,
      },
    });
  } catch (error) {
    console.error('Error fetching screening form:', error);
    return NextResponse.json(
      { error: 'Failed to fetch screening form' },
      { status: 500 }
    );
  }
}

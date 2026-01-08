import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { QuestionType, RuleType, RuleOperator, Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Types for request body
interface QuestionInput {
  questionText: string;
  questionType: QuestionType;
  order?: number;
  isRequired?: boolean;
  config?: Record<string, unknown>;
  helpText?: string;
  placeholder?: string;
  rules?: RuleInput[];
}

interface RuleInput {
  ruleType: RuleType;
  operator: RuleOperator;
  value: unknown;
  scoreValue?: number;
  message?: string;
  priority?: number;
}

interface ScreeningFormInput {
  title?: string;
  description?: string;
  shortlistThreshold?: number;
  passingThreshold?: number;
  questions: QuestionInput[];
}

/**
 * GET /api/employer/jobs/[id]/screening-form
 * Get all screening form versions for a job (employer view with rules)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const tenantId = request.headers.get('x-tenant-id');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify job belongs to tenant
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        tenantId,
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Get all form versions
    const forms = await prisma.screeningForm.findMany({
      where: { jobId },
      orderBy: { version: 'desc' },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            rules: {
              orderBy: { priority: 'asc' },
            },
          },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    return NextResponse.json({
      forms: forms.map(form => ({
        id: form.id,
        version: form.version,
        isActive: form.isActive,
        title: form.title,
        description: form.description,
        shortlistThreshold: form.shortlistThreshold,
        passingThreshold: form.passingThreshold,
        questions: form.questions,
        applicationsCount: form._count.applications,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching screening forms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch screening forms' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/employer/jobs/[id]/screening-form
 * Create a new screening form version
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const tenantId = request.headers.get('x-tenant-id');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify job belongs to tenant
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        tenantId,
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    const body: ScreeningFormInput = await request.json();

    // Validate input
    if (!body.questions || body.questions.length === 0) {
      return NextResponse.json(
        { error: 'At least one question is required' },
        { status: 400 }
      );
    }

    // Get current max version
    const latestForm = await prisma.screeningForm.findFirst({
      where: { jobId },
      orderBy: { version: 'desc' },
    });

    const newVersion = (latestForm?.version ?? 0) + 1;

    // Deactivate all existing forms for this job
    await prisma.screeningForm.updateMany({
      where: { jobId },
      data: { isActive: false },
    });

    // Create new form with questions and rules
    const form = await prisma.screeningForm.create({
      data: {
        jobId,
        version: newVersion,
        isActive: true,
        title: body.title,
        description: body.description,
        shortlistThreshold: body.shortlistThreshold,
        passingThreshold: body.passingThreshold,
        questions: {
          create: body.questions.map((q, index) => ({
            questionText: q.questionText,
            questionType: q.questionType,
            order: q.order ?? index,
            isRequired: q.isRequired ?? false,
            config: (q.config ?? Prisma.JsonNull) as Prisma.InputJsonValue,
            helpText: q.helpText,
            placeholder: q.placeholder,
            rules: q.rules && q.rules.length > 0 ? {
              create: q.rules.map((r, rIndex) => ({
                ruleType: r.ruleType,
                operator: r.operator,
                value: r.value as Prisma.InputJsonValue,
                scoreValue: r.scoreValue,
                message: r.message,
                priority: r.priority ?? rIndex,
                isActive: true,
              })),
            } : undefined,
          })),
        },
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            rules: {
              orderBy: { priority: 'asc' },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      form: {
        id: form.id,
        version: form.version,
        isActive: form.isActive,
        title: form.title,
        description: form.description,
        shortlistThreshold: form.shortlistThreshold,
        passingThreshold: form.passingThreshold,
        questions: form.questions,
        createdAt: form.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating screening form:', error);
    return NextResponse.json(
      { error: 'Failed to create screening form' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/employer/jobs/[id]/screening-form
 * Update form settings (thresholds) without creating new version
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const tenantId = request.headers.get('x-tenant-id');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify job belongs to tenant
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        tenantId,
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { formId, shortlistThreshold, passingThreshold, isActive } = body;

    if (!formId) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      );
    }

    // If activating a form, deactivate others first
    if (isActive === true) {
      await prisma.screeningForm.updateMany({
        where: {
          jobId,
          id: { not: formId },
        },
        data: { isActive: false },
      });
    }

    const form = await prisma.screeningForm.update({
      where: { id: formId },
      data: {
        shortlistThreshold: shortlistThreshold !== undefined ? shortlistThreshold : undefined,
        passingThreshold: passingThreshold !== undefined ? passingThreshold : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      form,
    });
  } catch (error) {
    console.error('Error updating screening form:', error);
    return NextResponse.json(
      { error: 'Failed to update screening form' },
      { status: 500 }
    );
  }
}

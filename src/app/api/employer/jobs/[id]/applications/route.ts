import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/employer/jobs/[id]/applications
 * List applications for a job with filtering and sorting
 *
 * Query Parameters:
 * - status: Filter by status (comma-separated for multiple)
 * - minScore: Minimum screening score
 * - maxScore: Maximum screening score
 * - hasKnockout: "true" or "false"
 * - search: Search in applicant name/email
 * - sortBy: "createdAt", "screeningScore", "status"
 * - sortOrder: "asc" or "desc"
 * - page: Page number (default 1)
 * - limit: Items per page (default 20)
 * - questionFilters: JSON string of { questionId: value } for filtering by answer values
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

    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const statusFilter = searchParams.get('status')?.split(',').filter(Boolean);
    const minScore = searchParams.get('minScore') ? parseInt(searchParams.get('minScore')!) : undefined;
    const maxScore = searchParams.get('maxScore') ? parseInt(searchParams.get('maxScore')!) : undefined;
    const hasKnockoutFilter = searchParams.get('hasKnockout');
    const searchQuery = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const questionFiltersParam = searchParams.get('questionFilters');

    // Build where clause
    const where: Prisma.ApplicationWhereInput = {
      jobId,
    };

    // Status filter
    if (statusFilter && statusFilter.length > 0) {
      where.status = { in: statusFilter };
    }

    // Score filters
    if (minScore !== undefined || maxScore !== undefined) {
      where.screeningScore = {};
      if (minScore !== undefined) {
        where.screeningScore.gte = minScore;
      }
      if (maxScore !== undefined) {
        where.screeningScore.lte = maxScore;
      }
    }

    // Knockout filter
    if (hasKnockoutFilter !== null) {
      where.hasKnockout = hasKnockoutFilter === 'true';
    }

    // Search in user name/email
    if (searchQuery) {
      where.user = {
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { email: { contains: searchQuery, mode: 'insensitive' } },
        ],
      };
    }

    // Build order by
    const orderBy: Prisma.ApplicationOrderByWithRelationInput = {};
    switch (sortBy) {
      case 'screeningScore':
        orderBy.screeningScore = sortOrder;
        break;
      case 'status':
        orderBy.status = sortOrder;
        break;
      case 'createdAt':
      default:
        orderBy.createdAt = sortOrder;
    }

    // Get total count
    const totalCount = await prisma.application.count({ where });

    // Get applications
    let applications = await prisma.application.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            phone: true,
            location: true,
            title: true,
            skills: true,
            resumeUrl: true,
            linkedinUrl: true,
            yearsOfExp: true,
          },
        },
        screeningAnswers: {
          include: {
            question: {
              select: {
                id: true,
                questionText: true,
                questionType: true,
              },
            },
          },
        },
        screeningForm: {
          select: {
            id: true,
            version: true,
            title: true,
          },
        },
      },
    });

    // Apply question filters if provided (post-query filtering for JSON values)
    if (questionFiltersParam) {
      try {
        const questionFilters = JSON.parse(questionFiltersParam) as Record<string, unknown>;

        applications = applications.filter(app => {
          for (const [questionId, filterValue] of Object.entries(questionFilters)) {
            const answer = app.screeningAnswers.find(a => a.questionId === questionId);
            if (!answer) return false;

            const answerValue = answer.answer;

            // Handle different comparison types
            if (typeof filterValue === 'boolean') {
              if (answerValue !== filterValue) return false;
            } else if (typeof filterValue === 'number') {
              if (typeof answerValue !== 'number' || answerValue !== filterValue) return false;
            } else if (typeof filterValue === 'string') {
              if (typeof answerValue === 'string') {
                if (!answerValue.toLowerCase().includes(filterValue.toLowerCase())) return false;
              } else if (Array.isArray(answerValue)) {
                if (!answerValue.includes(filterValue)) return false;
              } else {
                return false;
              }
            } else if (Array.isArray(filterValue)) {
              // Filter value is array - check if answer contains any
              if (Array.isArray(answerValue)) {
                if (!filterValue.some(v => answerValue.includes(v))) return false;
              } else if (typeof answerValue === 'string') {
                if (!filterValue.includes(answerValue)) return false;
              } else {
                return false;
              }
            }
          }
          return true;
        });
      } catch {
        // Invalid JSON, ignore filter
      }
    }

    // Get screening form for this job (to show question context)
    const activeForm = await prisma.screeningForm.findFirst({
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
          },
        },
      },
    });

    // Calculate stats
    const stats = await prisma.application.groupBy({
      by: ['status'],
      where: { jobId },
      _count: true,
    });

    const scoreStats = await prisma.application.aggregate({
      where: {
        jobId,
        screeningScore: { not: null },
      },
      _avg: { screeningScore: true },
      _min: { screeningScore: true },
      _max: { screeningScore: true },
    });

    return NextResponse.json({
      applications: applications.map(app => ({
        id: app.id,
        status: app.status,
        coverLetter: app.coverLetter,
        resumeUrl: app.resumeUrl,
        notes: app.notes,
        screeningScore: app.screeningScore,
        hasKnockout: app.hasKnockout,
        knockoutReason: app.knockoutReason,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        applicant: app.user,
        screeningForm: app.screeningForm,
        screeningAnswers: app.screeningAnswers.map(a => ({
          questionId: a.questionId,
          questionText: a.question.questionText,
          questionType: a.question.questionType,
          answer: a.answer,
          isKnockout: a.isKnockout,
          scoreEarned: a.scoreEarned,
        })),
      })),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats: {
        byStatus: stats.reduce((acc, s) => ({ ...acc, [s.status]: s._count }), {}),
        score: {
          avg: scoreStats._avg.screeningScore,
          min: scoreStats._min.screeningScore,
          max: scoreStats._max.screeningScore,
        },
      },
      screeningQuestions: activeForm?.questions || [],
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/employer/jobs/[id]/applications
 * Bulk update application statuses
 */
export async function PATCH(
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
    const { applicationIds, status, notes } = body;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json(
        { error: 'Application IDs are required' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['new', 'shortlisted', 'reviewing', 'interviewed', 'offered', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update applications
    const updateData: Prisma.ApplicationUpdateInput = { status };
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const result = await prisma.application.updateMany({
      where: {
        id: { in: applicationIds },
        jobId, // Ensure applications belong to this job
      },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      updatedCount: result.count,
    });
  } catch (error) {
    console.error('Error updating applications:', error);
    return NextResponse.json(
      { error: 'Failed to update applications' },
      { status: 500 }
    );
  }
}

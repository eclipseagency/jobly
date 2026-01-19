import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/reviews - Get reviews for a company
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'recent'; // recent, helpful, rating_high, rating_low

    if (!tenantId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    const skip = (page - 1) * limit;

    // Build order by
    let orderBy: Record<string, string> = { createdAt: 'desc' };
    if (sortBy === 'helpful') {
      orderBy = { helpfulCount: 'desc' };
    } else if (sortBy === 'rating_high') {
      orderBy = { overallRating: 'desc' };
    } else if (sortBy === 'rating_low') {
      orderBy = { overallRating: 'asc' };
    }

    const [reviews, total, aggregations] = await Promise.all([
      prisma.companyReview.findMany({
        where: {
          tenantId,
          isApproved: true,
          isHidden: false,
        },
        select: {
          id: true,
          reviewType: true,
          overallRating: true,
          workLifeBalance: true,
          compensation: true,
          jobSecurity: true,
          management: true,
          culture: true,
          careerGrowth: true,
          title: true,
          pros: true,
          cons: true,
          advice: true,
          jobTitle: true,
          department: true,
          employmentStatus: true,
          employmentType: true,
          yearsAtCompany: true,
          location: true,
          helpfulCount: true,
          notHelpfulCount: true,
          employerResponse: true,
          employerRespondedAt: true,
          createdAt: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.companyReview.count({
        where: {
          tenantId,
          isApproved: true,
          isHidden: false,
        },
      }),
      prisma.companyReview.aggregate({
        where: {
          tenantId,
          isApproved: true,
          isHidden: false,
        },
        _avg: {
          overallRating: true,
          workLifeBalance: true,
          compensation: true,
          jobSecurity: true,
          management: true,
          culture: true,
          careerGrowth: true,
        },
        _count: true,
      }),
    ]);

    // Calculate rating distribution
    const ratingDistribution = await prisma.companyReview.groupBy({
      by: ['overallRating'],
      where: {
        tenantId,
        isApproved: true,
        isHidden: false,
      },
      _count: true,
    });

    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };
    ratingDistribution.forEach(item => {
      const rating = Math.round(item.overallRating);
      if (rating >= 1 && rating <= 5) {
        distribution[rating as keyof typeof distribution] = item._count;
      }
    });

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalReviews: aggregations._count,
        averageRating: aggregations._avg.overallRating || 0,
        ratings: {
          workLifeBalance: aggregations._avg.workLifeBalance || 0,
          compensation: aggregations._avg.compensation || 0,
          jobSecurity: aggregations._avg.jobSecurity || 0,
          management: aggregations._avg.management || 0,
          culture: aggregations._avg.culture || 0,
          careerGrowth: aggregations._avg.careerGrowth || 0,
        },
        distribution,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Submit a review
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      tenantId,
      reviewType,
      overallRating,
      workLifeBalance,
      compensation,
      jobSecurity,
      management,
      culture,
      careerGrowth,
      title,
      pros,
      cons,
      advice,
      jobTitle,
      department,
      employmentStatus,
      employmentType,
      yearsAtCompany,
      location,
    } = body;

    // Validate required fields
    if (!tenantId || !reviewType || !overallRating || !title || !pros || !cons) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if company exists
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Check if user already reviewed this company
    const existingReview = await prisma.companyReview.findFirst({
      where: { userId, tenantId },
    });
    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this company' },
        { status: 400 }
      );
    }

    // Create review
    const review = await prisma.companyReview.create({
      data: {
        tenantId,
        userId,
        reviewType,
        overallRating: parseFloat(overallRating),
        workLifeBalance: workLifeBalance ? parseFloat(workLifeBalance) : null,
        compensation: compensation ? parseFloat(compensation) : null,
        jobSecurity: jobSecurity ? parseFloat(jobSecurity) : null,
        management: management ? parseFloat(management) : null,
        culture: culture ? parseFloat(culture) : null,
        careerGrowth: careerGrowth ? parseFloat(careerGrowth) : null,
        title,
        pros,
        cons,
        advice,
        jobTitle,
        department,
        employmentStatus,
        employmentType,
        yearsAtCompany: yearsAtCompany ? parseInt(yearsAtCompany) : null,
        location,
        isApproved: false, // Reviews need approval
      },
    });

    return NextResponse.json({
      review,
      message: 'Review submitted successfully. It will be visible after moderation.',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

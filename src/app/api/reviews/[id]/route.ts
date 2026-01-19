import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST /api/reviews/[id] - Vote on a review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const { id } = await params;
    const body = await request.json();
    const { action } = body; // 'helpful' or 'not_helpful'

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['helpful', 'not_helpful'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Check if review exists
    const review = await prisma.companyReview.findUnique({ where: { id } });
    if (!review || !review.isApproved || review.isHidden) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Check if already voted
    const existingVote = await prisma.reviewVote.findUnique({
      where: {
        reviewId_userId: { reviewId: id, userId },
      },
    });

    const isHelpful = action === 'helpful';

    if (existingVote) {
      if (existingVote.isHelpful === isHelpful) {
        // Remove vote
        await prisma.reviewVote.delete({
          where: { id: existingVote.id },
        });

        // Update counts
        await prisma.companyReview.update({
          where: { id },
          data: {
            helpfulCount: isHelpful ? { decrement: 1 } : undefined,
            notHelpfulCount: !isHelpful ? { decrement: 1 } : undefined,
          },
        });

        return NextResponse.json({ message: 'Vote removed', voted: null });
      } else {
        // Change vote
        await prisma.reviewVote.update({
          where: { id: existingVote.id },
          data: { isHelpful },
        });

        // Update counts
        await prisma.companyReview.update({
          where: { id },
          data: {
            helpfulCount: isHelpful ? { increment: 1 } : { decrement: 1 },
            notHelpfulCount: isHelpful ? { decrement: 1 } : { increment: 1 },
          },
        });

        return NextResponse.json({ message: 'Vote changed', voted: action });
      }
    } else {
      // New vote
      await prisma.reviewVote.create({
        data: {
          reviewId: id,
          userId,
          isHelpful,
        },
      });

      // Update counts
      await prisma.companyReview.update({
        where: { id },
        data: {
          helpfulCount: isHelpful ? { increment: 1 } : undefined,
          notHelpfulCount: !isHelpful ? { increment: 1 } : undefined,
        },
      });

      return NextResponse.json({ message: 'Vote recorded', voted: action });
    }
  } catch (error) {
    console.error('Error voting on review:', error);
    return NextResponse.json(
      { error: 'Failed to vote on review' },
      { status: 500 }
    );
  }
}

// PATCH /api/reviews/[id] - Employer response to review
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const { id } = await params;
    const body = await request.json();
    const { response } = body;

    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if review exists and belongs to this company
    const review = await prisma.companyReview.findUnique({ where: { id } });
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (review.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Not authorized to respond to this review' }, { status: 403 });
    }

    // Update review with employer response
    const updatedReview = await prisma.companyReview.update({
      where: { id },
      data: {
        employerResponse: response,
        employerRespondedAt: new Date(),
      },
    });

    return NextResponse.json({ review: updatedReview });
  } catch (error) {
    console.error('Error responding to review:', error);
    return NextResponse.json(
      { error: 'Failed to respond to review' },
      { status: 500 }
    );
  }
}

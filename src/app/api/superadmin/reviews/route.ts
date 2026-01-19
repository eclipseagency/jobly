import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSuperAdmin, hasPermission } from '@/lib/superadmin-auth';

export const dynamic = 'force-dynamic';

// GET /api/superadmin/reviews - Get all reviews (pending or all)
export async function GET(request: NextRequest) {
  const authResult = requireSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending'; // pending, approved, hidden, all
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};
    if (status === 'pending') {
      whereClause.isApproved = false;
      whereClause.isHidden = false;
    } else if (status === 'approved') {
      whereClause.isApproved = true;
      whereClause.isHidden = false;
    } else if (status === 'hidden') {
      whereClause.isHidden = true;
    }

    const [reviews, total] = await Promise.all([
      prisma.companyReview.findMany({
        where: whereClause,
        include: {
          tenant: {
            select: { id: true, name: true, logo: true },
          },
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.companyReview.count({ where: whereClause }),
    ]);

    // Get counts for each status
    const [pendingCount, approvedCount, hiddenCount] = await Promise.all([
      prisma.companyReview.count({ where: { isApproved: false, isHidden: false } }),
      prisma.companyReview.count({ where: { isApproved: true, isHidden: false } }),
      prisma.companyReview.count({ where: { isHidden: true } }),
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        hidden: hiddenCount,
        total: pendingCount + approvedCount + hiddenCount,
      },
    });
  } catch (error) {
    console.error('[SuperAdmin Reviews] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// PATCH /api/superadmin/reviews - Approve/reject/hide review
export async function PATCH(request: NextRequest) {
  const authResult = requireSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;
  const { admin } = authResult;

  if (!hasPermission(admin, 'canManageUsers')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, action, reason } = body;

    if (!id || !action) {
      return NextResponse.json({ error: 'Review ID and action required' }, { status: 400 });
    }

    const review = await prisma.companyReview.findUnique({ where: { id } });
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (action === 'approve') {
      await prisma.companyReview.update({
        where: { id },
        data: {
          isApproved: true,
          approvedAt: new Date(),
          approvedBy: admin.adminId,
          isHidden: false,
          hiddenReason: null,
        },
      });
      return NextResponse.json({ success: true, message: 'Review approved' });
    }

    if (action === 'reject' || action === 'hide') {
      await prisma.companyReview.update({
        where: { id },
        data: {
          isHidden: true,
          hiddenReason: reason || 'Rejected by admin',
        },
      });
      return NextResponse.json({ success: true, message: 'Review hidden' });
    }

    if (action === 'unhide') {
      await prisma.companyReview.update({
        where: { id },
        data: {
          isHidden: false,
          hiddenReason: null,
        },
      });
      return NextResponse.json({ success: true, message: 'Review unhidden' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[SuperAdmin Reviews] Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

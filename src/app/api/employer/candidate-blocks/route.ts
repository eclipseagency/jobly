import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// POST /api/employer/candidate-blocks - Block a candidate
export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { candidateId, reason } = body;

    if (!candidateId) {
      return NextResponse.json(
        { error: 'Candidate ID is required' },
        { status: 400 }
      );
    }

    const block = await prisma.candidateBlock.upsert({
      where: {
        employerId_candidateId: {
          employerId: tenantId,
          candidateId,
        },
      },
      create: {
        employerId: tenantId,
        candidateId,
        reason,
      },
      update: {
        reason,
      },
    });

    return NextResponse.json({ block }, { status: 201 });
  } catch (error) {
    console.error('Error blocking candidate:', error);
    return NextResponse.json(
      { error: 'Failed to block candidate' },
      { status: 500 }
    );
  }
}

// DELETE /api/employer/candidate-blocks - Unblock a candidate
export async function DELETE(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!candidateId) {
      return NextResponse.json(
        { error: 'Candidate ID is required' },
        { status: 400 }
      );
    }

    await prisma.candidateBlock.deleteMany({
      where: { employerId: tenantId, candidateId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unblocking candidate:', error);
    return NextResponse.json(
      { error: 'Failed to unblock candidate' },
      { status: 500 }
    );
  }
}

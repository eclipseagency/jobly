import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/employer/shortlists - Get all employer's shortlists
export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const shortlists = await prisma.employerShortlist.findMany({
      where: { employerId: tenantId },
      include: {
        candidates: {
          select: {
            id: true,
            candidateId: true,
            notes: true,
            rating: true,
            addedAt: true,
          },
        },
        _count: {
          select: { candidates: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      shortlists: shortlists.map(sl => ({
        id: sl.id,
        name: sl.name,
        description: sl.description,
        color: sl.color,
        candidateCount: sl._count.candidates,
        candidates: sl.candidates,
        createdAt: sl.createdAt,
        updatedAt: sl.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching shortlists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shortlists' },
      { status: 500 }
    );
  }
}

// POST /api/employer/shortlists - Create new shortlist
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
    const { name, description, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Verify the employer user exists
    const employerExists = await prisma.user.findUnique({
      where: { id: tenantId },
      select: { id: true, role: true },
    });

    if (!employerExists) {
      console.error('Employer not found:', tenantId);
      return NextResponse.json(
        { error: 'Employer account not found' },
        { status: 404 }
      );
    }

    const shortlist = await prisma.employerShortlist.create({
      data: {
        employerId: tenantId,
        name,
        description,
        color,
      },
    });

    return NextResponse.json({ shortlist }, { status: 201 });
  } catch (error) {
    console.error('Error creating shortlist:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create shortlist', details: errorMessage },
      { status: 500 }
    );
  }
}

// PATCH /api/employer/shortlists - Update shortlist or add/remove candidate
export async function PATCH(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { shortlistId, action, candidateId, name, description, color, notes, rating } = body;

    if (!shortlistId) {
      return NextResponse.json(
        { error: 'Shortlist ID is required' },
        { status: 400 }
      );
    }

    // Verify shortlist belongs to employer
    const shortlist = await prisma.employerShortlist.findFirst({
      where: { id: shortlistId, employerId: tenantId },
    });

    if (!shortlist) {
      return NextResponse.json(
        { error: 'Shortlist not found' },
        { status: 404 }
      );
    }

    // Handle different actions
    if (action === 'add_candidate' && candidateId) {
      // Add candidate to shortlist
      const candidate = await prisma.shortlistCandidate.upsert({
        where: {
          shortlistId_candidateId: {
            shortlistId,
            candidateId,
          },
        },
        create: {
          shortlistId,
          candidateId,
          notes,
          rating,
        },
        update: {
          notes,
          rating,
        },
      });

      return NextResponse.json({ candidate });
    }

    if (action === 'remove_candidate' && candidateId) {
      // Remove candidate from shortlist
      await prisma.shortlistCandidate.deleteMany({
        where: {
          shortlistId,
          candidateId,
        },
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'update_notes' && candidateId) {
      // Update candidate notes/rating
      const candidate = await prisma.shortlistCandidate.update({
        where: {
          shortlistId_candidateId: {
            shortlistId,
            candidateId,
          },
        },
        data: {
          ...(notes !== undefined && { notes }),
          ...(rating !== undefined && { rating }),
        },
      });

      return NextResponse.json({ candidate });
    }

    // Update shortlist details
    const updated = await prisma.employerShortlist.update({
      where: { id: shortlistId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
      },
    });

    return NextResponse.json({ shortlist: updated });
  } catch (error) {
    console.error('Error updating shortlist:', error);
    return NextResponse.json(
      { error: 'Failed to update shortlist' },
      { status: 500 }
    );
  }
}

// DELETE /api/employer/shortlists - Delete a shortlist
export async function DELETE(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const { searchParams } = new URL(request.url);
    const shortlistId = searchParams.get('id');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!shortlistId) {
      return NextResponse.json(
        { error: 'Shortlist ID is required' },
        { status: 400 }
      );
    }

    // Verify shortlist belongs to employer
    const shortlist = await prisma.employerShortlist.findFirst({
      where: { id: shortlistId, employerId: tenantId },
    });

    if (!shortlist) {
      return NextResponse.json(
        { error: 'Shortlist not found' },
        { status: 404 }
      );
    }

    await prisma.employerShortlist.delete({
      where: { id: shortlistId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shortlist:', error);
    return NextResponse.json(
      { error: 'Failed to delete shortlist' },
      { status: 500 }
    );
  }
}

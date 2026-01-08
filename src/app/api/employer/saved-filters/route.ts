import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/employer/saved-filters - Get all saved filters
export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const filters = await prisma.savedFilter.findMany({
      where: { employerId: tenantId },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ filters });
  } catch (error) {
    console.error('Error fetching saved filters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved filters' },
      { status: 500 }
    );
  }
}

// POST /api/employer/saved-filters - Create saved filter
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
    const { name, filters } = body;

    if (!name || !filters) {
      return NextResponse.json(
        { error: 'Name and filters are required' },
        { status: 400 }
      );
    }

    const savedFilter = await prisma.savedFilter.create({
      data: {
        employerId: tenantId,
        name,
        filters,
      },
    });

    return NextResponse.json({ filter: savedFilter }, { status: 201 });
  } catch (error) {
    console.error('Error creating saved filter:', error);
    return NextResponse.json(
      { error: 'Failed to create saved filter' },
      { status: 500 }
    );
  }
}

// DELETE /api/employer/saved-filters - Delete saved filter
export async function DELETE(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const { searchParams } = new URL(request.url);
    const filterId = searchParams.get('id');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!filterId) {
      return NextResponse.json(
        { error: 'Filter ID is required' },
        { status: 400 }
      );
    }

    await prisma.savedFilter.deleteMany({
      where: { id: filterId, employerId: tenantId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting saved filter:', error);
    return NextResponse.json(
      { error: 'Failed to delete saved filter' },
      { status: 500 }
    );
  }
}

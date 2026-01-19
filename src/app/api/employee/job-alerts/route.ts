import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/employee/job-alerts - Get user's job alerts
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const alerts = await prisma.jobAlert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Error fetching job alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job alerts' },
      { status: 500 }
    );
  }
}

// POST /api/employee/job-alerts - Create a new job alert
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      keywords = [],
      locations = [],
      jobTypes = [],
      salaryMin,
      salaryMax,
      remoteOnly = false,
      industries = [],
      experienceLevel,
      frequency = 'daily',
      emailEnabled = true,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Alert name is required' }, { status: 400 });
    }

    // Check limit (max 10 alerts per user)
    const existingCount = await prisma.jobAlert.count({ where: { userId } });
    if (existingCount >= 10) {
      return NextResponse.json(
        { error: 'Maximum 10 job alerts allowed' },
        { status: 400 }
      );
    }

    const alert = await prisma.jobAlert.create({
      data: {
        userId,
        name: name.trim(),
        keywords,
        locations,
        jobTypes,
        salaryMin: salaryMin ? parseInt(salaryMin) : null,
        salaryMax: salaryMax ? parseInt(salaryMax) : null,
        remoteOnly,
        industries,
        experienceLevel,
        frequency,
        emailEnabled,
      },
    });

    return NextResponse.json({ alert }, { status: 201 });
  } catch (error) {
    console.error('Error creating job alert:', error);
    return NextResponse.json(
      { error: 'Failed to create job alert' },
      { status: 500 }
    );
  }
}

// PATCH /api/employee/job-alerts - Update a job alert
export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existingAlert = await prisma.jobAlert.findUnique({ where: { id } });
    if (!existingAlert || existingAlert.userId !== userId) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    // Build update data
    const allowedFields = [
      'name', 'keywords', 'locations', 'jobTypes', 'salaryMin', 'salaryMax',
      'remoteOnly', 'industries', 'experienceLevel', 'frequency', 'emailEnabled', 'isActive'
    ];

    const filteredData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        if (field === 'salaryMin' || field === 'salaryMax') {
          filteredData[field] = updateData[field] ? parseInt(updateData[field]) : null;
        } else {
          filteredData[field] = updateData[field];
        }
      }
    }

    const alert = await prisma.jobAlert.update({
      where: { id },
      data: filteredData,
    });

    return NextResponse.json({ alert });
  } catch (error) {
    console.error('Error updating job alert:', error);
    return NextResponse.json(
      { error: 'Failed to update job alert' },
      { status: 500 }
    );
  }
}

// DELETE /api/employee/job-alerts - Delete a job alert
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existingAlert = await prisma.jobAlert.findUnique({ where: { id } });
    if (!existingAlert || existingAlert.userId !== userId) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    await prisma.jobAlert.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Job alert deleted' });
  } catch (error) {
    console.error('Error deleting job alert:', error);
    return NextResponse.json(
      { error: 'Failed to delete job alert' },
      { status: 500 }
    );
  }
}

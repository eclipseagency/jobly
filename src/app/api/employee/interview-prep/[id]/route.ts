import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/employee/interview-prep/[id] - Get specific prep
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prep = await prisma.interviewPrep.findFirst({
      where: { id: params.id, userId },
      include: {
        practiceQuestions: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!prep) {
      return NextResponse.json({ error: 'Prep not found' }, { status: 404 });
    }

    return NextResponse.json({ prep });
  } catch (error) {
    console.error('[Interview Prep] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interview prep' },
      { status: 500 }
    );
  }
}

// PUT /api/employee/interview-prep/[id] - Update prep
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.interviewPrep.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Prep not found' }, { status: 404 });
    }

    const body = await request.json();
    const { companyName, jobTitle, interviewDate, interviewType, companyNotes, roleNotes, status } = body;

    const prep = await prisma.interviewPrep.update({
      where: { id: params.id },
      data: {
        companyName,
        jobTitle,
        interviewDate: interviewDate ? new Date(interviewDate) : null,
        interviewType,
        companyNotes,
        roleNotes,
        status,
      },
      include: {
        practiceQuestions: true,
      },
    });

    return NextResponse.json({ prep });
  } catch (error) {
    console.error('[Interview Prep] Error updating:', error);
    return NextResponse.json(
      { error: 'Failed to update interview prep' },
      { status: 500 }
    );
  }
}

// DELETE /api/employee/interview-prep/[id] - Delete prep
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.interviewPrep.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Prep not found' }, { status: 404 });
    }

    // Delete questions first
    await prisma.interviewQuestion.deleteMany({
      where: { prepId: params.id },
    });

    await prisma.interviewPrep.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Interview Prep] Error deleting:', error);
    return NextResponse.json(
      { error: 'Failed to delete interview prep' },
      { status: 500 }
    );
  }
}

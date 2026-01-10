import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/resumes/[id] - Get a specific resume with dataUrl
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const { id } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resume = await prisma.resume.findFirst({
      where: {
        id,
        userId, // Ensure user owns this resume
      },
    });

    if (!resume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ resume });
  } catch (error) {
    console.error('Error fetching resume:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resume' },
      { status: 500 }
    );
  }
}

// PATCH /api/resumes/[id] - Update resume (skills, isPrimary)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const { id } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const existing = await prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { extractedSkills, isPrimary } = body;

    const updateData: { extractedSkills?: string[]; isPrimary?: boolean } = {};

    if (extractedSkills !== undefined) {
      updateData.extractedSkills = extractedSkills;
    }

    if (isPrimary === true) {
      // Unset primary from all other resumes
      await prisma.resume.updateMany({
        where: { userId, isPrimary: true },
        data: { isPrimary: false },
      });
      updateData.isPrimary = true;
    }

    const resume = await prisma.resume.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        filename: true,
        fileSize: true,
        mimeType: true,
        extractedSkills: true,
        isPrimary: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ resume });
  } catch (error) {
    console.error('Error updating resume:', error);
    return NextResponse.json(
      { error: 'Failed to update resume' },
      { status: 500 }
    );
  }
}

// DELETE /api/resumes/[id] - Delete a resume
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const { id } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const existing = await prisma.resume.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }

    await prisma.resume.delete({
      where: { id },
    });

    // If deleted resume was primary, set another as primary
    if (existing.isPrimary) {
      const nextResume = await prisma.resume.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (nextResume) {
        await prisma.resume.update({
          where: { id: nextResume.id },
          data: { isPrimary: true },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting resume:', error);
    return NextResponse.json(
      { error: 'Failed to delete resume' },
      { status: 500 }
    );
  }
}

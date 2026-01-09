import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/resumes - Get user's resumes
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resumes = await prisma.resume.findMany({
      where: { userId },
      select: {
        id: true,
        filename: true,
        fileSize: true,
        mimeType: true,
        extractedSkills: true,
        isPrimary: true,
        createdAt: true,
        // Don't include dataUrl in list - it's large
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ resumes });
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resumes' },
      { status: 500 }
    );
  }
}

// POST /api/resumes - Upload a new resume
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { filename, fileSize, mimeType, dataUrl, extractedSkills } = body;

    if (!filename || !fileSize || !mimeType || !dataUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!validTypes.includes(mimeType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and Word documents are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (fileSize > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Check if user already has resumes
    const existingCount = await prisma.resume.count({
      where: { userId },
    });

    // Create the resume
    const resume = await prisma.resume.create({
      data: {
        userId,
        filename,
        fileSize,
        mimeType,
        dataUrl,
        extractedSkills: extractedSkills || [],
        isPrimary: existingCount === 0, // First resume is primary
      },
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

    return NextResponse.json({ resume }, { status: 201 });
  } catch (error) {
    console.error('Error uploading resume:', error);
    return NextResponse.json(
      { error: 'Failed to upload resume' },
      { status: 500 }
    );
  }
}

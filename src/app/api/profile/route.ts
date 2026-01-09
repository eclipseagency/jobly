import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/profile - Get user profile
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        bio: true,
        location: true,
        title: true,
        skills: true,
        resumeUrl: true,
        linkedinUrl: true,
        portfolioUrl: true,
        githubUrl: true,
        websiteUrl: true,
        yearsOfExp: true,
        dateOfBirth: true,
        gender: true,
        nationality: true,
        address: true,
        city: true,
        province: true,
        postalCode: true,
        country: true,
        expectedSalary: true,
        preferredJobType: true,
        preferredWorkSetup: true,
        availableFrom: true,
        willingToRelocate: true,
        openToOffers: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PATCH /api/profile - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { mergeSkills, skills, ...updateData } = body;

    // If merging skills, get existing and merge
    if (mergeSkills && skills && Array.isArray(skills)) {
      const existing = await prisma.user.findUnique({
        where: { id: userId },
        select: { skills: true },
      });

      const existingSkills = existing?.skills || [];
      const mergedSkills = Array.from(new Set([...existingSkills, ...skills]));
      const newSkillsAdded = mergedSkills.length - existingSkills.length;

      const user = await prisma.user.update({
        where: { id: userId },
        data: { skills: mergedSkills },
        select: {
          id: true,
          skills: true,
        },
      });

      return NextResponse.json({ user, newSkillsAdded });
    }

    // Regular update
    const allowedFields = [
      'name', 'avatar', 'phone', 'bio', 'location', 'title', 'skills',
      'resumeUrl', 'linkedinUrl', 'portfolioUrl', 'githubUrl', 'websiteUrl',
      'yearsOfExp', 'dateOfBirth', 'gender', 'nationality', 'address',
      'city', 'province', 'postalCode', 'country', 'expectedSalary',
      'preferredJobType', 'preferredWorkSetup', 'availableFrom',
      'willingToRelocate', 'openToOffers'
    ];

    const sanitizedData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in updateData) {
        sanitizedData[field] = updateData[field];
      }
    }

    // Include skills if provided directly (not merged)
    if (skills && !mergeSkills) {
      sanitizedData.skills = skills;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: sanitizedData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        bio: true,
        location: true,
        title: true,
        skills: true,
        resumeUrl: true,
        linkedinUrl: true,
        portfolioUrl: true,
        githubUrl: true,
        websiteUrl: true,
        yearsOfExp: true,
        dateOfBirth: true,
        gender: true,
        nationality: true,
        address: true,
        city: true,
        province: true,
        postalCode: true,
        country: true,
        expectedSalary: true,
        preferredJobType: true,
        preferredWorkSetup: true,
        availableFrom: true,
        willingToRelocate: true,
        openToOffers: true,
        role: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/employer/talent-pool - List job seekers with filters
export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const { searchParams } = new URL(request.url);

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Search
    const search = searchParams.get('search') || '';

    // Filters
    const skills = searchParams.get('skills')?.split(',').filter(Boolean) || [];
    const experienceLevel = searchParams.get('experienceLevel') || '';
    const minYearsExp = searchParams.get('minYearsExp') ? parseInt(searchParams.get('minYearsExp')!) : undefined;
    const maxYearsExp = searchParams.get('maxYearsExp') ? parseInt(searchParams.get('maxYearsExp')!) : undefined;
    const location = searchParams.get('location') || '';
    const remotePreference = searchParams.get('remotePreference') || '';
    const availability = searchParams.get('availability') || '';
    const jobType = searchParams.get('jobType') || '';
    const minSalary = searchParams.get('minSalary') ? parseInt(searchParams.get('minSalary')!) : undefined;
    const maxSalary = searchParams.get('maxSalary') ? parseInt(searchParams.get('maxSalary')!) : undefined;
    const minCompleteness = searchParams.get('minCompleteness') ? parseInt(searchParams.get('minCompleteness')!) : undefined;
    const activelyLooking = searchParams.get('activelyLooking') === 'true';
    const lastActiveDays = searchParams.get('lastActiveDays') ? parseInt(searchParams.get('lastActiveDays')!) : undefined;

    // Get blocked candidate IDs for this employer
    const blockedCandidates = await prisma.candidateBlock.findMany({
      where: { employerId: tenantId },
      select: { candidateId: true },
    });
    const blockedIds = blockedCandidates.map(b => b.candidateId);

    // Build where clause for job seekers
    // openToOffers: true is the primary visibility flag - users who enable this want to be found
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {
      role: 'EMPLOYEE',
      openToOffers: true,
      id: { notIn: blockedIds },
    };

    // Search filter (name, title, skills)
    if (search) {
      whereClause.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { title: { contains: search, mode: 'insensitive' } },
            { skills: { hasSome: [search] } },
          ],
        },
      ];
    }

    // Skills filter
    if (skills.length > 0) {
      whereClause.skills = { hasSome: skills };
    }

    // Experience level filter
    if (experienceLevel) {
      whereClause.talentPoolProfile = {
        ...whereClause.talentPoolProfile,
        experienceLevel,
      };
    }

    // Years of experience filter
    if (minYearsExp !== undefined || maxYearsExp !== undefined) {
      whereClause.yearsOfExp = {};
      if (minYearsExp !== undefined) {
        whereClause.yearsOfExp.gte = minYearsExp;
      }
      if (maxYearsExp !== undefined) {
        whereClause.yearsOfExp.lte = maxYearsExp;
      }
    }

    // Location filter
    if (location) {
      whereClause.OR = [
        { city: { contains: location, mode: 'insensitive' } },
        { location: { contains: location, mode: 'insensitive' } },
        { country: { contains: location, mode: 'insensitive' } },
      ];
    }

    // Remote preference filter
    if (remotePreference) {
      whereClause.preferredWorkSetup = remotePreference;
    }

    // Availability filter
    if (availability) {
      whereClause.talentPoolProfile = {
        ...whereClause.talentPoolProfile,
        availability,
      };
    }

    // Job type filter
    if (jobType) {
      whereClause.preferredJobType = jobType;
    }

    // Actively looking filter
    if (activelyLooking) {
      whereClause.openToOffers = true;
    }

    // Last active filter
    if (lastActiveDays) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - lastActiveDays);
      whereClause.updatedAt = { gte: cutoffDate };
    }

    // Query job seekers
    const [jobSeekers, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          avatar: true,
          title: true,
          location: true,
          city: true,
          country: true,
          skills: true,
          yearsOfExp: true,
          preferredWorkSetup: true,
          preferredJobType: true,
          expectedSalary: true,
          openToOffers: true,
          updatedAt: true,
          talentPoolProfile: {
            select: {
              experienceLevel: true,
              availability: true,
              remotePreference: true,
              lastActiveAt: true,
              profileViewsCount: true,
            },
          },
          workExperiences: {
            take: 1,
            orderBy: { startDate: 'desc' },
            select: {
              jobTitle: true,
              company: true,
              isCurrent: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: [
          { updatedAt: 'desc' },
        ],
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    // Calculate profile completeness for each job seeker
    const seekersWithCompleteness = jobSeekers.map(seeker => {
      const completeness = calculateProfileCompleteness(seeker);
      return {
        id: seeker.id,
        name: seeker.name,
        avatar: seeker.avatar,
        title: seeker.title || seeker.workExperiences[0]?.jobTitle || 'Job Seeker',
        currentCompany: seeker.workExperiences[0]?.company,
        location: seeker.city ? `${seeker.city}, ${seeker.country || 'Philippines'}` : seeker.location,
        skills: seeker.skills?.slice(0, 5) || [],
        experienceLevel: seeker.talentPoolProfile?.experienceLevel || inferExperienceLevel(seeker.yearsOfExp),
        yearsOfExp: seeker.yearsOfExp,
        workSetup: seeker.preferredWorkSetup || seeker.talentPoolProfile?.remotePreference,
        availability: seeker.talentPoolProfile?.availability || (seeker.openToOffers ? 'open' : 'not_looking'),
        profileCompleteness: completeness,
        lastActive: seeker.talentPoolProfile?.lastActiveAt || seeker.updatedAt,
        expectedSalary: seeker.expectedSalary,
      };
    });

    // Filter by completeness if specified (post-filter for now)
    const filteredSeekers = minCompleteness
      ? seekersWithCompleteness.filter(s => s.profileCompleteness >= minCompleteness)
      : seekersWithCompleteness;

    // Filter by salary range if specified
    const salarySeekers = (minSalary || maxSalary)
      ? filteredSeekers.filter(s => {
          if (!s.expectedSalary) return false;
          const salary = parseInt(s.expectedSalary.replace(/[^0-9]/g, ''));
          if (minSalary && salary < minSalary) return false;
          if (maxSalary && salary > maxSalary) return false;
          return true;
        })
      : filteredSeekers;

    return NextResponse.json({
      jobSeekers: salarySeekers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching talent pool:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job seekers' },
      { status: 500 }
    );
  }
}

// Helper: Calculate profile completeness
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculateProfileCompleteness(user: any): number {
  const fields = [
    !!user.name,
    !!user.title,
    !!user.location || !!user.city,
    (user.skills?.length || 0) > 0,
    !!user.yearsOfExp,
    !!user.expectedSalary,
    !!user.preferredWorkSetup,
    !!user.preferredJobType,
    (user.workExperiences?.length || 0) > 0,
    !!user.avatar,
  ];
  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
}

// Helper: Infer experience level from years
function inferExperienceLevel(years: number | null | undefined): string {
  if (!years) return 'entry';
  if (years < 2) return 'entry';
  if (years < 4) return 'junior';
  if (years < 7) return 'mid';
  if (years < 10) return 'senior';
  return 'lead';
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/employer/talent-pool/[id] - Get job seeker profile for employer view
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const { id } = await params;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if candidate is blocked by this employer
    const isBlocked = await prisma.candidateBlock.findUnique({
      where: {
        employerId_candidateId: {
          employerId: tenantId,
          candidateId: id,
        },
      },
    });

    if (isBlocked) {
      return NextResponse.json(
        { error: 'Candidate not available' },
        { status: 404 }
      );
    }

    // Fetch job seeker profile - only EMPLOYEE users who are open to offers
    const jobSeeker = await prisma.user.findFirst({
      where: {
        id,
        role: 'EMPLOYEE',
        OR: [
          { openToOffers: true },
          { openToOffers: { equals: null } },
        ],
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        title: true,
        bio: true,
        location: true,
        city: true,
        province: true,
        country: true,
        skills: true,
        yearsOfExp: true,
        preferredWorkSetup: true,
        preferredJobType: true,
        expectedSalary: true,
        openToOffers: true,
        availableFrom: true,
        willingToRelocate: true,
        resumeUrl: true,
        linkedinUrl: true,
        portfolioUrl: true,
        githubUrl: true,
        websiteUrl: true,
        updatedAt: true,
        // Related data
        talentPoolProfile: {
          select: {
            experienceLevel: true,
            availability: true,
            remotePreference: true,
            primarySkills: true,
            preferredLocations: true,
            lastActiveAt: true,
          },
        },
        workExperiences: {
          orderBy: { startDate: 'desc' },
          select: {
            id: true,
            jobTitle: true,
            company: true,
            companyLogo: true,
            location: true,
            locationType: true,
            employmentType: true,
            startDate: true,
            endDate: true,
            isCurrent: true,
            description: true,
            achievements: true,
            skills: true,
          },
        },
        educations: {
          orderBy: { startDate: 'desc' },
          select: {
            id: true,
            school: true,
            schoolLogo: true,
            degree: true,
            fieldOfStudy: true,
            startDate: true,
            endDate: true,
            isCurrent: true,
            grade: true,
            achievements: true,
          },
        },
        certifications: {
          orderBy: { issueDate: 'desc' },
          select: {
            id: true,
            name: true,
            issuingOrg: true,
            issuingOrgLogo: true,
            issueDate: true,
            expiryDate: true,
            hasNoExpiry: true,
            credentialUrl: true,
          },
        },
        languages: {
          select: {
            id: true,
            language: true,
            proficiency: true,
          },
        },
        // Applications to employer's jobs
        applications: {
          where: {
            job: { tenantId },
          },
          select: {
            id: true,
            status: true,
            createdAt: true,
            job: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!jobSeeker) {
      return NextResponse.json(
        { error: 'Job seeker not found' },
        { status: 404 }
      );
    }

    // Record profile view
    await prisma.profileView.create({
      data: {
        viewerId: tenantId,
        viewedId: id,
        source: 'talent_pool',
      },
    });

    // Update profile view count if talent pool profile exists
    if (jobSeeker.talentPoolProfile) {
      await prisma.talentPoolProfile.update({
        where: { userId: id },
        data: {
          profileViewsCount: { increment: 1 },
        },
      });
    }

    // Get existing shortlists containing this candidate
    const shortlistsWithCandidate = await prisma.shortlistCandidate.findMany({
      where: {
        candidateId: id,
        shortlist: { employerId: tenantId },
      },
      select: {
        shortlistId: true,
        notes: true,
        rating: true,
        shortlist: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Get interview invites sent to this candidate
    const invitesSent = await prisma.interviewInvite.findMany({
      where: {
        employerId: tenantId,
        candidateId: id,
      },
      select: {
        id: true,
        type: true,
        status: true,
        createdAt: true,
        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get message thread count
    const messageCount = await prisma.message.count({
      where: {
        OR: [
          { senderId: tenantId, recipientId: id },
          { senderId: id, recipientId: tenantId },
        ],
      },
    });

    // Calculate profile completeness
    const completeness = calculateProfileCompleteness(jobSeeker);

    // Format response - hide private info
    const profile = {
      id: jobSeeker.id,
      name: jobSeeker.name,
      avatar: jobSeeker.avatar,
      title: jobSeeker.title || jobSeeker.workExperiences[0]?.jobTitle || 'Job Seeker',
      bio: jobSeeker.bio,
      location: jobSeeker.city
        ? `${jobSeeker.city}${jobSeeker.province ? `, ${jobSeeker.province}` : ''}, ${jobSeeker.country || 'Philippines'}`
        : jobSeeker.location,
      skills: jobSeeker.skills || [],
      primarySkills: jobSeeker.talentPoolProfile?.primarySkills || jobSeeker.skills?.slice(0, 5) || [],
      yearsOfExp: jobSeeker.yearsOfExp,
      experienceLevel: jobSeeker.talentPoolProfile?.experienceLevel || inferExperienceLevel(jobSeeker.yearsOfExp),
      workSetup: jobSeeker.preferredWorkSetup || jobSeeker.talentPoolProfile?.remotePreference,
      jobType: jobSeeker.preferredJobType,
      expectedSalary: jobSeeker.expectedSalary,
      availability: jobSeeker.talentPoolProfile?.availability || (jobSeeker.openToOffers ? 'open' : 'not_looking'),
      availableFrom: jobSeeker.availableFrom,
      willingToRelocate: jobSeeker.willingToRelocate,
      preferredLocations: jobSeeker.talentPoolProfile?.preferredLocations || [],
      profileCompleteness: completeness,
      lastActive: jobSeeker.talentPoolProfile?.lastActiveAt || jobSeeker.updatedAt,

      // Portfolio links (public info)
      links: {
        linkedin: jobSeeker.linkedinUrl,
        portfolio: jobSeeker.portfolioUrl,
        github: jobSeeker.githubUrl,
        website: jobSeeker.websiteUrl,
      },

      // Resume available flag (don't expose URL directly)
      hasResume: !!jobSeeker.resumeUrl,

      // Work history
      experience: jobSeeker.workExperiences.map(exp => ({
        id: exp.id,
        title: exp.jobTitle,
        company: exp.company,
        companyLogo: exp.companyLogo,
        location: exp.location,
        locationType: exp.locationType,
        employmentType: exp.employmentType,
        startDate: exp.startDate,
        endDate: exp.endDate,
        isCurrent: exp.isCurrent,
        description: exp.description,
        achievements: exp.achievements,
        skills: exp.skills,
      })),

      // Education
      education: jobSeeker.educations.map(edu => ({
        id: edu.id,
        school: edu.school,
        schoolLogo: edu.schoolLogo,
        degree: edu.degree,
        fieldOfStudy: edu.fieldOfStudy,
        startDate: edu.startDate,
        endDate: edu.endDate,
        isCurrent: edu.isCurrent,
        achievements: edu.achievements,
      })),

      // Certifications
      certifications: jobSeeker.certifications.map(cert => ({
        id: cert.id,
        name: cert.name,
        issuingOrg: cert.issuingOrg,
        issuingOrgLogo: cert.issuingOrgLogo,
        issueDate: cert.issueDate,
        expiryDate: cert.expiryDate,
        hasNoExpiry: cert.hasNoExpiry,
        credentialUrl: cert.credentialUrl,
      })),

      // Languages
      languages: jobSeeker.languages,

      // Activity with this employer
      activity: {
        applications: jobSeeker.applications.map(app => ({
          id: app.id,
          jobId: app.job.id,
          jobTitle: app.job.title,
          status: app.status,
          appliedAt: app.createdAt,
        })),
        invitesSent: invitesSent.map(inv => ({
          id: inv.id,
          type: inv.type,
          status: inv.status,
          jobTitle: inv.job?.title,
          sentAt: inv.createdAt,
        })),
        messageCount,
      },

      // Shortlist info
      shortlists: shortlistsWithCandidate.map(sc => ({
        id: sc.shortlist.id,
        name: sc.shortlist.name,
        notes: sc.notes,
        rating: sc.rating,
      })),
    };

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching job seeker profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// Helper: Calculate profile completeness
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculateProfileCompleteness(user: any): number {
  const fields = [
    !!user.name,
    !!user.title || (user.workExperiences?.length || 0) > 0,
    !!user.bio,
    !!user.location || !!user.city,
    (user.skills?.length || 0) > 0,
    !!user.yearsOfExp,
    !!user.expectedSalary,
    !!user.preferredWorkSetup,
    !!user.preferredJobType,
    (user.workExperiences?.length || 0) > 0,
    (user.educations?.length || 0) > 0,
    !!user.avatar,
    !!user.resumeUrl,
    !!user.linkedinUrl || !!user.portfolioUrl || !!user.githubUrl,
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

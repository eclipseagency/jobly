import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/employee/job-alerts/matches - Get matching jobs for an alert
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('alertId');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 });
    }

    // Get the alert
    const alert = await prisma.jobAlert.findUnique({
      where: { id: alertId },
    });

    if (!alert || alert.userId !== userId) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    // Build query based on alert criteria
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {
      isActive: true,
      approvalStatus: 'APPROVED',
    };

    // Keywords search (title or description)
    if (alert.keywords && alert.keywords.length > 0) {
      whereClause.OR = alert.keywords.map(keyword => ({
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
        ],
      }));
    }

    // Location filter
    if (alert.locations && alert.locations.length > 0) {
      whereClause.location = {
        in: alert.locations.map(l => l.toLowerCase()),
        mode: 'insensitive',
      };
    }

    // Job type filter
    if (alert.jobTypes && alert.jobTypes.length > 0) {
      whereClause.jobType = { in: alert.jobTypes };
    }

    // Remote only
    if (alert.remoteOnly) {
      whereClause.locationType = 'remote';
    }

    // Get matching jobs
    const jobs = await prisma.job.findMany({
      where: whereClause,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            logo: true,
            city: true,
            isVerified: true,
          },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Calculate match score for each job
    const jobsWithScore = jobs.map(job => {
      let score = 0;
      const matchReasons: string[] = [];

      // Keyword matches
      if (alert.keywords && alert.keywords.length > 0) {
        for (const keyword of alert.keywords) {
          const kw = keyword.toLowerCase();
          if (job.title.toLowerCase().includes(kw)) {
            score += 30;
            matchReasons.push(`Title contains "${keyword}"`);
          }
          if (job.description?.toLowerCase().includes(kw)) {
            score += 20;
            matchReasons.push(`Description contains "${keyword}"`);
          }
        }
      }

      // Location match
      if (alert.locations && alert.locations.length > 0 && job.location) {
        for (const loc of alert.locations) {
          if (job.location.toLowerCase().includes(loc.toLowerCase())) {
            score += 25;
            matchReasons.push(`Location: ${job.location}`);
            break;
          }
        }
      }

      // Remote preference match
      if (alert.remoteOnly && job.locationType === 'remote') {
        score += 20;
        matchReasons.push('Remote position');
      }

      // Job type match
      if (alert.jobTypes && alert.jobTypes.length > 0 && job.jobType) {
        if (alert.jobTypes.includes(job.jobType)) {
          score += 15;
          matchReasons.push(`${job.jobType} position`);
        }
      }

      // Salary match
      if (job.salary) {
        const salaryNum = parseInt(job.salary.replace(/[^0-9]/g, ''));
        if (!isNaN(salaryNum)) {
          if (alert.salaryMin && salaryNum >= alert.salaryMin) {
            score += 10;
          }
          if (alert.salaryMax && salaryNum <= alert.salaryMax) {
            score += 10;
          }
        }
      }

      return {
        id: job.id,
        title: job.title,
        location: job.location,
        locationType: job.locationType,
        salary: job.salary,
        jobType: job.jobType,
        createdAt: job.createdAt,
        company: {
          id: job.tenant.id,
          name: job.tenant.name,
          logo: job.tenant.logo,
          city: job.tenant.city,
          isVerified: job.tenant.isVerified,
        },
        applicationCount: job._count.applications,
        matchScore: Math.min(score, 100),
        matchReasons: matchReasons.slice(0, 3),
      };
    });

    // Sort by match score
    jobsWithScore.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      jobs: jobsWithScore,
      total: jobsWithScore.length,
    });
  } catch (error) {
    console.error('Error fetching matching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matching jobs' },
      { status: 500 }
    );
  }
}

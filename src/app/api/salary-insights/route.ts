import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/salary-insights - Get salary insights for a job title
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobTitle = searchParams.get('jobTitle');
    const location = searchParams.get('location');
    const experienceYears = searchParams.get('experienceYears');

    if (!jobTitle) {
      return NextResponse.json({ error: 'Job title is required' }, { status: 400 });
    }

    // Normalize job title for searching
    const normalizedTitle = jobTitle.toLowerCase().trim();

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {
      isApproved: true,
      isHidden: false,
      OR: [
        { jobTitle: { contains: normalizedTitle, mode: 'insensitive' } },
        { normalizedTitle: { contains: normalizedTitle, mode: 'insensitive' } },
      ],
    };

    if (location) {
      whereClause.location = { contains: location, mode: 'insensitive' };
    }

    if (experienceYears) {
      const years = parseInt(experienceYears);
      whereClause.yearsExperience = {
        gte: Math.max(0, years - 2),
        lte: years + 2,
      };
    }

    // Get salary reports
    const reports = await prisma.salaryReport.findMany({
      where: whereClause,
      select: {
        baseSalary: true,
        totalCompensation: true,
        bonus: true,
        stockOptions: true,
        location: true,
        yearsExperience: true,
        employmentType: true,
        educationLevel: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    if (reports.length === 0) {
      // Return estimated data based on job listings
      const jobListings = await prisma.job.findMany({
        where: {
          isActive: true,
          approvalStatus: 'APPROVED',
          title: { contains: normalizedTitle, mode: 'insensitive' },
          salary: { not: null },
        },
        select: { salary: true, location: true },
        take: 50,
      });

      if (jobListings.length === 0) {
        return NextResponse.json({
          dataSource: 'none',
          message: 'No salary data available for this job title',
          suggestions: [
            'Try a more common job title',
            'Remove location filter',
            'Be the first to submit a salary report',
          ],
        });
      }

      // Parse salary ranges from job listings
      const salaries = jobListings
        .map(job => {
          const match = job.salary?.match(/[\d,]+/g);
          if (match) {
            return parseInt(match[0].replace(/,/g, ''));
          }
          return null;
        })
        .filter(Boolean) as number[];

      if (salaries.length > 0) {
        salaries.sort((a, b) => a - b);
        const median = salaries[Math.floor(salaries.length / 2)];
        const min = salaries[0];
        const max = salaries[salaries.length - 1];

        return NextResponse.json({
          dataSource: 'job_listings',
          sampleSize: salaries.length,
          currency: 'PHP',
          period: 'yearly',
          salary: {
            median,
            min,
            max,
            percentile25: salaries[Math.floor(salaries.length * 0.25)],
            percentile75: salaries[Math.floor(salaries.length * 0.75)],
          },
          note: 'Data estimated from job listings',
        });
      }
    }

    // Calculate statistics from salary reports
    const salaries = reports.map(r => r.baseSalary).sort((a, b) => a - b);
    const totalComps = reports
      .filter(r => r.totalCompensation)
      .map(r => r.totalCompensation as number)
      .sort((a, b) => a - b);

    const calculateStats = (arr: number[]) => {
      if (arr.length === 0) return null;
      arr.sort((a, b) => a - b);
      const sum = arr.reduce((a, b) => a + b, 0);
      return {
        min: arr[0],
        max: arr[arr.length - 1],
        median: arr[Math.floor(arr.length / 2)],
        average: Math.round(sum / arr.length),
        percentile25: arr[Math.floor(arr.length * 0.25)],
        percentile75: arr[Math.floor(arr.length * 0.75)],
        percentile90: arr[Math.floor(arr.length * 0.9)],
      };
    };

    // Group by experience level
    const byExperience: Record<string, number[]> = {
      '0-2': [],
      '3-5': [],
      '6-10': [],
      '10+': [],
    };

    reports.forEach(r => {
      const years = r.yearsExperience || 0;
      if (years <= 2) byExperience['0-2'].push(r.baseSalary);
      else if (years <= 5) byExperience['3-5'].push(r.baseSalary);
      else if (years <= 10) byExperience['6-10'].push(r.baseSalary);
      else byExperience['10+'].push(r.baseSalary);
    });

    // Group by location
    const byLocation: Record<string, number[]> = {};
    reports.forEach(r => {
      const loc = r.location || 'Unknown';
      if (!byLocation[loc]) byLocation[loc] = [];
      byLocation[loc].push(r.baseSalary);
    });

    // Group by employment type
    const byEmploymentType: Record<string, number[]> = {};
    reports.forEach(r => {
      const type = r.employmentType || 'full-time';
      if (!byEmploymentType[type]) byEmploymentType[type] = [];
      byEmploymentType[type].push(r.baseSalary);
    });

    return NextResponse.json({
      dataSource: 'salary_reports',
      sampleSize: reports.length,
      currency: 'PHP',
      period: 'yearly',
      jobTitle,
      location: location || 'All locations',
      baseSalary: calculateStats(salaries),
      totalCompensation: totalComps.length > 0 ? calculateStats(totalComps) : null,
      byExperience: Object.fromEntries(
        Object.entries(byExperience)
          .filter(([_, arr]) => arr.length > 0)
          .map(([key, arr]) => [key, calculateStats(arr)])
      ),
      byLocation: Object.fromEntries(
        Object.entries(byLocation)
          .filter(([_, arr]) => arr.length >= 3) // Only show if at least 3 reports
          .map(([key, arr]) => [key, { count: arr.length, median: calculateStats(arr)?.median }])
          .sort((a, b) => (b[1] as { median: number }).median - (a[1] as { median: number }).median)
          .slice(0, 10)
      ),
      byEmploymentType: Object.fromEntries(
        Object.entries(byEmploymentType)
          .filter(([_, arr]) => arr.length > 0)
          .map(([key, arr]) => [key, calculateStats(arr)])
      ),
      lastUpdated: reports[0]?.createdAt,
    });
  } catch (error) {
    console.error('Error fetching salary insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch salary insights' },
      { status: 500 }
    );
  }
}

// POST /api/salary-insights - Submit a salary report
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      jobTitle,
      companyName,
      tenantId,
      baseSalary,
      totalCompensation,
      bonus,
      stockOptions,
      commission,
      otherBenefits,
      location,
      yearsExperience,
      yearsAtCompany,
      employmentType,
      department,
      educationLevel,
    } = body;

    if (!jobTitle || !baseSalary) {
      return NextResponse.json(
        { error: 'Job title and base salary are required' },
        { status: 400 }
      );
    }

    // Normalize job title
    const normalizedTitle = jobTitle.toLowerCase().trim();

    // Create salary report
    const report = await prisma.salaryReport.create({
      data: {
        userId,
        jobTitle,
        normalizedTitle,
        companyName,
        tenantId,
        baseSalary: parseInt(baseSalary),
        totalCompensation: totalCompensation ? parseInt(totalCompensation) : null,
        bonus: bonus ? parseInt(bonus) : null,
        stockOptions: stockOptions ? parseInt(stockOptions) : null,
        commission: commission ? parseInt(commission) : null,
        otherBenefits,
        location,
        yearsExperience: yearsExperience ? parseInt(yearsExperience) : null,
        yearsAtCompany: yearsAtCompany ? parseInt(yearsAtCompany) : null,
        employmentType,
        department,
        educationLevel,
      },
    });

    return NextResponse.json({
      success: true,
      report,
      message: 'Salary report submitted successfully. Thank you for contributing!',
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting salary report:', error);
    return NextResponse.json(
      { error: 'Failed to submit salary report' },
      { status: 500 }
    );
  }
}

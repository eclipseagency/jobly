import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { JobApprovalStatus } from '@prisma/client';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/jobs/categories - Get job categories with counts
export async function GET() {
  try {
    // Get all active jobs grouped by department
    const departmentCounts = await prisma.job.groupBy({
      by: ['department'],
      where: {
        isActive: true,
        approvalStatus: JobApprovalStatus.APPROVED,
        department: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    // Transform the results
    const categories = departmentCounts
      .filter((item) => item.department) // Filter out null departments
      .map((item) => ({
        name: item.department as string,
        count: item._count.id,
      }));

    return NextResponse.json({
      categories,
      total: categories.reduce((sum, cat) => sum + cat.count, 0),
    });
  } catch (error) {
    console.error('Error fetching job categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job categories', categories: [] },
      { status: 500 }
    );
  }
}

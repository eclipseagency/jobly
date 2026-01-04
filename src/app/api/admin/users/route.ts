import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Verify admin token
function verifyAdminToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  try {
    const token = authHeader.substring(7);
    const decoded = Buffer.from(token, 'base64').toString();
    const [username] = decoded.split(':');
    return username === 'joblyadmin';
  } catch {
    return false;
  }
}

// GET /api/admin/users - List all users
export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // 'employee', 'employer', or null for all
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};

    if (role === 'employee') {
      where.role = 'EMPLOYEE';
    } else if (role === 'employer') {
      where.role = 'EMPLOYER';
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
              isVerified: true,
            },
          },
          _count: {
            select: {
              applications: true,
              savedJobs: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Get stats
    const stats = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });

    const employeeCount = stats.find(s => s.role === 'EMPLOYEE')?._count || 0;
    const employerCount = stats.find(s => s.role === 'EMPLOYER')?._count || 0;

    return NextResponse.json({
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.toLowerCase(),
        avatar: user.avatar,
        phone: user.phone,
        location: user.location,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        tenant: user.tenant,
        stats: {
          applications: user._count.applications,
          savedJobs: user._count.savedJobs,
        },
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total: employeeCount + employerCount,
        employees: employeeCount,
        employers: employerCount,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

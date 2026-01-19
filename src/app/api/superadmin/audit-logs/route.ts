import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSuperAdmin, hasPermission } from '@/lib/superadmin-auth';

export const dynamic = 'force-dynamic';

// GET /api/superadmin/audit-logs - Get audit logs
export async function GET(request: NextRequest) {
  const authResult = requireSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;
  const { admin } = authResult;

  // Only super admins can view audit logs
  if (admin.role !== 'super_admin') {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const action = searchParams.get('action');
    const resource = searchParams.get('resource');
    const severity = searchParams.get('severity');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const exportAll = searchParams.get('export') === 'true';

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    if (action) {
      whereClause.action = action;
    }

    if (resource) {
      whereClause.resource = resource;
    }

    if (severity) {
      whereClause.severity = severity;
    }

    if (category) {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { actorEmail: { contains: search, mode: 'insensitive' } },
        { actorName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { resourceId: { contains: search, mode: 'insensitive' } },
      ];
    }

    // For export, return all logs (up to 10000)
    if (exportAll) {
      const logs = await prisma.auditLog.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 10000,
      });

      return NextResponse.json({ logs });
    }

    // Regular paginated query
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where: whereClause }),
    ]);

    // Get summary stats
    const [
      totalLogs,
      todayLogs,
      warningLogs,
      errorLogs,
    ] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.count({
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.auditLog.count({ where: { severity: 'warning' } }),
      prisma.auditLog.count({
        where: { severity: { in: ['error', 'critical'] } },
      }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        total: totalLogs,
        today: todayLogs,
        warnings: warningLogs,
        errors: errorLogs,
      },
    });
  } catch (error) {
    console.error('[SuperAdmin Audit Logs] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}

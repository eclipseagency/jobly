import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSuperAdmin, hasPermission } from '@/lib/superadmin-auth';

export const dynamic = 'force-dynamic';

// System settings stored in memory (in production, use Redis or database)
// For now, we'll use a simple in-memory store that persists during runtime
const systemSettings: Record<string, any> = {
  requireJobApproval: true,
  requireEmployerVerification: false,
  maxJobsPerEmployer: 50,
  maxApplicationsPerUser: 100,
  featuredJobDurationDays: 7,
  autoExpireJobsDays: 30,
  allowPublicJobPosting: true,
  maintenanceMode: false,
  maintenanceMessage: '',
  emailNotifications: true,
  slackWebhookUrl: '',
};

// GET /api/superadmin/settings - Get system settings
export async function GET(request: NextRequest) {
  const authResult = requireSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;
  const { admin } = authResult;

  if (!hasPermission(admin, 'canManageSettings')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    // Get database stats
    const [
      totalUsers,
      totalEmployers,
      totalJobs,
      totalApplications,
      pendingJobs,
      unverifiedEmployers,
      suspendedUsers,
      suspendedEmployers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.tenant.count(),
      prisma.job.count(),
      prisma.application.count(),
      prisma.job.count({ where: { approvalStatus: 'PENDING' } }),
      prisma.tenant.count({ where: { isVerified: false } }),
      prisma.user.count({ where: { isSuspended: true } }),
      prisma.tenant.count({ where: { isSuspended: true } }),
    ]);

    // Get environment info (safe to expose)
    const environmentInfo = {
      nodeEnv: process.env.NODE_ENV || 'development',
      databaseConnected: true,
      version: '1.0.0',
    };

    return NextResponse.json({
      settings: systemSettings,
      stats: {
        totalUsers,
        totalEmployers,
        totalJobs,
        totalApplications,
        pendingJobs,
        unverifiedEmployers,
        suspendedUsers,
        suspendedEmployers,
      },
      environment: environmentInfo,
    });
  } catch (error) {
    console.error('[SuperAdmin Settings] Get error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PATCH /api/superadmin/settings - Update system settings
export async function PATCH(request: NextRequest) {
  const authResult = requireSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;
  const { admin } = authResult;

  if (!hasPermission(admin, 'canManageSettings')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const body = await request.json();

    // Validate and update settings
    const allowedSettings = [
      'requireJobApproval',
      'requireEmployerVerification',
      'maxJobsPerEmployer',
      'maxApplicationsPerUser',
      'featuredJobDurationDays',
      'autoExpireJobsDays',
      'allowPublicJobPosting',
      'maintenanceMode',
      'maintenanceMessage',
      'emailNotifications',
      'slackWebhookUrl',
    ];

    for (const key of allowedSettings) {
      if (body[key] !== undefined) {
        systemSettings[key] = body[key];
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated',
      settings: systemSettings,
    });
  } catch (error) {
    console.error('[SuperAdmin Settings] Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

// POST /api/superadmin/settings/actions - Execute system actions
export async function POST(request: NextRequest) {
  const authResult = requireSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;
  const { admin } = authResult;

  if (!hasPermission(admin, 'canManageSettings')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { action } = await request.json();

    switch (action) {
      case 'approve_all_pending_jobs': {
        const result = await prisma.job.updateMany({
          where: { approvalStatus: 'PENDING' },
          data: {
            approvalStatus: 'APPROVED',
            approvedAt: new Date(),
            approvedBy: admin.adminId,
          },
        });
        return NextResponse.json({
          success: true,
          message: `${result.count} jobs approved`,
        });
      }

      case 'verify_all_employers': {
        const result = await prisma.tenant.updateMany({
          where: { isVerified: false },
          data: {
            isVerified: true,
            verifiedAt: new Date(),
          },
        });
        return NextResponse.json({
          success: true,
          message: `${result.count} employers verified`,
        });
      }

      case 'expire_old_jobs': {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() - (systemSettings.autoExpireJobsDays || 30));

        const result = await prisma.job.updateMany({
          where: {
            createdAt: { lt: expiryDate },
            isActive: true,
            expiresAt: null,
          },
          data: { isActive: false },
        });
        return NextResponse.json({
          success: true,
          message: `${result.count} old jobs expired`,
        });
      }

      case 'cleanup_expired_features': {
        const result = await prisma.job.updateMany({
          where: {
            isFeatured: true,
            featuredUntil: { lt: new Date() },
          },
          data: {
            isFeatured: false,
            featuredUntil: null,
          },
        });
        return NextResponse.json({
          success: true,
          message: `${result.count} featured jobs expired`,
        });
      }

      case 'unsuspend_all_users': {
        if (!hasPermission(admin, 'canSuspendAccounts')) {
          return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        }
        const result = await prisma.user.updateMany({
          where: { isSuspended: true },
          data: {
            isSuspended: false,
            suspendedAt: null,
            suspensionReason: null,
          },
        });
        return NextResponse.json({
          success: true,
          message: `${result.count} users unsuspended`,
        });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[SuperAdmin Settings] Action error:', error);
    return NextResponse.json(
      { error: 'Failed to execute action' },
      { status: 500 }
    );
  }
}

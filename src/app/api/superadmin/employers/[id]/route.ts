import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSuperAdmin, hasPermission } from '@/lib/superadmin-auth';

export const dynamic = 'force-dynamic';

// GET /api/superadmin/employers/[id] - Get employer details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = requireSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;
  const { admin } = authResult;

  if (!hasPermission(admin, 'canManageEmployers')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { id } = await params;

    const employer = await prisma.tenant.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            isSuspended: true,
            createdAt: true,
            lastLoginAt: true,
          },
        },
        jobs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            title: true,
            location: true,
            jobType: true,
            isActive: true,
            approvalStatus: true,
            createdAt: true,
            _count: {
              select: { applications: true },
            },
          },
        },
        _count: {
          select: {
            users: true,
            jobs: true,
          },
        },
      },
    });

    if (!employer) {
      return NextResponse.json({ error: 'Employer not found' }, { status: 404 });
    }

    // Get additional stats
    const [activeJobs, pendingJobs, totalApplications, recentApplications] = await Promise.all([
      prisma.job.count({
        where: { tenantId: id, isActive: true, approvalStatus: 'APPROVED' },
      }),
      prisma.job.count({
        where: { tenantId: id, approvalStatus: 'PENDING' },
      }),
      prisma.application.count({
        where: { job: { tenantId: id } },
      }),
      prisma.application.findMany({
        where: { job: { tenantId: id } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          status: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
          job: { select: { title: true } },
        },
      }),
    ]);

    return NextResponse.json({
      employer: {
        ...employer,
        stats: {
          usersCount: employer._count.users,
          totalJobs: employer._count.jobs,
          activeJobs,
          pendingJobs,
          totalApplications,
        },
        recentApplications,
      },
    });
  } catch (error) {
    console.error('[SuperAdmin Employers] Get error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employer' },
      { status: 500 }
    );
  }
}

// PATCH /api/superadmin/employers/[id] - Update employer
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = requireSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;
  const { admin } = authResult;

  if (!hasPermission(admin, 'canManageEmployers')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { action, reason, ...updateData } = body;

    const employer = await prisma.tenant.findUnique({ where: { id } });
    if (!employer) {
      return NextResponse.json({ error: 'Employer not found' }, { status: 404 });
    }

    // Handle specific actions
    if (action === 'verify') {
      await prisma.tenant.update({
        where: { id },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, message: 'Employer verified' });
    }

    if (action === 'unverify') {
      await prisma.tenant.update({
        where: { id },
        data: {
          isVerified: false,
          verifiedAt: null,
        },
      });

      return NextResponse.json({ success: true, message: 'Employer unverified' });
    }

    if (action === 'suspend') {
      if (!hasPermission(admin, 'canSuspendAccounts')) {
        return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
      }

      await prisma.tenant.update({
        where: { id },
        data: {
          isSuspended: true,
          suspendedAt: new Date(),
          suspensionReason: reason || 'Suspended by admin',
        },
      });

      // Also suspend all users of this employer
      await prisma.user.updateMany({
        where: { tenantId: id },
        data: {
          isSuspended: true,
          suspendedAt: new Date(),
          suspensionReason: 'Employer account suspended',
        },
      });

      // Deactivate all their jobs
      await prisma.job.updateMany({
        where: { tenantId: id },
        data: { isActive: false },
      });

      return NextResponse.json({ success: true, message: 'Employer suspended' });
    }

    if (action === 'unsuspend') {
      await prisma.tenant.update({
        where: { id },
        data: {
          isSuspended: false,
          suspendedAt: null,
          suspensionReason: null,
        },
      });

      // Unsuspend all users
      await prisma.user.updateMany({
        where: { tenantId: id, suspensionReason: 'Employer account suspended' },
        data: {
          isSuspended: false,
          suspendedAt: null,
          suspensionReason: null,
        },
      });

      return NextResponse.json({ success: true, message: 'Employer unsuspended' });
    }

    if (action === 'approve_all_jobs') {
      await prisma.job.updateMany({
        where: { tenantId: id, approvalStatus: 'PENDING' },
        data: {
          approvalStatus: 'APPROVED',
          approvedAt: new Date(),
          approvedBy: admin.adminId,
        },
      });

      return NextResponse.json({ success: true, message: 'All pending jobs approved' });
    }

    // General update
    const allowedFields = ['name', 'email', 'phone', 'website', 'industry', 'size', 'description', 'city', 'country'];
    const filteredData: any = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    if (Object.keys(filteredData).length > 0) {
      await prisma.tenant.update({
        where: { id },
        data: filteredData,
      });
    }

    return NextResponse.json({ success: true, message: 'Employer updated' });
  } catch (error) {
    console.error('[SuperAdmin Employers] Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update employer' },
      { status: 500 }
    );
  }
}

// DELETE /api/superadmin/employers/[id] - Delete employer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = requireSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;
  const { admin } = authResult;

  if (!hasPermission(admin, 'canDeleteData')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { id } = await params;

    const employer = await prisma.tenant.findUnique({ where: { id } });
    if (!employer) {
      return NextResponse.json({ error: 'Employer not found' }, { status: 404 });
    }

    // Delete employer (cascades to jobs, users, applications)
    await prisma.tenant.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Employer deleted' });
  } catch (error) {
    console.error('[SuperAdmin Employers] Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete employer' },
      { status: 500 }
    );
  }
}

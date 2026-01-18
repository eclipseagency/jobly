import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSuperAdmin, hasPermission } from '@/lib/superadmin-auth';

export const dynamic = 'force-dynamic';

// GET /api/superadmin/users/[id] - Get user details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = requireSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;
  const { admin } = authResult;

  if (!hasPermission(admin, 'canManageUsers')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        tenant: true,
        applications: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            job: { select: { title: true, tenant: { select: { name: true } } } },
          },
        },
        workExperiences: { orderBy: { startDate: 'desc' } },
        educations: { orderBy: { startDate: 'desc' } },
        _count: {
          select: {
            applications: true,
            savedJobs: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('[SuperAdmin Users] Get error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PATCH /api/superadmin/users/[id] - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = requireSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;
  const { admin } = authResult;

  if (!hasPermission(admin, 'canManageUsers')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { action, reason, ...updateData } = body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Handle specific actions
    if (action === 'suspend') {
      if (!hasPermission(admin, 'canSuspendAccounts')) {
        return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
      }

      await prisma.user.update({
        where: { id },
        data: {
          isSuspended: true,
          suspendedAt: new Date(),
          suspensionReason: reason || 'Suspended by admin',
        },
      });

      return NextResponse.json({ success: true, message: 'User suspended' });
    }

    if (action === 'unsuspend') {
      await prisma.user.update({
        where: { id },
        data: {
          isSuspended: false,
          suspendedAt: null,
          suspensionReason: null,
        },
      });

      return NextResponse.json({ success: true, message: 'User unsuspended' });
    }

    if (action === 'activate') {
      await prisma.user.update({
        where: { id },
        data: { isActive: true },
      });

      return NextResponse.json({ success: true, message: 'User activated' });
    }

    if (action === 'deactivate') {
      await prisma.user.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({ success: true, message: 'User deactivated' });
    }

    // General update
    const allowedFields = ['name', 'phone', 'location', 'isActive'];
    const filteredData: any = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    if (Object.keys(filteredData).length > 0) {
      await prisma.user.update({
        where: { id },
        data: filteredData,
      });
    }

    return NextResponse.json({ success: true, message: 'User updated' });
  } catch (error) {
    console.error('[SuperAdmin Users] Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/superadmin/users/[id] - Delete user
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

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete user (cascades to related data)
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('[SuperAdmin Users] Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

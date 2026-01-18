import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSuperAdmin, hasPermission } from '@/lib/superadmin-auth';

export const dynamic = 'force-dynamic';

// GET /api/superadmin/jobs/[id] - Get job details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = requireSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;
  const { admin } = authResult;

  if (!hasPermission(admin, 'canApproveJobs')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            logo: true,
            website: true,
            industry: true,
            size: true,
            isVerified: true,
            isSuspended: true,
          },
        },
        applications: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            status: true,
            createdAt: true,
            user: { select: { name: true, email: true } },
          },
        },
        _count: {
          select: {
            applications: true,
            savedJobs: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error('[SuperAdmin Jobs] Get error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    );
  }
}

// PATCH /api/superadmin/jobs/[id] - Update job (approve/reject/etc)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = requireSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;
  const { admin } = authResult;

  if (!hasPermission(admin, 'canApproveJobs')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { action, reason, featuredUntil, ...updateData } = body;

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Handle specific actions
    if (action === 'approve') {
      await prisma.job.update({
        where: { id },
        data: {
          approvalStatus: 'APPROVED',
          approvedAt: new Date(),
          approvedBy: admin.adminId,
          rejectionReason: null,
        },
      });

      return NextResponse.json({ success: true, message: 'Job approved' });
    }

    if (action === 'reject') {
      if (!reason) {
        return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
      }

      await prisma.job.update({
        where: { id },
        data: {
          approvalStatus: 'REJECTED',
          rejectionReason: reason,
          isActive: false,
        },
      });

      return NextResponse.json({ success: true, message: 'Job rejected' });
    }

    if (action === 'pending') {
      await prisma.job.update({
        where: { id },
        data: {
          approvalStatus: 'PENDING',
          approvedAt: null,
          approvedBy: null,
          rejectionReason: null,
        },
      });

      return NextResponse.json({ success: true, message: 'Job set to pending' });
    }

    if (action === 'activate') {
      await prisma.job.update({
        where: { id },
        data: { isActive: true },
      });

      return NextResponse.json({ success: true, message: 'Job activated' });
    }

    if (action === 'deactivate') {
      await prisma.job.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({ success: true, message: 'Job deactivated' });
    }

    if (action === 'feature') {
      await prisma.job.update({
        where: { id },
        data: {
          isFeatured: true,
          featuredUntil: featuredUntil ? new Date(featuredUntil) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return NextResponse.json({ success: true, message: 'Job featured' });
    }

    if (action === 'unfeature') {
      await prisma.job.update({
        where: { id },
        data: {
          isFeatured: false,
          featuredUntil: null,
        },
      });

      return NextResponse.json({ success: true, message: 'Job unfeatured' });
    }

    if (action === 'request_changes') {
      if (!reason) {
        return NextResponse.json({ error: 'Change request message is required' }, { status: 400 });
      }

      await prisma.job.update({
        where: { id },
        data: {
          approvalStatus: 'CHANGES_REQUESTED',
          rejectionReason: reason, // Store the change request message
          isActive: false,
        },
      });

      return NextResponse.json({ success: true, message: 'Change request sent to employer' });
    }

    // General update
    const allowedFields = ['title', 'description', 'location', 'salary', 'jobType', 'isActive'];
    const filteredData: any = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    if (Object.keys(filteredData).length > 0) {
      await prisma.job.update({
        where: { id },
        data: filteredData,
      });
    }

    return NextResponse.json({ success: true, message: 'Job updated' });
  } catch (error) {
    console.error('[SuperAdmin Jobs] Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    );
  }
}

// DELETE /api/superadmin/jobs/[id] - Delete job
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

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Delete job (cascades to applications)
    await prisma.job.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Job deleted' });
  } catch (error) {
    console.error('[SuperAdmin Jobs] Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    );
  }
}

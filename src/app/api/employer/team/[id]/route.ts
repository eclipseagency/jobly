import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// PUT /api/employer/team/[id] - Update team member role
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const tenantId = request.headers.get('x-tenant-id');

    if (!userId || !tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission (must be OWNER or ADMIN)
    const currentMember = await prisma.tenantMember.findFirst({
      where: { tenantId, userId },
    });

    if (!currentMember || !['EMPLOYER_OWNER', 'EMPLOYER_ADMIN'].includes(currentMember.role)) {
      return NextResponse.json(
        { error: 'Only owners and admins can update team members' },
        { status: 403 }
      );
    }

    // Get the member to update
    const memberToUpdate = await prisma.tenantMember.findFirst({
      where: { id: params.id, tenantId },
    });

    if (!memberToUpdate) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Cannot modify owner (check if member has EMPLOYER_OWNER role)
    if (memberToUpdate.role === 'EMPLOYER_OWNER') {
      return NextResponse.json(
        { error: 'Cannot modify the owner' },
        { status: 403 }
      );
    }

    // Admins cannot modify other admins (only owner can)
    if (
      currentMember.role === 'EMPLOYER_ADMIN' &&
      memberToUpdate.role === 'EMPLOYER_ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Only the owner can modify other admins' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { role, isActive } = body;

    // Validate role if provided
    if (role) {
      const validRoles = ['EMPLOYER_ADMIN', 'EMPLOYER_RECRUITER', 'EMPLOYER_VIEWER'];
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }

      // Admins cannot promote to admin
      if (currentMember.role === 'EMPLOYER_ADMIN' && role === 'EMPLOYER_ADMIN') {
        return NextResponse.json(
          { error: 'Only the owner can promote to admin' },
          { status: 403 }
        );
      }
    }

    const updatedMember = await prisma.tenantMember.update({
      where: { id: params.id },
      data: {
        role: role || undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({
      member: {
        id: updatedMember.id,
        userId: updatedMember.userId,
        name: updatedMember.user.name,
        email: updatedMember.user.email,
        avatar: updatedMember.user.avatar,
        role: updatedMember.role,
        isActive: updatedMember.isActive,
        invitedAt: updatedMember.invitedAt,
        acceptedAt: updatedMember.acceptedAt,
      },
    });
  } catch (error) {
    console.error('[Team] Error updating:', error);
    return NextResponse.json(
      { error: 'Failed to update team member' },
      { status: 500 }
    );
  }
}

// DELETE /api/employer/team/[id] - Remove team member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const tenantId = request.headers.get('x-tenant-id');

    if (!userId || !tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission (must be OWNER or ADMIN)
    const currentMember = await prisma.tenantMember.findFirst({
      where: { tenantId, userId },
    });

    if (!currentMember || !['EMPLOYER_OWNER', 'EMPLOYER_ADMIN'].includes(currentMember.role)) {
      return NextResponse.json(
        { error: 'Only owners and admins can remove team members' },
        { status: 403 }
      );
    }

    // Get the member to remove
    const memberToRemove = await prisma.tenantMember.findFirst({
      where: { id: params.id, tenantId },
    });

    if (!memberToRemove) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Cannot remove owner (check if member has EMPLOYER_OWNER role)
    if (memberToRemove.role === 'EMPLOYER_OWNER') {
      return NextResponse.json(
        { error: 'Cannot remove the owner' },
        { status: 403 }
      );
    }

    // Admins cannot remove other admins (only owner can)
    if (
      currentMember.role === 'EMPLOYER_ADMIN' &&
      memberToRemove.role === 'EMPLOYER_ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Only the owner can remove other admins' },
        { status: 403 }
      );
    }

    await prisma.tenantMember.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Team] Error removing:', error);
    return NextResponse.json(
      { error: 'Failed to remove team member' },
      { status: 500 }
    );
  }
}

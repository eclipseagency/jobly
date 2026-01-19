import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// DELETE /api/employer/team/invitations/[id] - Cancel invitation
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
        { error: 'Only owners and admins can cancel invitations' },
        { status: 403 }
      );
    }

    // Get the invitation
    const invitation = await prisma.tenantInvitation.findFirst({
      where: { id: params.id, tenantId },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Update status to REVOKED
    await prisma.tenantInvitation.update({
      where: { id: params.id },
      data: { status: 'REVOKED' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Invitation] Error canceling:', error);
    return NextResponse.json(
      { error: 'Failed to cancel invitation' },
      { status: 500 }
    );
  }
}

// POST /api/employer/team/invitations/[id] - Resend invitation
export async function POST(
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
        { error: 'Only owners and admins can resend invitations' },
        { status: 403 }
      );
    }

    // Get the invitation
    const invitation = await prisma.tenantInvitation.findFirst({
      where: { id: params.id, tenantId },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Generate new token and extend expiry
    const newToken = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    const updatedInvitation = await prisma.tenantInvitation.update({
      where: { id: params.id },
      data: {
        token: newToken,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // TODO: Send invitation email

    return NextResponse.json({
      invitation: {
        id: updatedInvitation.id,
        email: updatedInvitation.email,
        role: updatedInvitation.role,
        status: updatedInvitation.status,
        expiresAt: updatedInvitation.expiresAt,
      },
      message: 'Invitation resent successfully',
    });
  } catch (error) {
    console.error('[Invitation] Error resending:', error);
    return NextResponse.json(
      { error: 'Failed to resend invitation' },
      { status: 500 }
    );
  }
}

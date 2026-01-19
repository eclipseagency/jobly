import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/employer/team - Get team members for tenant
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const tenantId = request.headers.get('x-tenant-id');

    if (!userId || !tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get team members
    const members = await prisma.tenantMember.findMany({
      where: { tenantId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            createdAt: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' },
        { invitedAt: 'asc' },
      ],
    });

    // Get pending invitations
    const invitations = await prisma.tenantInvitation.findMany({
      where: {
        tenantId,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get tenant info
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json({
      members: members.map((m) => ({
        id: m.id,
        userId: m.userId,
        name: m.user.name,
        email: m.user.email,
        avatar: m.user.avatar,
        role: m.role,
        isActive: m.isActive,
        invitedAt: m.invitedAt,
        acceptedAt: m.acceptedAt,
        isOwner: m.role === 'EMPLOYER_OWNER',
      })),
      invitations: invitations.map((i) => ({
        id: i.id,
        email: i.email,
        role: i.role,
        status: i.status,
        createdAt: i.createdAt,
        expiresAt: i.expiresAt,
      })),
      totalMembers: members.length,
      activeMembers: members.filter((m) => m.isActive).length,
    });
  } catch (error) {
    console.error('[Team] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

// POST /api/employer/team - Invite new team member
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const tenantId = request.headers.get('x-tenant-id');

    if (!userId || !tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to invite (must be OWNER or ADMIN)
    const currentMember = await prisma.tenantMember.findFirst({
      where: { tenantId, userId },
    });

    if (!currentMember || !['EMPLOYER_OWNER', 'EMPLOYER_ADMIN'].includes(currentMember.role)) {
      return NextResponse.json(
        { error: 'Only owners and admins can invite team members' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['EMPLOYER_ADMIN', 'EMPLOYER_RECRUITER', 'EMPLOYER_VIEWER'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const existingMember = await prisma.tenantMember.findFirst({
        where: { tenantId, userId: existingUser.id },
      });

      if (existingMember) {
        return NextResponse.json(
          { error: 'User is already a team member' },
          { status: 400 }
        );
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.tenantInvitation.findFirst({
      where: {
        tenantId,
        email,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'An invitation is already pending for this email' },
        { status: 400 }
      );
    }

    // Generate invitation token
    const token = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // Create invitation
    const invitation = await prisma.tenantInvitation.create({
      data: {
        tenantId,
        email,
        role,
        token,
        invitedBy: userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // TODO: Send invitation email

    return NextResponse.json(
      {
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          status: invitation.status,
          createdAt: invitation.createdAt,
          expiresAt: invitation.expiresAt,
        },
        message: 'Invitation sent successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Team] Error inviting:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}

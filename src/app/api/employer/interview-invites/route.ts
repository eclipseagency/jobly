import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/employer/interview-invites - Get all sent interview invites
export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const candidateId = searchParams.get('candidateId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const invites = await prisma.interviewInvite.findMany({
      where: {
        employerId: tenantId,
        ...(status && { status }),
        ...(candidateId && { candidateId }),
      },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            avatar: true,
            title: true,
            location: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      invites: invites.map(inv => ({
        id: inv.id,
        type: inv.type,
        message: inv.message,
        proposedDates: inv.proposedDates,
        status: inv.status,
        respondedAt: inv.respondedAt,
        responseMessage: inv.responseMessage,
        expiresAt: inv.expiresAt,
        createdAt: inv.createdAt,
        candidate: inv.candidate,
        job: inv.job,
      })),
    });
  } catch (error) {
    console.error('Error fetching invites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invites' },
      { status: 500 }
    );
  }
}

// POST /api/employer/interview-invites - Send interview invite
export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { candidateId, jobId, type, message, proposedDates, expiresAt } = body;

    if (!candidateId) {
      return NextResponse.json(
        { error: 'Candidate ID is required' },
        { status: 400 }
      );
    }

    // Verify candidate exists and is open to offers
    const candidate = await prisma.user.findFirst({
      where: {
        id: candidateId,
        role: 'EMPLOYEE',
        openToOffers: true,
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found or not available' },
        { status: 404 }
      );
    }

    // If job specified, verify it belongs to employer
    if (jobId) {
      const job = await prisma.job.findFirst({
        where: { id: jobId, tenantId },
      });
      if (!job) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }
    }

    // Create invite
    const invite = await prisma.interviewInvite.create({
      data: {
        employerId: tenantId,
        candidateId,
        jobId,
        type: type || 'general',
        message,
        proposedDates,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Create notification for candidate
    await prisma.notification.create({
      data: {
        userId: candidateId,
        type: 'interview_invite',
        title: 'Interview Invitation',
        message: jobId
          ? 'You have received an interview invitation for a position'
          : 'You have received a general interview invitation from an employer',
        link: `/dashboard/invites/${invite.id}`,
      },
    });

    return NextResponse.json({ invite }, { status: 201 });
  } catch (error) {
    console.error('Error creating invite:', error);
    return NextResponse.json(
      { error: 'Failed to send invite' },
      { status: 500 }
    );
  }
}

// PATCH /api/employer/interview-invites - Update invite status
export async function PATCH(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { inviteId, status, message, proposedDates } = body;

    if (!inviteId) {
      return NextResponse.json(
        { error: 'Invite ID is required' },
        { status: 400 }
      );
    }

    // Verify invite belongs to employer
    const invite = await prisma.interviewInvite.findFirst({
      where: { id: inviteId, employerId: tenantId },
    });

    if (!invite) {
      return NextResponse.json(
        { error: 'Invite not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.interviewInvite.update({
      where: { id: inviteId },
      data: {
        ...(status && { status }),
        ...(message !== undefined && { message }),
        ...(proposedDates && { proposedDates }),
      },
    });

    return NextResponse.json({ invite: updated });
  } catch (error) {
    console.error('Error updating invite:', error);
    return NextResponse.json(
      { error: 'Failed to update invite' },
      { status: 500 }
    );
  }
}

// DELETE /api/employer/interview-invites - Cancel/delete invite
export async function DELETE(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const { searchParams } = new URL(request.url);
    const inviteId = searchParams.get('id');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!inviteId) {
      return NextResponse.json(
        { error: 'Invite ID is required' },
        { status: 400 }
      );
    }

    // Verify invite belongs to employer
    const invite = await prisma.interviewInvite.findFirst({
      where: { id: inviteId, employerId: tenantId },
    });

    if (!invite) {
      return NextResponse.json(
        { error: 'Invite not found' },
        { status: 404 }
      );
    }

    await prisma.interviewInvite.delete({
      where: { id: inviteId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting invite:', error);
    return NextResponse.json(
      { error: 'Failed to delete invite' },
      { status: 500 }
    );
  }
}

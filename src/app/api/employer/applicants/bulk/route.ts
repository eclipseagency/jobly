import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { emailService } from '@/lib/email';

export const dynamic = 'force-dynamic';

// POST /api/employer/applicants/bulk - Bulk actions on applicants
export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');

    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { applicationIds, action, reason, message } = body;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json({ error: 'Application IDs are required' }, { status: 400 });
    }

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    // Verify all applications belong to jobs owned by this tenant
    const applications = await prisma.application.findMany({
      where: {
        id: { in: applicationIds },
        job: { tenantId },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        job: { select: { title: true, tenant: { select: { name: true } } } },
      },
    });

    if (applications.length !== applicationIds.length) {
      return NextResponse.json(
        { error: 'Some applications not found or not authorized' },
        { status: 403 }
      );
    }

    let updatedCount = 0;
    const results: { id: string; success: boolean; error?: string }[] = [];

    // Handle different actions
    switch (action) {
      case 'shortlist':
        await prisma.application.updateMany({
          where: { id: { in: applicationIds } },
          data: { status: 'shortlisted' },
        });
        updatedCount = applications.length;

        // Send emails
        for (const app of applications) {
          if (app.user.email) {
            await emailService.sendApplicationStatusEmail(app.user.email, {
              candidateName: app.user.name || 'Applicant',
              jobTitle: app.job.title,
              companyName: app.job.tenant.name,
              status: 'shortlisted',
              message,
            });
          }
          results.push({ id: app.id, success: true });
        }
        break;

      case 'reject':
        await prisma.application.updateMany({
          where: { id: { in: applicationIds } },
          data: { status: 'rejected', notes: reason || 'Rejected via bulk action' },
        });
        updatedCount = applications.length;

        // Send emails
        for (const app of applications) {
          if (app.user.email) {
            await emailService.sendApplicationStatusEmail(app.user.email, {
              candidateName: app.user.name || 'Applicant',
              jobTitle: app.job.title,
              companyName: app.job.tenant.name,
              status: 'rejected',
              message: reason,
            });
          }
          results.push({ id: app.id, success: true });
        }
        break;

      case 'reviewing':
        await prisma.application.updateMany({
          where: { id: { in: applicationIds } },
          data: { status: 'reviewing' },
        });
        updatedCount = applications.length;

        for (const app of applications) {
          if (app.user.email) {
            await emailService.sendApplicationStatusEmail(app.user.email, {
              candidateName: app.user.name || 'Applicant',
              jobTitle: app.job.title,
              companyName: app.job.tenant.name,
              status: 'reviewing',
            });
          }
          results.push({ id: app.id, success: true });
        }
        break;

      case 'message':
        if (!message) {
          return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Create messages for each applicant
        for (const app of applications) {
          try {
            await prisma.message.create({
              data: {
                senderId: tenantId,
                recipientId: app.user.id,
                subject: `Regarding your application for ${app.job.title}`,
                content: message,
                jobId: app.jobId,
              },
            });

            // Send email notification
            if (app.user.email) {
              await emailService.sendNewMessageEmail(app.user.email, {
                recipientName: app.user.name || 'Applicant',
                senderName: app.job.tenant.name,
                companyName: app.job.tenant.name,
                messagePreview: message,
                conversationUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.jobly.ph'}/dashboard/messages`,
              });
            }

            results.push({ id: app.id, success: true });
            updatedCount++;
          } catch (err) {
            results.push({ id: app.id, success: false, error: 'Failed to send message' });
          }
        }
        break;

      case 'export':
        // Generate export data
        const exportData = applications.map(app => ({
          applicationId: app.id,
          candidateName: app.user.name,
          candidateEmail: app.user.email,
          jobTitle: app.job.title,
          status: app.status,
          appliedAt: app.createdAt,
          coverLetter: app.coverLetter,
          notes: app.notes,
          screeningScore: app.screeningScore,
        }));

        return NextResponse.json({
          success: true,
          action: 'export',
          data: exportData,
          count: exportData.length,
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      action,
      updatedCount,
      results,
      message: `Successfully processed ${updatedCount} application(s)`,
    });
  } catch (error) {
    console.error('Error processing bulk action:', error);
    return NextResponse.json(
      { error: 'Failed to process bulk action' },
      { status: 500 }
    );
  }
}

import { prisma } from '@/lib/db';

// Notification types for super admin
export type SuperAdminNotificationType =
  | 'new_user'
  | 'new_employer'
  | 'new_job'
  | 'job_pending'
  | 'employer_verification_request'
  | 'user_reported'
  | 'new_application';

interface CreateNotificationParams {
  type: SuperAdminNotificationType;
  title: string;
  message: string;
  link?: string;
  relatedUserId?: string;
  relatedTenantId?: string;
  relatedJobId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create a notification for super admins
 */
export async function createSuperAdminNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.superAdminNotification.create({
      data: {
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link,
        relatedUserId: params.relatedUserId,
        relatedTenantId: params.relatedTenantId,
        relatedJobId: params.relatedJobId,
        metadata: params.metadata,
      },
    });
    return notification;
  } catch (error) {
    console.error('Error creating super admin notification:', error);
    return null;
  }
}

/**
 * Notify super admins when a new user registers
 */
export async function notifyNewUserRegistration(user: {
  id: string;
  name: string | null;
  email: string;
  role: string;
  tenantId?: string | null;
  tenantName?: string;
}) {
  const isEmployer = user.role === 'EMPLOYER';

  return createSuperAdminNotification({
    type: isEmployer ? 'new_employer' : 'new_user',
    title: isEmployer ? 'New Employer Registered' : 'New User Registered',
    message: isEmployer
      ? `${user.name || 'Unknown'} registered as an employer${user.tenantName ? ` for ${user.tenantName}` : ''}`
      : `${user.name || 'Unknown'} (${user.email}) registered as a job seeker`,
    link: `/superadmin/${isEmployer ? 'employers' : 'users'}`,
    relatedUserId: user.id,
    relatedTenantId: user.tenantId || undefined,
    metadata: {
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      companyName: user.tenantName,
    },
  });
}

/**
 * Notify super admins when a new job is posted (pending approval)
 */
export async function notifyNewJobPosted(job: {
  id: string;
  title: string;
  tenantId: string;
  tenantName?: string;
}) {
  return createSuperAdminNotification({
    type: 'new_job',
    title: 'New Job Posted',
    message: `"${job.title}" posted by ${job.tenantName || 'Unknown Company'} - pending approval`,
    link: `/superadmin/jobs`,
    relatedJobId: job.id,
    relatedTenantId: job.tenantId,
    metadata: {
      jobTitle: job.title,
      companyName: job.tenantName,
    },
  });
}

/**
 * Notify super admins when an employer requests verification
 */
export async function notifyEmployerVerificationRequest(tenant: {
  id: string;
  name: string;
}) {
  return createSuperAdminNotification({
    type: 'employer_verification_request',
    title: 'Verification Request',
    message: `${tenant.name} has requested employer verification`,
    link: `/superadmin/employers`,
    relatedTenantId: tenant.id,
    metadata: {
      companyName: tenant.name,
    },
  });
}

/**
 * Get unread notification count for super admin dashboard
 */
export async function getUnreadNotificationCount(): Promise<number> {
  try {
    return await prisma.superAdminNotification.count({
      where: { isRead: false },
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

/**
 * Get recent notifications for super admin
 */
export async function getRecentNotifications(limit: number = 10) {
  try {
    return await prisma.superAdminNotification.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    return await prisma.superAdminNotification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return null;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
  try {
    return await prisma.superAdminNotification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return null;
  }
}

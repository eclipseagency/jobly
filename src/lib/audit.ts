import { prisma } from './db';
import { Prisma } from '@prisma/client';

export interface AuditLogData {
  actorType: 'super_admin' | 'employer' | 'employee' | 'system';
  actorId?: string;
  actorEmail?: string;
  actorName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  category?: 'authentication' | 'data_modification' | 'admin_action' | 'security' | 'system';
  severity?: 'info' | 'warning' | 'error' | 'critical';
}

// Create an audit log entry
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorType: data.actorType,
        actorId: data.actorId,
        actorEmail: data.actorEmail,
        actorName: data.actorName,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        description: data.description,
        metadata: data.metadata as Prisma.InputJsonValue,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        requestId: data.requestId,
        category: data.category,
        severity: data.severity || 'info',
      },
    });
  } catch (error) {
    // Don't let audit logging failures affect the main operation
    console.error('[Audit] Failed to create audit log:', error);
  }
}

// Helper to extract request info from NextRequest
export function getRequestInfo(request: Request): { ipAddress?: string; userAgent?: string } {
  const forwarded = request.headers.get('x-forwarded-for');
  const ipAddress = forwarded?.split(',')[0]?.trim() ||
                    request.headers.get('x-real-ip') ||
                    undefined;
  const userAgent = request.headers.get('user-agent') || undefined;

  return { ipAddress, userAgent };
}

// Pre-defined audit log creators for common actions
export const auditActions = {
  // Authentication
  login: (actorType: AuditLogData['actorType'], actorId: string, actorEmail: string, success: boolean, request?: Request) =>
    createAuditLog({
      actorType,
      actorId,
      actorEmail,
      action: success ? 'login_success' : 'login_failed',
      resource: 'session',
      description: success ? 'User logged in successfully' : 'Failed login attempt',
      category: 'authentication',
      severity: success ? 'info' : 'warning',
      ...(request ? getRequestInfo(request) : {}),
    }),

  logout: (actorType: AuditLogData['actorType'], actorId: string, actorEmail: string, request?: Request) =>
    createAuditLog({
      actorType,
      actorId,
      actorEmail,
      action: 'logout',
      resource: 'session',
      description: 'User logged out',
      category: 'authentication',
      severity: 'info',
      ...(request ? getRequestInfo(request) : {}),
    }),

  // Job actions
  jobCreated: (actorId: string, actorEmail: string, jobId: string, jobTitle: string, request?: Request) =>
    createAuditLog({
      actorType: 'employer',
      actorId,
      actorEmail,
      action: 'create',
      resource: 'job',
      resourceId: jobId,
      description: `Created job: ${jobTitle}`,
      category: 'data_modification',
      severity: 'info',
      ...(request ? getRequestInfo(request) : {}),
    }),

  jobApproved: (adminId: string, adminEmail: string, jobId: string, jobTitle: string, request?: Request) =>
    createAuditLog({
      actorType: 'super_admin',
      actorId: adminId,
      actorEmail: adminEmail,
      action: 'approve',
      resource: 'job',
      resourceId: jobId,
      description: `Approved job: ${jobTitle}`,
      category: 'admin_action',
      severity: 'info',
      ...(request ? getRequestInfo(request) : {}),
    }),

  jobRejected: (adminId: string, adminEmail: string, jobId: string, jobTitle: string, reason: string, request?: Request) =>
    createAuditLog({
      actorType: 'super_admin',
      actorId: adminId,
      actorEmail: adminEmail,
      action: 'reject',
      resource: 'job',
      resourceId: jobId,
      description: `Rejected job: ${jobTitle}`,
      metadata: { reason },
      category: 'admin_action',
      severity: 'info',
      ...(request ? getRequestInfo(request) : {}),
    }),

  // User actions
  userCreated: (userId: string, email: string, role: string, request?: Request) =>
    createAuditLog({
      actorType: 'system',
      action: 'create',
      resource: 'user',
      resourceId: userId,
      description: `New user registered: ${email} (${role})`,
      category: 'authentication',
      severity: 'info',
      ...(request ? getRequestInfo(request) : {}),
    }),

  userSuspended: (adminId: string, adminEmail: string, userId: string, userEmail: string, reason: string, request?: Request) =>
    createAuditLog({
      actorType: 'super_admin',
      actorId: adminId,
      actorEmail: adminEmail,
      action: 'suspend',
      resource: 'user',
      resourceId: userId,
      description: `Suspended user: ${userEmail}`,
      metadata: { reason, targetEmail: userEmail },
      category: 'admin_action',
      severity: 'warning',
      ...(request ? getRequestInfo(request) : {}),
    }),

  userUnsuspended: (adminId: string, adminEmail: string, userId: string, userEmail: string, request?: Request) =>
    createAuditLog({
      actorType: 'super_admin',
      actorId: adminId,
      actorEmail: adminEmail,
      action: 'unsuspend',
      resource: 'user',
      resourceId: userId,
      description: `Unsuspended user: ${userEmail}`,
      metadata: { targetEmail: userEmail },
      category: 'admin_action',
      severity: 'info',
      ...(request ? getRequestInfo(request) : {}),
    }),

  // Tenant actions
  tenantVerified: (adminId: string, adminEmail: string, tenantId: string, tenantName: string, request?: Request) =>
    createAuditLog({
      actorType: 'super_admin',
      actorId: adminId,
      actorEmail: adminEmail,
      action: 'verify',
      resource: 'tenant',
      resourceId: tenantId,
      description: `Verified company: ${tenantName}`,
      category: 'admin_action',
      severity: 'info',
      ...(request ? getRequestInfo(request) : {}),
    }),

  tenantSuspended: (adminId: string, adminEmail: string, tenantId: string, tenantName: string, reason: string, request?: Request) =>
    createAuditLog({
      actorType: 'super_admin',
      actorId: adminId,
      actorEmail: adminEmail,
      action: 'suspend',
      resource: 'tenant',
      resourceId: tenantId,
      description: `Suspended company: ${tenantName}`,
      metadata: { reason },
      category: 'admin_action',
      severity: 'warning',
      ...(request ? getRequestInfo(request) : {}),
    }),

  // Application actions
  applicationSubmitted: (userId: string, userEmail: string, applicationId: string, jobTitle: string, request?: Request) =>
    createAuditLog({
      actorType: 'employee',
      actorId: userId,
      actorEmail: userEmail,
      action: 'create',
      resource: 'application',
      resourceId: applicationId,
      description: `Applied to job: ${jobTitle}`,
      category: 'data_modification',
      severity: 'info',
      ...(request ? getRequestInfo(request) : {}),
    }),

  applicationStatusChanged: (actorId: string, actorEmail: string, applicationId: string, oldStatus: string, newStatus: string, request?: Request) =>
    createAuditLog({
      actorType: 'employer',
      actorId,
      actorEmail,
      action: 'update',
      resource: 'application',
      resourceId: applicationId,
      description: `Changed application status from ${oldStatus} to ${newStatus}`,
      metadata: { oldStatus, newStatus },
      category: 'data_modification',
      severity: 'info',
      ...(request ? getRequestInfo(request) : {}),
    }),

  // Security actions
  twoFactorEnabled: (userType: AuditLogData['actorType'], userId: string, userEmail: string, request?: Request) =>
    createAuditLog({
      actorType: userType,
      actorId: userId,
      actorEmail: userEmail,
      action: 'enable_2fa',
      resource: 'security',
      resourceId: userId,
      description: 'Two-factor authentication enabled',
      category: 'security',
      severity: 'info',
      ...(request ? getRequestInfo(request) : {}),
    }),

  twoFactorDisabled: (userType: AuditLogData['actorType'], userId: string, userEmail: string, request?: Request) =>
    createAuditLog({
      actorType: userType,
      actorId: userId,
      actorEmail: userEmail,
      action: 'disable_2fa',
      resource: 'security',
      resourceId: userId,
      description: 'Two-factor authentication disabled',
      category: 'security',
      severity: 'warning',
      ...(request ? getRequestInfo(request) : {}),
    }),

  passwordChanged: (userType: AuditLogData['actorType'], userId: string, userEmail: string, request?: Request) =>
    createAuditLog({
      actorType: userType,
      actorId: userId,
      actorEmail: userEmail,
      action: 'password_change',
      resource: 'security',
      resourceId: userId,
      description: 'Password changed',
      category: 'security',
      severity: 'info',
      ...(request ? getRequestInfo(request) : {}),
    }),

  // Data export
  dataExported: (actorType: AuditLogData['actorType'], actorId: string, actorEmail: string, exportType: string, request?: Request) =>
    createAuditLog({
      actorType,
      actorId,
      actorEmail,
      action: 'export',
      resource: 'data',
      description: `Exported ${exportType} data`,
      metadata: { exportType },
      category: 'data_modification',
      severity: 'info',
      ...(request ? getRequestInfo(request) : {}),
    }),

  // Review actions
  reviewSubmitted: (userId: string, userEmail: string, reviewId: string, tenantName: string, request?: Request) =>
    createAuditLog({
      actorType: 'employee',
      actorId: userId,
      actorEmail: userEmail,
      action: 'create',
      resource: 'review',
      resourceId: reviewId,
      description: `Submitted review for: ${tenantName}`,
      category: 'data_modification',
      severity: 'info',
      ...(request ? getRequestInfo(request) : {}),
    }),

  reviewApproved: (adminId: string, adminEmail: string, reviewId: string, request?: Request) =>
    createAuditLog({
      actorType: 'super_admin',
      actorId: adminId,
      actorEmail: adminEmail,
      action: 'approve',
      resource: 'review',
      resourceId: reviewId,
      description: 'Approved company review',
      category: 'admin_action',
      severity: 'info',
      ...(request ? getRequestInfo(request) : {}),
    }),
};

export default auditActions;

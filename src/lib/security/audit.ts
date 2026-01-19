/**
 * Enhanced Audit Logging System
 *
 * Provides comprehensive audit logging for security events,
 * with separation between tenant and global logs.
 */

import { prisma } from '@/lib/db';
import {
  SecurityAuditEvent,
  SecurityEventType,
  Resource,
  Action,
  Role,
} from './types';
import { getTenantContextOptional } from './tenant-context';

// ============================================
// AUDIT SEVERITY LEVELS
// ============================================

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Determine severity based on event type and result
 */
function determineSeverity(
  eventType: SecurityEventType,
  result: 'success' | 'denied' | 'error'
): AuditSeverity {
  // Failed operations are at least warnings
  if (result === 'denied') {
    if (eventType === 'suspicious_activity') return 'critical';
    if (eventType === 'cross_tenant_access') return 'critical';
    return 'warning';
  }

  if (result === 'error') return 'error';

  // Successful but sensitive operations
  switch (eventType) {
    case 'cross_tenant_access':
      return 'warning';
    case 'role_change':
      return 'warning';
    case 'data_export':
      return 'warning';
    case 'bulk_operation':
      return 'warning';
    case 'sensitive_data_access':
      return 'warning';
    case 'suspicious_activity':
      return 'critical';
    default:
      return 'info';
  }
}

/**
 * Determine category based on event type
 */
function determineCategory(eventType: SecurityEventType): string {
  switch (eventType) {
    case 'authentication':
      return 'authentication';
    case 'authorization':
    case 'permission_denied':
      return 'authorization';
    case 'role_change':
      return 'admin_action';
    case 'cross_tenant_access':
      return 'security';
    case 'data_export':
    case 'bulk_operation':
      return 'data_modification';
    case 'sensitive_data_access':
    case 'suspicious_activity':
      return 'security';
    default:
      return 'system';
  }
}

// ============================================
// MAIN LOGGING FUNCTION
// ============================================

/**
 * Log a security event
 */
export async function logSecurityEvent(
  event: SecurityAuditEvent
): Promise<void> {
  try {
    const context = getTenantContextOptional();
    const severity = determineSeverity(event.eventType, event.result);
    const category = determineCategory(event.eventType);

    // Build description
    const description = buildDescription(event);

    await prisma.auditLog.create({
      data: {
        // Actor info
        actorType: event.actor.type,
        actorId: event.actor.id,
        actorEmail: event.actor.email,
        actorName: undefined, // Could be looked up if needed

        // Action info
        action: event.action,
        resource: event.target?.type || 'system',
        resourceId: event.target?.id,

        // Details
        description,
        metadata: {
          eventType: event.eventType,
          result: event.result,
          reason: event.reason,
          targetTenantId: event.target?.tenantId,
          ...event.metadata,
        },

        // Request info
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        requestId: event.requestId,

        // Categorization
        category,
        severity,
      },
    });

    // For critical events, also log to console for immediate visibility
    if (severity === 'critical') {
      console.error('[SECURITY CRITICAL]', {
        eventType: event.eventType,
        actor: event.actor,
        target: event.target,
        action: event.action,
        result: event.result,
        reason: event.reason,
      });
    }
  } catch (error) {
    // Never fail silently on audit logging
    console.error('[AUDIT] Failed to log security event:', error, event);
  }
}

/**
 * Build human-readable description
 */
function buildDescription(event: SecurityAuditEvent): string {
  const actor = event.actor.email || event.actor.id;
  const target = event.target
    ? `${event.target.type} ${event.target.id}`
    : 'system';

  switch (event.eventType) {
    case 'authentication':
      return `${actor} ${event.result === 'success' ? 'logged in' : 'failed to log in'}`;

    case 'authorization':
      return `${actor} ${event.result === 'success' ? 'accessed' : 'was denied access to'} ${target}`;

    case 'permission_denied':
      return `${actor} was denied ${event.action} on ${target}: ${event.reason}`;

    case 'role_change':
      return `${actor} changed role on ${target}`;

    case 'cross_tenant_access':
      return `${actor} performed cross-tenant ${event.action} on ${target}`;

    case 'data_export':
      return `${actor} exported data from ${target}`;

    case 'bulk_operation':
      return `${actor} performed bulk ${event.action} on ${target}`;

    case 'sensitive_data_access':
      return `${actor} accessed sensitive data: ${target}`;

    case 'suspicious_activity':
      return `Suspicious activity detected: ${actor} attempted ${event.action} on ${target}`;

    default:
      return `${actor} ${event.action} ${target}`;
  }
}

// ============================================
// CONVENIENCE LOGGING FUNCTIONS
// ============================================

/**
 * Log a successful authentication
 */
export async function logAuthentication(
  userId: string,
  userType: 'user' | 'employer' | 'super_admin',
  email: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logSecurityEvent({
    eventType: 'authentication',
    actor: { type: userType, id: userId, email },
    action: 'create',
    result: 'success',
    ipAddress,
    userAgent,
  });
}

/**
 * Log a failed authentication
 */
export async function logFailedAuthentication(
  email: string,
  reason: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logSecurityEvent({
    eventType: 'authentication',
    actor: { type: 'user', id: 'unknown', email },
    action: 'create',
    result: 'denied',
    reason,
    ipAddress,
    userAgent,
  });
}

/**
 * Log a role change
 */
export async function logRoleChange(
  actorId: string,
  actorRole: Role,
  targetUserId: string,
  oldRole: Role,
  newRole: Role,
  tenantId?: string
): Promise<void> {
  await logSecurityEvent({
    eventType: 'role_change',
    actor: {
      type: 'employer',
      id: actorId,
      role: actorRole,
    },
    target: {
      type: 'employer_team',
      id: targetUserId,
      tenantId,
    },
    action: 'update',
    result: 'success',
    metadata: {
      oldRole,
      newRole,
    },
  });
}

/**
 * Log a data export
 */
export async function logDataExport(
  actorId: string,
  actorRole: Role,
  resource: Resource,
  recordCount: number,
  tenantId?: string
): Promise<void> {
  await logSecurityEvent({
    eventType: 'data_export',
    actor: {
      type: actorRole.startsWith('SUPER') ? 'super_admin' : 'employer',
      id: actorId,
      role: actorRole,
    },
    target: {
      type: resource,
      id: 'bulk',
      tenantId,
    },
    action: 'export',
    result: 'success',
    metadata: {
      recordCount,
    },
  });
}

/**
 * Log a bulk operation
 */
export async function logBulkOperation(
  actorId: string,
  actorRole: Role,
  resource: Resource,
  action: Action,
  affectedCount: number,
  tenantId?: string
): Promise<void> {
  await logSecurityEvent({
    eventType: 'bulk_operation',
    actor: {
      type: actorRole.startsWith('SUPER') ? 'super_admin' : 'employer',
      id: actorId,
      role: actorRole,
    },
    target: {
      type: resource,
      id: 'bulk',
      tenantId,
    },
    action,
    result: 'success',
    metadata: {
      affectedCount,
    },
  });
}

/**
 * Log cross-tenant access
 */
export async function logCrossTenantAccess(
  superAdminId: string,
  targetTenantId: string,
  resource: Resource,
  action: Action,
  reason: string
): Promise<void> {
  await logSecurityEvent({
    eventType: 'cross_tenant_access',
    actor: {
      type: 'super_admin',
      id: superAdminId,
    },
    target: {
      type: resource,
      id: 'tenant-access',
      tenantId: targetTenantId,
    },
    action,
    result: 'success',
    reason,
  });
}

/**
 * Log account suspension
 */
export async function logAccountSuspension(
  actorId: string,
  actorRole: Role,
  targetId: string,
  targetType: 'user' | 'tenant',
  reason: string
): Promise<void> {
  await logSecurityEvent({
    eventType: 'role_change',
    actor: {
      type: 'super_admin',
      id: actorId,
      role: actorRole,
    },
    target: {
      type: targetType === 'user' ? 'user_management' : 'tenant_management',
      id: targetId,
    },
    action: 'suspend',
    result: 'success',
    reason,
  });
}

// ============================================
// AUDIT QUERY HELPERS
// ============================================

/**
 * Get audit logs for a specific tenant
 */
export async function getTenantAuditLogs(
  tenantId: string,
  options?: {
    startDate?: Date;
    endDate?: Date;
    severity?: AuditSeverity;
    category?: string;
    limit?: number;
  }
) {
  const where: any = {
    metadata: {
      path: ['targetTenantId'],
      equals: tenantId,
    },
  };

  if (options?.startDate || options?.endDate) {
    where.createdAt = {};
    if (options.startDate) where.createdAt.gte = options.startDate;
    if (options.endDate) where.createdAt.lte = options.endDate;
  }

  if (options?.severity) {
    where.severity = options.severity;
  }

  if (options?.category) {
    where.category = options.category;
  }

  return prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 100,
  });
}

/**
 * Get global security events (Super Admin only)
 */
export async function getGlobalSecurityEvents(options?: {
  eventTypes?: SecurityEventType[];
  startDate?: Date;
  endDate?: Date;
  severity?: AuditSeverity;
  limit?: number;
}) {
  const where: any = {};

  if (options?.eventTypes) {
    where.metadata = {
      path: ['eventType'],
      in: options.eventTypes,
    };
  }

  if (options?.startDate || options?.endDate) {
    where.createdAt = {};
    if (options.startDate) where.createdAt.gte = options.startDate;
    if (options.endDate) where.createdAt.lte = options.endDate;
  }

  if (options?.severity) {
    where.severity = options.severity;
  }

  return prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 100,
  });
}

/**
 * Get suspicious activity report
 */
export async function getSuspiciousActivityReport(
  days: number = 7
): Promise<{
  totalEvents: number;
  byType: Record<string, number>;
  topActors: Array<{ actorId: string; count: number }>;
}> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const events = await prisma.auditLog.findMany({
    where: {
      severity: { in: ['warning', 'error', 'critical'] },
      createdAt: { gte: startDate },
    },
    select: {
      actorId: true,
      category: true,
    },
  });

  const byType: Record<string, number> = {};
  const actorCounts: Record<string, number> = {};

  for (const event of events) {
    byType[event.category || 'unknown'] = (byType[event.category || 'unknown'] || 0) + 1;
    if (event.actorId) {
      actorCounts[event.actorId] = (actorCounts[event.actorId] || 0) + 1;
    }
  }

  const topActors = Object.entries(actorCounts)
    .map(([actorId, count]) => ({ actorId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalEvents: events.length,
    byType,
    topActors,
  };
}

/**
 * Authorization Module
 *
 * Central authorization logic for all access control decisions.
 * Implements deny-by-default with explicit permission grants.
 */

import {
  AuthorizationRequest,
  AuthorizationResult,
  AuthorizationError,
  Resource,
  Action,
  Role,
  TenantContext,
  SecurityAuditEvent,
} from './types';
import {
  hasPermission,
  isSensitiveOperation,
  requiresTenantContext,
  isAdminOnlyResource,
  EMPLOYER_ROLE_HIERARCHY,
} from './permissions';
import {
  getTenantContext,
  validateTenantOwnership,
} from './tenant-context';
import { logSecurityEvent } from './audit';

// ============================================
// MAIN AUTHORIZATION FUNCTION
// ============================================

/**
 * Authorize an action on a resource
 *
 * @param request - The authorization request
 * @returns AuthorizationResult with allowed status and effective tenant
 * @throws AuthorizationError if access is denied
 *
 * @example
 * // Check if user can create a job
 * const result = await authorize({
 *   resource: 'job',
 *   action: 'create',
 *   tenantId: 'tenant-123'
 * });
 *
 * @example
 * // Super Admin cross-tenant access
 * const result = await authorize({
 *   resource: 'job',
 *   action: 'update',
 *   tenantId: 'other-tenant',
 *   crossTenantAccess: true,
 *   reason: 'Fixing reported content violation'
 * });
 */
export async function authorize(
  request: AuthorizationRequest
): Promise<AuthorizationResult> {
  const context = getTenantContext();
  const { resource, action, resourceId, tenantId, crossTenantAccess, reason } = request;

  // Build audit event
  const auditEvent: Partial<SecurityAuditEvent> = {
    eventType: 'authorization',
    actor: {
      type: context.isSuperAdmin ? 'super_admin' : context.userType === 'EMPLOYER' ? 'employer' : 'user',
      id: context.userId,
      role: context.role,
    },
    target: resourceId ? { type: resource, id: resourceId, tenantId: tenantId || undefined } : undefined,
    action,
  };

  try {
    // Step 1: Check if resource is admin-only
    if (isAdminOnlyResource(resource) && !context.isSuperAdmin) {
      throw new AuthorizationError(
        `Resource '${resource}' is only accessible to administrators`,
        'FORBIDDEN',
        resource,
        action
      );
    }

    // Step 2: Check base permission
    if (!hasPermission(context.role, resource, action)) {
      throw new AuthorizationError(
        `Role '${context.role}' does not have '${action}' permission on '${resource}'`,
        'INSUFFICIENT_PERMISSIONS',
        resource,
        action
      );
    }

    // Step 3: Handle tenant-scoped resources
    let effectiveTenantId: string | null = null;

    if (requiresTenantContext(resource)) {
      effectiveTenantId = await validateTenantAccess(
        context,
        tenantId,
        crossTenantAccess,
        reason
      );
    }

    // Step 4: Determine audit requirements
    const shouldAudit = isSensitiveOperation(resource, action) ||
      crossTenantAccess ||
      context.isSuperAdmin;

    const auditSeverity = determineAuditSeverity(resource, action, crossTenantAccess);

    // Log successful authorization for sensitive operations
    if (shouldAudit) {
      await logSecurityEvent({
        ...auditEvent,
        eventType: crossTenantAccess ? 'cross_tenant_access' : 'authorization',
        result: 'success',
        metadata: {
          resource,
          action,
          tenantId: effectiveTenantId,
          crossTenantAccess,
          reason,
        },
      } as SecurityAuditEvent);
    }

    return {
      allowed: true,
      reason: 'Permission granted',
      effectiveTenantId,
      shouldAudit,
      auditSeverity,
    };
  } catch (error) {
    // Log failed authorization
    await logSecurityEvent({
      ...auditEvent,
      eventType: 'permission_denied',
      result: 'denied',
      reason: error instanceof Error ? error.message : 'Unknown error',
    } as SecurityAuditEvent);

    throw error;
  }
}

/**
 * Validate tenant access and return effective tenant ID
 */
async function validateTenantAccess(
  context: TenantContext,
  requestedTenantId: string | undefined,
  crossTenantAccess: boolean | undefined,
  reason: string | undefined
): Promise<string | null> {
  // Super Admin with cross-tenant access
  if (context.isSuperAdmin && crossTenantAccess) {
    if (!requestedTenantId) {
      throw new AuthorizationError(
        'Cross-tenant access requires a target tenant ID',
        'CROSS_TENANT_DENIED'
      );
    }

    if (!reason || reason.length < 10) {
      throw new AuthorizationError(
        'Cross-tenant access requires a valid reason (min 10 characters)',
        'CROSS_TENANT_DENIED'
      );
    }

    return requestedTenantId;
  }

  // Super Admin without explicit cross-tenant (read-only access)
  if (context.isSuperAdmin && !crossTenantAccess) {
    return requestedTenantId || null;
  }

  // Employees cannot access tenant-scoped resources directly
  if (context.userType === 'EMPLOYEE') {
    throw new AuthorizationError(
      'Employees cannot directly access employer resources',
      'FORBIDDEN'
    );
  }

  // Employer must have a tenant
  if (!context.tenantId) {
    throw new AuthorizationError(
      'Employer account is not associated with a company',
      'FORBIDDEN'
    );
  }

  // If specific tenant requested, must match
  if (requestedTenantId && requestedTenantId !== context.tenantId) {
    throw new AuthorizationError(
      'Cannot access resources from another company',
      'TENANT_MISMATCH',
      undefined,
      undefined,
      requestedTenantId
    );
  }

  return context.tenantId;
}

/**
 * Determine audit severity based on operation
 */
function determineAuditSeverity(
  resource: Resource,
  action: Action,
  crossTenantAccess?: boolean
): 'info' | 'warning' | 'error' | 'critical' {
  // Cross-tenant access is always critical
  if (crossTenantAccess) return 'critical';

  // Delete operations are warnings
  if (action === 'delete' || action === 'bulk_delete') return 'warning';

  // Account suspension is critical
  if (action === 'suspend') return 'critical';

  // Admin resource access is warning
  if (isAdminOnlyResource(resource)) return 'warning';

  // Sensitive operations are warnings
  if (isSensitiveOperation(resource, action)) return 'warning';

  return 'info';
}

// ============================================
// CONVENIENCE AUTHORIZATION FUNCTIONS
// ============================================

/**
 * Quick check if current user can perform action
 * Does not throw, returns boolean
 */
export async function can(
  resource: Resource,
  action: Action,
  resourceTenantId?: string
): Promise<boolean> {
  try {
    await authorize({ resource, action, tenantId: resourceTenantId });
    return true;
  } catch {
    return false;
  }
}

/**
 * Assert user can perform action, throw if not
 */
export async function assertCan(
  resource: Resource,
  action: Action,
  resourceTenantId?: string
): Promise<void> {
  await authorize({ resource, action, tenantId: resourceTenantId });
}

/**
 * Check multiple permissions at once
 */
export async function canAll(
  checks: Array<{ resource: Resource; action: Action; tenantId?: string }>
): Promise<boolean> {
  for (const check of checks) {
    const allowed = await can(check.resource, check.action, check.tenantId);
    if (!allowed) return false;
  }
  return true;
}

/**
 * Check if any of the permissions is granted
 */
export async function canAny(
  checks: Array<{ resource: Resource; action: Action; tenantId?: string }>
): Promise<boolean> {
  for (const check of checks) {
    const allowed = await can(check.resource, check.action, check.tenantId);
    if (allowed) return true;
  }
  return false;
}

// ============================================
// ROLE-SPECIFIC AUTHORIZATION
// ============================================

/**
 * Assert user has at least the specified employer role
 */
export function assertEmployerRole(minimumRole: Role): void {
  const context = getTenantContext();

  if (context.isSuperAdmin) return; // Super Admin bypasses

  if (context.userType !== 'EMPLOYER') {
    throw new AuthorizationError(
      'This operation requires an employer account',
      'FORBIDDEN'
    );
  }

  const currentIndex = EMPLOYER_ROLE_HIERARCHY.indexOf(context.role as any);
  const requiredIndex = EMPLOYER_ROLE_HIERARCHY.indexOf(minimumRole as any);

  if (currentIndex === -1 || requiredIndex === -1) {
    throw new AuthorizationError(
      `Invalid role comparison: ${context.role} vs ${minimumRole}`,
      'FORBIDDEN'
    );
  }

  if (currentIndex < requiredIndex) {
    throw new AuthorizationError(
      `This operation requires at least '${minimumRole}' role, you have '${context.role}'`,
      'INSUFFICIENT_PERMISSIONS'
    );
  }
}

/**
 * Check if user can modify another user's role
 */
export function canModifyUserRole(
  targetUserId: string,
  targetCurrentRole: Role,
  targetNewRole: Role
): boolean {
  const context = getTenantContext();

  // Super Admin can change any role
  if (context.isSuperAdmin) return true;

  // Can't modify your own role
  if (context.userId === targetUserId) return false;

  // Must be employer
  if (context.userType !== 'EMPLOYER') return false;

  const currentIndex = EMPLOYER_ROLE_HIERARCHY.indexOf(context.role as any);
  const targetCurrentIndex = EMPLOYER_ROLE_HIERARCHY.indexOf(targetCurrentRole as any);
  const targetNewIndex = EMPLOYER_ROLE_HIERARCHY.indexOf(targetNewRole as any);

  // Must be higher than both current and new role
  return currentIndex > targetCurrentIndex && currentIndex > targetNewIndex;
}

// ============================================
// RESOURCE OWNERSHIP VALIDATION
// ============================================

/**
 * Validate that user owns a resource
 */
export async function validateResourceOwnership(
  resourceUserId: string | null,
  resourceTenantId: string | null
): Promise<void> {
  const context = getTenantContext();

  // Super Admin bypasses ownership check
  if (context.isSuperAdmin) return;

  // User-owned resource
  if (resourceUserId) {
    if (resourceUserId !== context.userId) {
      throw new AuthorizationError(
        'You do not own this resource',
        'FORBIDDEN'
      );
    }
    return;
  }

  // Tenant-owned resource
  if (resourceTenantId) {
    validateTenantOwnership(resourceTenantId);
    return;
  }

  // No ownership defined - deny by default
  throw new AuthorizationError(
    'Resource has no owner defined',
    'FORBIDDEN'
  );
}

/**
 * Get filter conditions for queries based on current context
 */
export function getOwnershipFilter(): {
  userId?: string;
  tenantId?: string;
} {
  const context = getTenantContext();

  // Super Admin gets no filter (sees all)
  if (context.isSuperAdmin && context.explicitCrossTenant) {
    return context.targetTenantId ? { tenantId: context.targetTenantId } : {};
  }

  if (context.isSuperAdmin) {
    return {}; // No filter for read operations
  }

  // Employee gets user filter
  if (context.userType === 'EMPLOYEE') {
    return { userId: context.userId };
  }

  // Employer gets tenant filter
  if (context.tenantId) {
    return { tenantId: context.tenantId };
  }

  throw new AuthorizationError(
    'Cannot determine ownership filter',
    'FORBIDDEN'
  );
}

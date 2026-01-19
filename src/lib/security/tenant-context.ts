/**
 * Tenant Context Management
 *
 * Provides request-scoped tenant context that flows through
 * the entire request lifecycle, ensuring tenant isolation.
 */

import { AsyncLocalStorage } from 'async_hooks';
import {
  TenantContext,
  AuthContext,
  Role,
  UserType,
  AuthorizationError,
} from './types';
import { getPermissionsForRole } from './permissions';

// ============================================
// ASYNC LOCAL STORAGE FOR REQUEST CONTEXT
// ============================================

/**
 * AsyncLocalStorage for tenant context
 * This ensures tenant context is isolated per request
 */
const tenantContextStorage = new AsyncLocalStorage<TenantContext>();

/**
 * Get current tenant context
 * Throws if no context is set (security measure)
 */
export function getTenantContext(): TenantContext {
  const context = tenantContextStorage.getStore();

  if (!context) {
    throw new AuthorizationError(
      'No tenant context available. Ensure request is properly authenticated.',
      'UNAUTHENTICATED'
    );
  }

  return context;
}

/**
 * Get current tenant context or null (for optional auth routes)
 */
export function getTenantContextOptional(): TenantContext | null {
  return tenantContextStorage.getStore() || null;
}

/**
 * Get current tenant ID (convenience method)
 * Returns null for Super Admins unless in cross-tenant mode
 */
export function getCurrentTenantId(): string | null {
  const context = getTenantContext();

  // Super Admin operating on specific tenant
  if (context.isSuperAdmin && context.targetTenantId) {
    return context.targetTenantId;
  }

  return context.tenantId;
}

/**
 * Get current user ID
 */
export function getCurrentUserId(): string {
  return getTenantContext().userId;
}

/**
 * Check if current user is Super Admin
 */
export function isSuperAdmin(): boolean {
  const context = getTenantContextOptional();
  return context?.isSuperAdmin ?? false;
}

// ============================================
// CONTEXT CREATION
// ============================================

/**
 * Create tenant context from auth info
 */
export function createTenantContext(auth: AuthContext): TenantContext {
  // Super Admin context
  if (auth.superAdmin) {
    return {
      tenantId: null,
      userId: auth.superAdmin.id,
      userType: 'SUPER_ADMIN',
      role: auth.superAdmin.role,
      permissions: getPermissionsForRole(auth.superAdmin.role),
      isSuperAdmin: true,
    };
  }

  // Regular user context
  if (auth.user) {
    const role = auth.user.employerRole || auth.user.role;
    const userType: UserType = auth.user.role === 'EMPLOYEE' ? 'EMPLOYEE' : 'EMPLOYER';

    return {
      tenantId: auth.user.tenantId,
      userId: auth.user.id,
      userType,
      role,
      permissions: getPermissionsForRole(role),
      isSuperAdmin: false,
    };
  }

  throw new AuthorizationError(
    'Invalid auth context: no user or superAdmin',
    'UNAUTHENTICATED'
  );
}

/**
 * Run a function with tenant context
 */
export function withTenantContext<T>(
  context: TenantContext,
  fn: () => T
): T {
  return tenantContextStorage.run(context, fn);
}

/**
 * Run an async function with tenant context
 */
export async function withTenantContextAsync<T>(
  context: TenantContext,
  fn: () => Promise<T>
): Promise<T> {
  return tenantContextStorage.run(context, fn);
}

// ============================================
// CROSS-TENANT ACCESS (SUPER ADMIN ONLY)
// ============================================

/**
 * Enable cross-tenant access for Super Admin
 * Must be called explicitly with a reason
 */
export function enableCrossTenantAccess(
  targetTenantId: string,
  reason: string
): TenantContext {
  const context = getTenantContext();

  if (!context.isSuperAdmin) {
    throw new AuthorizationError(
      'Cross-tenant access is only available to Super Admins',
      'CROSS_TENANT_DENIED'
    );
  }

  if (!reason || reason.length < 10) {
    throw new AuthorizationError(
      'Cross-tenant access requires a valid reason (min 10 characters)',
      'CROSS_TENANT_DENIED'
    );
  }

  // Return new context with cross-tenant access
  return {
    ...context,
    explicitCrossTenant: true,
    targetTenantId,
  };
}

/**
 * Run operation with cross-tenant access
 */
export async function withCrossTenantAccess<T>(
  targetTenantId: string,
  reason: string,
  fn: () => Promise<T>
): Promise<T> {
  const newContext = enableCrossTenantAccess(targetTenantId, reason);
  return withTenantContextAsync(newContext, fn);
}

// ============================================
// TENANT VALIDATION
// ============================================

/**
 * Validate that a resource belongs to current tenant
 */
export function validateTenantOwnership(
  resourceTenantId: string | null,
  options?: { allowNull?: boolean }
): void {
  const context = getTenantContext();

  // Super Admin with explicit cross-tenant access
  if (context.isSuperAdmin && context.explicitCrossTenant) {
    if (resourceTenantId === context.targetTenantId) {
      return; // Valid cross-tenant access
    }
    throw new AuthorizationError(
      `Cross-tenant access was granted for tenant ${context.targetTenantId}, not ${resourceTenantId}`,
      'TENANT_MISMATCH',
      undefined,
      undefined,
      resourceTenantId || undefined
    );
  }

  // Super Admin without cross-tenant (viewing, not modifying)
  if (context.isSuperAdmin && !context.explicitCrossTenant) {
    // Super Admin can read any tenant data without explicit cross-tenant
    // But cannot modify without it
    return;
  }

  // Employees don't have tenant (they're not part of a company)
  if (context.userType === 'EMPLOYEE') {
    if (options?.allowNull && !resourceTenantId) {
      return;
    }
    // Employees can only access their own data, not tenant-scoped data
    throw new AuthorizationError(
      'Employees cannot access tenant-scoped resources directly',
      'FORBIDDEN'
    );
  }

  // Employer must match tenant
  if (!context.tenantId) {
    throw new AuthorizationError(
      'Employer user has no tenant ID',
      'TENANT_MISMATCH'
    );
  }

  if (resourceTenantId !== context.tenantId) {
    throw new AuthorizationError(
      'Resource belongs to a different tenant',
      'TENANT_MISMATCH',
      undefined,
      undefined,
      resourceTenantId || undefined
    );
  }
}

/**
 * Assert current user is an employer with tenant
 */
export function assertEmployerContext(): { tenantId: string; userId: string; role: Role } {
  const context = getTenantContext();

  if (context.userType !== 'EMPLOYER') {
    throw new AuthorizationError(
      'This operation requires an employer account',
      'FORBIDDEN'
    );
  }

  if (!context.tenantId) {
    throw new AuthorizationError(
      'Employer account is not associated with a company',
      'FORBIDDEN'
    );
  }

  return {
    tenantId: context.tenantId,
    userId: context.userId,
    role: context.role,
  };
}

/**
 * Assert current user is an employee
 */
export function assertEmployeeContext(): { userId: string } {
  const context = getTenantContext();

  if (context.userType !== 'EMPLOYEE') {
    throw new AuthorizationError(
      'This operation requires a job seeker account',
      'FORBIDDEN'
    );
  }

  return { userId: context.userId };
}

/**
 * Assert current user is a Super Admin
 */
export function assertSuperAdminContext(): { userId: string; role: Role } {
  const context = getTenantContext();

  if (!context.isSuperAdmin) {
    throw new AuthorizationError(
      'This operation requires Super Admin access',
      'FORBIDDEN'
    );
  }

  return {
    userId: context.userId,
    role: context.role,
  };
}

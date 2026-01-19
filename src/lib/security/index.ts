/**
 * Security Module - Main Entry Point
 *
 * This module provides comprehensive security features:
 * - Tenant isolation
 * - Role-based access control (RBAC)
 * - Authorization middleware
 * - Prisma security helpers
 * - Audit logging
 */

// Types
export * from './types';

// Permissions
export {
  hasPermission,
  getPermissionsForRole,
  getRolesWithPermission,
  isRoleAtLeast,
  canAssignRole,
  isSensitiveOperation,
  requiresTenantContext,
  isAdminOnlyResource,
  EMPLOYER_ROLE_HIERARCHY,
  TENANT_SCOPED_RESOURCES,
  USER_SCOPED_RESOURCES,
  ADMIN_ONLY_RESOURCES,
} from './permissions';

// Tenant Context
export {
  getTenantContext,
  getTenantContextOptional,
  getCurrentTenantId,
  getCurrentUserId,
  isSuperAdmin,
  createTenantContext,
  withTenantContext,
  withTenantContextAsync,
  enableCrossTenantAccess,
  withCrossTenantAccess,
  validateTenantOwnership,
  assertEmployerContext,
  assertEmployeeContext,
  assertSuperAdminContext,
} from './tenant-context';

// Authorization
export {
  authorize,
  can,
  assertCan,
  canAll,
  canAny,
  assertEmployerRole,
  canModifyUserRole,
  validateResourceOwnership,
  getOwnershipFilter,
} from './authorization';

// Prisma Security
export {
  createSecurePrismaClient,
  secureWhere,
  validateResourceAccess,
  assertSafeBulkOperation,
  guardAgainstIdGuessing,
  secureTransaction,
  sanitizeQuery,
} from './prisma-security';

// Middleware
export {
  securedRoute,
  authenticatedRoute,
  superAdminRoute,
  employerRoute,
  employeeRoute,
  publicRoute,
  getTenantFromRequest,
  getUserFromRequest,
} from './middleware';

// Audit
export {
  logSecurityEvent,
  logAuthentication,
  logFailedAuthentication,
  logRoleChange,
  logDataExport,
  logBulkOperation,
  logCrossTenantAccess,
  logAccountSuspension,
  getTenantAuditLogs,
  getGlobalSecurityEvents,
  getSuspiciousActivityReport,
} from './audit';

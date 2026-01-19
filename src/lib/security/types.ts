/**
 * Security Type Definitions for Jobly
 *
 * This file defines all types related to authentication, authorization,
 * and tenant isolation.
 */

// ============================================
// USER ROLES
// ============================================

/**
 * Base user types in the system
 */
export type UserType = 'EMPLOYEE' | 'EMPLOYER' | 'SUPER_ADMIN';

/**
 * Employer-specific roles within a tenant
 * Hierarchical: OWNER > ADMIN > RECRUITER > VIEWER
 */
export type EmployerRole =
  | 'EMPLOYER_OWNER'      // Full control, can delete tenant
  | 'EMPLOYER_ADMIN'      // Manage team, settings, all operations
  | 'EMPLOYER_RECRUITER'  // Manage jobs, applicants, messages
  | 'EMPLOYER_VIEWER';    // Read-only access

/**
 * Super Admin roles for platform administration
 */
export type SuperAdminRole =
  | 'SUPER_ADMIN'         // Full platform access
  | 'MODERATOR';          // Limited admin (reviews, content)

/**
 * Combined role type
 */
export type Role = 'EMPLOYEE' | EmployerRole | SuperAdminRole;

// ============================================
// RESOURCES & ACTIONS
// ============================================

/**
 * Resources that can be accessed/modified
 */
export type Resource =
  // Job Seeker Resources
  | 'profile'
  | 'application'
  | 'saved_job'
  | 'resume'
  | 'job_alert'

  // Employer Resources
  | 'job'
  | 'applicant'
  | 'screening_form'
  | 'talent_pool'
  | 'shortlist'
  | 'interview_invite'
  | 'message'
  | 'company'
  | 'employer_team'
  | 'employer_analytics'
  | 'employer_settings'

  // Review Resources
  | 'company_review'
  | 'salary_report'

  // Admin Resources
  | 'user_management'
  | 'tenant_management'
  | 'job_approval'
  | 'review_moderation'
  | 'audit_log'
  | 'platform_settings';

/**
 * Actions that can be performed on resources
 */
export type Action =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'list'
  | 'export'
  | 'bulk_update'
  | 'bulk_delete'
  | 'approve'
  | 'reject'
  | 'suspend'
  | 'restore';

/**
 * Permission definition
 */
export interface Permission {
  resource: Resource;
  action: Action;
  conditions?: PermissionCondition[];
}

/**
 * Conditional permission (e.g., "can edit own jobs only")
 */
export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in';
  value: string | string[] | '$userId' | '$tenantId';
}

// ============================================
// TENANT CONTEXT
// ============================================

/**
 * Tenant context carried through request lifecycle
 */
export interface TenantContext {
  tenantId: string | null;
  userId: string;
  userType: UserType;
  role: Role;
  permissions: Permission[];

  // For Super Admin cross-tenant access
  isSuperAdmin: boolean;
  explicitCrossTenant?: boolean;
  targetTenantId?: string;
}

/**
 * Request context for authorization
 */
export interface AuthContext {
  user: {
    id: string;
    email: string;
    role: Role;
    tenantId: string | null;
    employerRole?: EmployerRole;
  } | null;

  superAdmin: {
    id: string;
    email: string;
    role: SuperAdminRole;
  } | null;

  tenant: TenantContext | null;
}

// ============================================
// AUTHORIZATION
// ============================================

/**
 * Authorization request
 */
export interface AuthorizationRequest {
  resource: Resource;
  action: Action;
  resourceId?: string;
  tenantId?: string;

  // For Super Admin cross-tenant operations
  crossTenantAccess?: boolean;
  reason?: string;
}

/**
 * Authorization result
 */
export interface AuthorizationResult {
  allowed: boolean;
  reason: string;

  // Effective tenant for the operation
  effectiveTenantId: string | null;

  // Audit info
  shouldAudit: boolean;
  auditSeverity: 'info' | 'warning' | 'error' | 'critical';
}

/**
 * Authorization error
 */
export class AuthorizationError extends Error {
  constructor(
    message: string,
    public readonly code: AuthErrorCode,
    public readonly resource?: Resource,
    public readonly action?: Action,
    public readonly tenantId?: string
  ) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export type AuthErrorCode =
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'TENANT_MISMATCH'
  | 'RESOURCE_NOT_FOUND'
  | 'INSUFFICIENT_PERMISSIONS'
  | 'CROSS_TENANT_DENIED'
  | 'ROLE_ESCALATION_DENIED'
  | 'SUSPENDED_ACCOUNT';

// ============================================
// PRISMA SECURITY
// ============================================

/**
 * Secure query options
 */
export interface SecureQueryOptions {
  tenantId: string;
  userId: string;
  role: Role;

  // Allow Super Admin to bypass tenant filter
  bypassTenant?: boolean;
  superAdminId?: string;
  reason?: string;
}

/**
 * Query validation result
 */
export interface QueryValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedWhere?: Record<string, unknown>;
}

// ============================================
// AUDIT
// ============================================

/**
 * Security audit event
 */
export interface SecurityAuditEvent {
  eventType: SecurityEventType;
  actor: {
    type: 'user' | 'employer' | 'super_admin' | 'system';
    id: string;
    email?: string;
    role?: Role;
  };
  target?: {
    type: Resource;
    id: string;
    tenantId?: string;
  };
  action: Action;
  result: 'success' | 'denied' | 'error';
  reason?: string;
  metadata?: Record<string, unknown>;

  // Request context
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export type SecurityEventType =
  | 'authentication'
  | 'authorization'
  | 'role_change'
  | 'cross_tenant_access'
  | 'data_export'
  | 'bulk_operation'
  | 'sensitive_data_access'
  | 'permission_denied'
  | 'suspicious_activity';

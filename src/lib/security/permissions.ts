/**
 * Permission Matrix for Jobly RBAC
 *
 * This file defines what each role can do.
 * Permissions are DENY by default - only explicit grants allow access.
 */

import {
  Role,
  EmployerRole,
  SuperAdminRole,
  Resource,
  Action,
  Permission,
} from './types';

// ============================================
// ROLE HIERARCHY
// ============================================

/**
 * Employer role hierarchy (higher index = more permissions)
 */
export const EMPLOYER_ROLE_HIERARCHY: EmployerRole[] = [
  'EMPLOYER_VIEWER',
  'EMPLOYER_RECRUITER',
  'EMPLOYER_ADMIN',
  'EMPLOYER_OWNER',
];

/**
 * Check if roleA >= roleB in hierarchy
 */
export function isRoleAtLeast(roleA: EmployerRole, roleB: EmployerRole): boolean {
  const indexA = EMPLOYER_ROLE_HIERARCHY.indexOf(roleA);
  const indexB = EMPLOYER_ROLE_HIERARCHY.indexOf(roleB);
  return indexA >= indexB;
}

/**
 * Check if user can assign a role (must be higher in hierarchy)
 */
export function canAssignRole(
  assignerRole: EmployerRole,
  targetRole: EmployerRole
): boolean {
  const assignerIndex = EMPLOYER_ROLE_HIERARCHY.indexOf(assignerRole);
  const targetIndex = EMPLOYER_ROLE_HIERARCHY.indexOf(targetRole);

  // Can only assign roles lower than your own
  // OWNER can assign ADMIN, ADMIN can assign RECRUITER, etc.
  return assignerIndex > targetIndex;
}

// ============================================
// PERMISSION MATRIX
// ============================================

type PermissionMatrix = {
  [R in Role]?: {
    [Res in Resource]?: Action[];
  };
};

/**
 * Master permission matrix
 * Format: ROLE -> RESOURCE -> [ACTIONS]
 */
export const PERMISSION_MATRIX: PermissionMatrix = {
  // ==========================================
  // EMPLOYEE (Job Seeker) Permissions
  // ==========================================
  EMPLOYEE: {
    // Own profile management
    profile: ['read', 'update'],
    resume: ['create', 'read', 'update', 'delete', 'list'],

    // Job interactions
    application: ['create', 'read', 'list'],
    saved_job: ['create', 'read', 'delete', 'list'],
    job_alert: ['create', 'read', 'update', 'delete', 'list'],

    // Messages with employers
    message: ['create', 'read', 'list'],

    // Community contributions
    company_review: ['create', 'read', 'update', 'delete'],
    salary_report: ['create', 'read'],
  },

  // ==========================================
  // EMPLOYER_VIEWER Permissions (Read-Only)
  // ==========================================
  EMPLOYER_VIEWER: {
    // View company info
    company: ['read'],

    // View jobs (no create/edit)
    job: ['read', 'list'],

    // View applicants (no actions)
    applicant: ['read', 'list'],
    screening_form: ['read'],

    // View talent pool
    talent_pool: ['read', 'list'],
    shortlist: ['read', 'list'],

    // Read messages
    message: ['read', 'list'],

    // View analytics
    employer_analytics: ['read'],
  },

  // ==========================================
  // EMPLOYER_RECRUITER Permissions
  // ==========================================
  EMPLOYER_RECRUITER: {
    // Company (read only)
    company: ['read'],

    // Full job management
    job: ['create', 'read', 'update', 'list'],
    screening_form: ['create', 'read', 'update', 'delete'],

    // Full applicant management
    applicant: ['read', 'update', 'list', 'bulk_update'],

    // Talent pool usage
    talent_pool: ['read', 'list'],
    shortlist: ['create', 'read', 'update', 'delete', 'list'],
    interview_invite: ['create', 'read', 'update', 'list'],

    // Messaging
    message: ['create', 'read', 'list'],

    // Analytics
    employer_analytics: ['read'],
  },

  // ==========================================
  // EMPLOYER_ADMIN Permissions
  // ==========================================
  EMPLOYER_ADMIN: {
    // Company management
    company: ['read', 'update'],

    // Full job management including delete
    job: ['create', 'read', 'update', 'delete', 'list'],
    screening_form: ['create', 'read', 'update', 'delete'],

    // Full applicant management with export
    applicant: ['read', 'update', 'delete', 'list', 'export', 'bulk_update', 'bulk_delete'],

    // Full talent pool
    talent_pool: ['read', 'list', 'export'],
    shortlist: ['create', 'read', 'update', 'delete', 'list'],
    interview_invite: ['create', 'read', 'update', 'delete', 'list'],

    // Full messaging
    message: ['create', 'read', 'delete', 'list'],

    // Full analytics
    employer_analytics: ['read', 'export'],

    // Team management (can manage RECRUITER and VIEWER)
    employer_team: ['create', 'read', 'update', 'list'],

    // Settings
    employer_settings: ['read', 'update'],
  },

  // ==========================================
  // EMPLOYER_OWNER Permissions (Full Access)
  // ==========================================
  EMPLOYER_OWNER: {
    // Full company control
    company: ['read', 'update', 'delete'],

    // Full job management
    job: ['create', 'read', 'update', 'delete', 'list', 'bulk_delete'],
    screening_form: ['create', 'read', 'update', 'delete'],

    // Full applicant management
    applicant: ['read', 'update', 'delete', 'list', 'export', 'bulk_update', 'bulk_delete'],

    // Full talent pool
    talent_pool: ['read', 'list', 'export'],
    shortlist: ['create', 'read', 'update', 'delete', 'list'],
    interview_invite: ['create', 'read', 'update', 'delete', 'list'],

    // Full messaging
    message: ['create', 'read', 'delete', 'list'],

    // Full analytics
    employer_analytics: ['read', 'export'],

    // Full team management (can manage ADMIN, RECRUITER, VIEWER)
    employer_team: ['create', 'read', 'update', 'delete', 'list'],

    // Full settings
    employer_settings: ['read', 'update', 'delete'],
  },

  // ==========================================
  // MODERATOR (Super Admin - Limited)
  // ==========================================
  MODERATOR: {
    // Review moderation
    company_review: ['read', 'update', 'list', 'approve', 'reject'],
    salary_report: ['read', 'update', 'list', 'approve', 'reject'],

    // Job review (no approve, just flag)
    job_approval: ['read', 'list'],

    // User view only
    user_management: ['read', 'list'],

    // Audit log view
    audit_log: ['read', 'list'],
  },

  // ==========================================
  // SUPER_ADMIN (Full Platform Access)
  // ==========================================
  SUPER_ADMIN: {
    // Full user management
    user_management: ['create', 'read', 'update', 'delete', 'list', 'suspend', 'restore'],

    // Full tenant management
    tenant_management: ['create', 'read', 'update', 'delete', 'list', 'suspend', 'restore'],

    // Job approval
    job_approval: ['read', 'list', 'approve', 'reject'],
    job: ['read', 'update', 'delete', 'list'],

    // Review moderation
    review_moderation: ['read', 'update', 'list', 'approve', 'reject', 'delete'],
    company_review: ['read', 'update', 'delete', 'list', 'approve', 'reject'],
    salary_report: ['read', 'update', 'delete', 'list'],

    // Full audit access
    audit_log: ['read', 'list', 'export'],

    // Platform settings
    platform_settings: ['read', 'update'],

    // Cross-tenant company access (with explicit intent)
    company: ['read', 'update', 'suspend', 'restore'],
    applicant: ['read', 'list'],
    employer_analytics: ['read'],
  },
};

// ============================================
// PERMISSION HELPERS
// ============================================

/**
 * Check if a role has permission for an action on a resource
 */
export function hasPermission(
  role: Role,
  resource: Resource,
  action: Action
): boolean {
  const rolePermissions = PERMISSION_MATRIX[role];
  if (!rolePermissions) return false;

  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) return false;

  return resourcePermissions.includes(action);
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: Role): Permission[] {
  const permissions: Permission[] = [];
  const rolePermissions = PERMISSION_MATRIX[role];

  if (!rolePermissions) return permissions;

  for (const [resource, actions] of Object.entries(rolePermissions)) {
    for (const action of actions as Action[]) {
      permissions.push({
        resource: resource as Resource,
        action,
      });
    }
  }

  return permissions;
}

/**
 * Get all roles that have a specific permission
 */
export function getRolesWithPermission(
  resource: Resource,
  action: Action
): Role[] {
  const roles: Role[] = [];

  for (const [role, permissions] of Object.entries(PERMISSION_MATRIX)) {
    const resourcePermissions = permissions[resource];
    if (resourcePermissions?.includes(action)) {
      roles.push(role as Role);
    }
  }

  return roles;
}

// ============================================
// SENSITIVE OPERATIONS
// ============================================

/**
 * Operations that require extra logging/verification
 */
export const SENSITIVE_OPERATIONS: Array<{ resource: Resource; action: Action }> = [
  // Data exports
  { resource: 'applicant', action: 'export' },
  { resource: 'talent_pool', action: 'export' },
  { resource: 'employer_analytics', action: 'export' },
  { resource: 'audit_log', action: 'export' },

  // Bulk operations
  { resource: 'applicant', action: 'bulk_delete' },
  { resource: 'job', action: 'bulk_delete' },

  // Account actions
  { resource: 'user_management', action: 'suspend' },
  { resource: 'user_management', action: 'delete' },
  { resource: 'tenant_management', action: 'suspend' },
  { resource: 'tenant_management', action: 'delete' },

  // Role changes
  { resource: 'employer_team', action: 'create' },
  { resource: 'employer_team', action: 'update' },
  { resource: 'employer_team', action: 'delete' },

  // Settings
  { resource: 'employer_settings', action: 'delete' },
  { resource: 'platform_settings', action: 'update' },
];

/**
 * Check if an operation is sensitive
 */
export function isSensitiveOperation(resource: Resource, action: Action): boolean {
  return SENSITIVE_OPERATIONS.some(
    (op) => op.resource === resource && op.action === action
  );
}

// ============================================
// RESOURCE OWNERSHIP
// ============================================

/**
 * Resources that belong to a tenant
 */
export const TENANT_SCOPED_RESOURCES: Resource[] = [
  'job',
  'applicant',
  'screening_form',
  'shortlist',
  'interview_invite',
  'message',
  'company',
  'employer_team',
  'employer_analytics',
  'employer_settings',
];

/**
 * Resources that belong to a user (not tenant)
 */
export const USER_SCOPED_RESOURCES: Resource[] = [
  'profile',
  'application',
  'saved_job',
  'resume',
  'job_alert',
  'company_review',
  'salary_report',
];

/**
 * Resources accessible only to Super Admins
 */
export const ADMIN_ONLY_RESOURCES: Resource[] = [
  'user_management',
  'tenant_management',
  'job_approval',
  'review_moderation',
  'audit_log',
  'platform_settings',
];

/**
 * Check if resource requires tenant context
 */
export function requiresTenantContext(resource: Resource): boolean {
  return TENANT_SCOPED_RESOURCES.includes(resource);
}

/**
 * Check if resource is admin-only
 */
export function isAdminOnlyResource(resource: Resource): boolean {
  return ADMIN_ONLY_RESOURCES.includes(resource);
}

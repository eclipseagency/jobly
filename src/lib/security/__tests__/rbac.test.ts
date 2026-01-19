/**
 * RBAC (Role-Based Access Control) Tests
 *
 * These tests verify that permissions are correctly enforced
 * based on user roles.
 */

import { describe, it, expect } from 'vitest';
import {
  hasPermission,
  isRoleAtLeast,
  canAssignRole,
  getPermissionsForRole,
  isSensitiveOperation,
  EMPLOYER_ROLE_HIERARCHY,
} from '../permissions';
import { authorize, assertEmployerRole, canModifyUserRole } from '../authorization';
import { createTenantContext, withTenantContextAsync } from '../tenant-context';
import { AuthorizationError } from '../types';

describe('Permission Matrix', () => {
  describe('Employee Permissions', () => {
    it('should allow employees to manage their own profile', () => {
      expect(hasPermission('EMPLOYEE', 'profile', 'read')).toBe(true);
      expect(hasPermission('EMPLOYEE', 'profile', 'update')).toBe(true);
    });

    it('should allow employees to create applications', () => {
      expect(hasPermission('EMPLOYEE', 'application', 'create')).toBe(true);
      expect(hasPermission('EMPLOYEE', 'application', 'read')).toBe(true);
    });

    it('should DENY employees access to employer resources', () => {
      expect(hasPermission('EMPLOYEE', 'job', 'create')).toBe(false);
      expect(hasPermission('EMPLOYEE', 'applicant', 'read')).toBe(false);
      expect(hasPermission('EMPLOYEE', 'employer_team', 'read')).toBe(false);
    });

    it('should DENY employees access to admin resources', () => {
      expect(hasPermission('EMPLOYEE', 'user_management', 'read')).toBe(false);
      expect(hasPermission('EMPLOYEE', 'audit_log', 'read')).toBe(false);
    });
  });

  describe('Employer Viewer Permissions', () => {
    it('should allow viewing jobs and applicants', () => {
      expect(hasPermission('EMPLOYER_VIEWER', 'job', 'read')).toBe(true);
      expect(hasPermission('EMPLOYER_VIEWER', 'job', 'list')).toBe(true);
      expect(hasPermission('EMPLOYER_VIEWER', 'applicant', 'read')).toBe(true);
    });

    it('should DENY creating or editing jobs', () => {
      expect(hasPermission('EMPLOYER_VIEWER', 'job', 'create')).toBe(false);
      expect(hasPermission('EMPLOYER_VIEWER', 'job', 'update')).toBe(false);
      expect(hasPermission('EMPLOYER_VIEWER', 'job', 'delete')).toBe(false);
    });

    it('should DENY managing applicants', () => {
      expect(hasPermission('EMPLOYER_VIEWER', 'applicant', 'update')).toBe(false);
      expect(hasPermission('EMPLOYER_VIEWER', 'applicant', 'bulk_update')).toBe(false);
    });

    it('should DENY team management', () => {
      expect(hasPermission('EMPLOYER_VIEWER', 'employer_team', 'read')).toBe(false);
      expect(hasPermission('EMPLOYER_VIEWER', 'employer_team', 'create')).toBe(false);
    });
  });

  describe('Employer Recruiter Permissions', () => {
    it('should allow full job management (except delete)', () => {
      expect(hasPermission('EMPLOYER_RECRUITER', 'job', 'create')).toBe(true);
      expect(hasPermission('EMPLOYER_RECRUITER', 'job', 'read')).toBe(true);
      expect(hasPermission('EMPLOYER_RECRUITER', 'job', 'update')).toBe(true);
      expect(hasPermission('EMPLOYER_RECRUITER', 'job', 'delete')).toBe(false);
    });

    it('should allow managing applicants', () => {
      expect(hasPermission('EMPLOYER_RECRUITER', 'applicant', 'read')).toBe(true);
      expect(hasPermission('EMPLOYER_RECRUITER', 'applicant', 'update')).toBe(true);
      expect(hasPermission('EMPLOYER_RECRUITER', 'applicant', 'bulk_update')).toBe(true);
    });

    it('should DENY data export', () => {
      expect(hasPermission('EMPLOYER_RECRUITER', 'applicant', 'export')).toBe(false);
    });

    it('should DENY team management', () => {
      expect(hasPermission('EMPLOYER_RECRUITER', 'employer_team', 'create')).toBe(false);
    });
  });

  describe('Employer Admin Permissions', () => {
    it('should allow full job management including delete', () => {
      expect(hasPermission('EMPLOYER_ADMIN', 'job', 'create')).toBe(true);
      expect(hasPermission('EMPLOYER_ADMIN', 'job', 'delete')).toBe(true);
    });

    it('should allow data export', () => {
      expect(hasPermission('EMPLOYER_ADMIN', 'applicant', 'export')).toBe(true);
      expect(hasPermission('EMPLOYER_ADMIN', 'talent_pool', 'export')).toBe(true);
    });

    it('should allow team management', () => {
      expect(hasPermission('EMPLOYER_ADMIN', 'employer_team', 'create')).toBe(true);
      expect(hasPermission('EMPLOYER_ADMIN', 'employer_team', 'update')).toBe(true);
    });

    it('should DENY deleting the company', () => {
      expect(hasPermission('EMPLOYER_ADMIN', 'company', 'delete')).toBe(false);
    });

    it('should DENY deleting team members', () => {
      expect(hasPermission('EMPLOYER_ADMIN', 'employer_team', 'delete')).toBe(false);
    });
  });

  describe('Employer Owner Permissions', () => {
    it('should have full permissions', () => {
      expect(hasPermission('EMPLOYER_OWNER', 'company', 'delete')).toBe(true);
      expect(hasPermission('EMPLOYER_OWNER', 'employer_team', 'delete')).toBe(true);
      expect(hasPermission('EMPLOYER_OWNER', 'employer_settings', 'delete')).toBe(true);
    });
  });

  describe('Super Admin Permissions', () => {
    it('should allow user management', () => {
      expect(hasPermission('SUPER_ADMIN', 'user_management', 'create')).toBe(true);
      expect(hasPermission('SUPER_ADMIN', 'user_management', 'suspend')).toBe(true);
    });

    it('should allow job approval', () => {
      expect(hasPermission('SUPER_ADMIN', 'job_approval', 'approve')).toBe(true);
      expect(hasPermission('SUPER_ADMIN', 'job_approval', 'reject')).toBe(true);
    });

    it('should allow audit log access', () => {
      expect(hasPermission('SUPER_ADMIN', 'audit_log', 'read')).toBe(true);
      expect(hasPermission('SUPER_ADMIN', 'audit_log', 'export')).toBe(true);
    });
  });

  describe('Moderator Permissions', () => {
    it('should allow review moderation', () => {
      expect(hasPermission('MODERATOR', 'company_review', 'approve')).toBe(true);
      expect(hasPermission('MODERATOR', 'company_review', 'reject')).toBe(true);
    });

    it('should DENY user management writes', () => {
      expect(hasPermission('MODERATOR', 'user_management', 'create')).toBe(false);
      expect(hasPermission('MODERATOR', 'user_management', 'suspend')).toBe(false);
    });

    it('should allow viewing audit logs', () => {
      expect(hasPermission('MODERATOR', 'audit_log', 'read')).toBe(true);
      expect(hasPermission('MODERATOR', 'audit_log', 'export')).toBe(false);
    });
  });
});

describe('Role Hierarchy', () => {
  it('should define correct hierarchy order', () => {
    expect(EMPLOYER_ROLE_HIERARCHY).toEqual([
      'EMPLOYER_VIEWER',
      'EMPLOYER_RECRUITER',
      'EMPLOYER_ADMIN',
      'EMPLOYER_OWNER',
    ]);
  });

  describe('isRoleAtLeast', () => {
    it('should return true for same role', () => {
      expect(isRoleAtLeast('EMPLOYER_ADMIN', 'EMPLOYER_ADMIN')).toBe(true);
    });

    it('should return true for higher role', () => {
      expect(isRoleAtLeast('EMPLOYER_OWNER', 'EMPLOYER_ADMIN')).toBe(true);
      expect(isRoleAtLeast('EMPLOYER_OWNER', 'EMPLOYER_VIEWER')).toBe(true);
    });

    it('should return false for lower role', () => {
      expect(isRoleAtLeast('EMPLOYER_VIEWER', 'EMPLOYER_ADMIN')).toBe(false);
      expect(isRoleAtLeast('EMPLOYER_RECRUITER', 'EMPLOYER_OWNER')).toBe(false);
    });
  });

  describe('canAssignRole', () => {
    it('should allow OWNER to assign any lower role', () => {
      expect(canAssignRole('EMPLOYER_OWNER', 'EMPLOYER_ADMIN')).toBe(true);
      expect(canAssignRole('EMPLOYER_OWNER', 'EMPLOYER_RECRUITER')).toBe(true);
      expect(canAssignRole('EMPLOYER_OWNER', 'EMPLOYER_VIEWER')).toBe(true);
    });

    it('should allow ADMIN to assign RECRUITER and VIEWER', () => {
      expect(canAssignRole('EMPLOYER_ADMIN', 'EMPLOYER_RECRUITER')).toBe(true);
      expect(canAssignRole('EMPLOYER_ADMIN', 'EMPLOYER_VIEWER')).toBe(true);
    });

    it('should DENY ADMIN from assigning OWNER or ADMIN', () => {
      expect(canAssignRole('EMPLOYER_ADMIN', 'EMPLOYER_OWNER')).toBe(false);
      expect(canAssignRole('EMPLOYER_ADMIN', 'EMPLOYER_ADMIN')).toBe(false);
    });

    it('should DENY RECRUITER from assigning any role', () => {
      expect(canAssignRole('EMPLOYER_RECRUITER', 'EMPLOYER_VIEWER')).toBe(false);
    });

    it('should DENY VIEWER from assigning any role', () => {
      expect(canAssignRole('EMPLOYER_VIEWER', 'EMPLOYER_VIEWER')).toBe(false);
    });

    it('should prevent role escalation', () => {
      // No one can assign a role higher than their own
      expect(canAssignRole('EMPLOYER_RECRUITER', 'EMPLOYER_ADMIN')).toBe(false);
      expect(canAssignRole('EMPLOYER_ADMIN', 'EMPLOYER_OWNER')).toBe(false);
    });
  });
});

describe('Role Modification Rules', () => {
  const OWNER = {
    id: 'owner-id',
    email: 'owner@company.com',
    role: 'EMPLOYER_OWNER' as const,
    tenantId: 'tenant-id',
    employerRole: 'EMPLOYER_OWNER' as const,
  };

  const ADMIN = {
    id: 'admin-id',
    email: 'admin@company.com',
    role: 'EMPLOYER_ADMIN' as const,
    tenantId: 'tenant-id',
    employerRole: 'EMPLOYER_ADMIN' as const,
  };

  it('should prevent self-role modification', async () => {
    const context = createTenantContext({
      user: OWNER,
      superAdmin: null,
      tenant: null,
    });

    await withTenantContextAsync(context, async () => {
      const canModify = canModifyUserRole(
        OWNER.id, // Trying to modify self
        'EMPLOYER_OWNER',
        'EMPLOYER_ADMIN'
      );
      expect(canModify).toBe(false);
    });
  });

  it('should allow OWNER to demote ADMIN', async () => {
    const context = createTenantContext({
      user: OWNER,
      superAdmin: null,
      tenant: null,
    });

    await withTenantContextAsync(context, async () => {
      const canModify = canModifyUserRole(
        ADMIN.id,
        'EMPLOYER_ADMIN',
        'EMPLOYER_RECRUITER'
      );
      expect(canModify).toBe(true);
    });
  });

  it('should DENY ADMIN from promoting to OWNER', async () => {
    const context = createTenantContext({
      user: ADMIN,
      superAdmin: null,
      tenant: null,
    });

    await withTenantContextAsync(context, async () => {
      const canModify = canModifyUserRole(
        'other-user',
        'EMPLOYER_RECRUITER',
        'EMPLOYER_OWNER' // Trying to create new owner
      );
      expect(canModify).toBe(false);
    });
  });
});

describe('Sensitive Operations', () => {
  it('should flag data exports as sensitive', () => {
    expect(isSensitiveOperation('applicant', 'export')).toBe(true);
    expect(isSensitiveOperation('talent_pool', 'export')).toBe(true);
    expect(isSensitiveOperation('audit_log', 'export')).toBe(true);
  });

  it('should flag bulk operations as sensitive', () => {
    expect(isSensitiveOperation('applicant', 'bulk_delete')).toBe(true);
    expect(isSensitiveOperation('job', 'bulk_delete')).toBe(true);
  });

  it('should flag account actions as sensitive', () => {
    expect(isSensitiveOperation('user_management', 'suspend')).toBe(true);
    expect(isSensitiveOperation('tenant_management', 'delete')).toBe(true);
  });

  it('should NOT flag normal reads as sensitive', () => {
    expect(isSensitiveOperation('job', 'read')).toBe(false);
    expect(isSensitiveOperation('applicant', 'list')).toBe(false);
  });
});

describe('Permission Retrieval', () => {
  it('should return all permissions for a role', () => {
    const permissions = getPermissionsForRole('EMPLOYER_RECRUITER');

    // Should have job permissions
    const jobPermissions = permissions.filter((p) => p.resource === 'job');
    expect(jobPermissions.some((p) => p.action === 'create')).toBe(true);
    expect(jobPermissions.some((p) => p.action === 'read')).toBe(true);

    // Should NOT have delete
    expect(jobPermissions.some((p) => p.action === 'delete')).toBe(false);
  });
});

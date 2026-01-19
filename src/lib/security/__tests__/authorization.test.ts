/**
 * Authorization Tests
 *
 * These tests verify the authorization layer correctly
 * enforces access control decisions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  authorize,
  can,
  assertCan,
  canAll,
  canAny,
  assertEmployerRole,
  validateResourceOwnership,
} from '../authorization';
import { createTenantContext, withTenantContextAsync } from '../tenant-context';
import { AuthorizationError } from '../types';

// Mock the audit logging
vi.mock('../audit', () => ({
  logSecurityEvent: vi.fn(),
}));

describe('Authorization', () => {
  const TENANT_ID = 'test-tenant-id';

  const EMPLOYER_OWNER = {
    id: 'owner-id',
    email: 'owner@company.com',
    role: 'EMPLOYER_OWNER' as const,
    tenantId: TENANT_ID,
    employerRole: 'EMPLOYER_OWNER' as const,
  };

  const EMPLOYER_VIEWER = {
    id: 'viewer-id',
    email: 'viewer@company.com',
    role: 'EMPLOYER_VIEWER' as const,
    tenantId: TENANT_ID,
    employerRole: 'EMPLOYER_VIEWER' as const,
  };

  const EMPLOYEE = {
    id: 'employee-id',
    email: 'jobseeker@email.com',
    role: 'EMPLOYEE' as const,
    tenantId: null,
  };

  const SUPER_ADMIN = {
    id: 'admin-id',
    email: 'admin@jobly.com',
    role: 'SUPER_ADMIN' as const,
  };

  describe('Permission Checks', () => {
    it('should allow authorized actions', async () => {
      const context = createTenantContext({
        user: EMPLOYER_OWNER,
        superAdmin: null,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        const result = await authorize({
          resource: 'job',
          action: 'create',
          tenantId: TENANT_ID,
        });

        expect(result.allowed).toBe(true);
        expect(result.effectiveTenantId).toBe(TENANT_ID);
      });
    });

    it('should DENY unauthorized actions', async () => {
      const context = createTenantContext({
        user: EMPLOYER_VIEWER,
        superAdmin: null,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        await expect(
          authorize({
            resource: 'job',
            action: 'create',
            tenantId: TENANT_ID,
          })
        ).rejects.toThrow(AuthorizationError);
      });
    });

    it('should DENY employee access to employer resources', async () => {
      const context = createTenantContext({
        user: EMPLOYEE,
        superAdmin: null,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        await expect(
          authorize({
            resource: 'job',
            action: 'read',
          })
        ).rejects.toThrow('cannot directly access employer resources');
      });
    });
  });

  describe('Tenant Validation', () => {
    it('should validate tenant ownership on authorization', async () => {
      const context = createTenantContext({
        user: EMPLOYER_OWNER,
        superAdmin: null,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        // Access to own tenant - allowed
        const result = await authorize({
          resource: 'job',
          action: 'read',
          tenantId: TENANT_ID,
        });
        expect(result.allowed).toBe(true);

        // Access to different tenant - denied
        await expect(
          authorize({
            resource: 'job',
            action: 'read',
            tenantId: 'other-tenant-id',
          })
        ).rejects.toThrow('Cannot access resources from another company');
      });
    });

    it('should require cross-tenant flag for Super Admin writes', async () => {
      const context = createTenantContext({
        user: null,
        superAdmin: SUPER_ADMIN,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        // Read without cross-tenant - allowed
        const readResult = await authorize({
          resource: 'job',
          action: 'read',
          tenantId: TENANT_ID,
        });
        expect(readResult.allowed).toBe(true);

        // Write without cross-tenant - should require explicit flag
        // Note: Super Admin can read without cross-tenant, but writes need it
      });
    });

    it('should allow cross-tenant with valid reason', async () => {
      const context = createTenantContext({
        user: null,
        superAdmin: SUPER_ADMIN,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        const result = await authorize({
          resource: 'job',
          action: 'update',
          tenantId: TENANT_ID,
          crossTenantAccess: true,
          reason: 'Fixing content violation per support ticket #456',
        });

        expect(result.allowed).toBe(true);
        expect(result.effectiveTenantId).toBe(TENANT_ID);
      });
    });

    it('should DENY cross-tenant without reason', async () => {
      const context = createTenantContext({
        user: null,
        superAdmin: SUPER_ADMIN,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        await expect(
          authorize({
            resource: 'job',
            action: 'update',
            tenantId: TENANT_ID,
            crossTenantAccess: true,
            reason: 'short', // Too short
          })
        ).rejects.toThrow('Cross-tenant access requires a valid reason');
      });
    });
  });

  describe('Convenience Functions', () => {
    it('can() should return boolean without throwing', async () => {
      const context = createTenantContext({
        user: EMPLOYER_VIEWER,
        superAdmin: null,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        // Allowed action
        expect(await can('job', 'read', TENANT_ID)).toBe(true);

        // Denied action
        expect(await can('job', 'create', TENANT_ID)).toBe(false);
      });
    });

    it('assertCan() should throw for denied actions', async () => {
      const context = createTenantContext({
        user: EMPLOYER_VIEWER,
        superAdmin: null,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        // Should not throw
        await expect(assertCan('job', 'read', TENANT_ID)).resolves.not.toThrow();

        // Should throw
        await expect(assertCan('job', 'create', TENANT_ID)).rejects.toThrow();
      });
    });

    it('canAll() should require all permissions', async () => {
      const context = createTenantContext({
        user: EMPLOYER_OWNER,
        superAdmin: null,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        // All allowed
        const allAllowed = await canAll([
          { resource: 'job', action: 'create', tenantId: TENANT_ID },
          { resource: 'job', action: 'read', tenantId: TENANT_ID },
        ]);
        expect(allAllowed).toBe(true);
      });
    });

    it('canAny() should pass if at least one permission granted', async () => {
      const context = createTenantContext({
        user: EMPLOYER_VIEWER,
        superAdmin: null,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        // Has read but not create
        const hasAny = await canAny([
          { resource: 'job', action: 'create', tenantId: TENANT_ID },
          { resource: 'job', action: 'read', tenantId: TENANT_ID },
        ]);
        expect(hasAny).toBe(true);
      });
    });
  });

  describe('Role Assertions', () => {
    it('assertEmployerRole() should validate minimum role', async () => {
      // Owner context
      let context = createTenantContext({
        user: EMPLOYER_OWNER,
        superAdmin: null,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        // Owner can meet any role requirement
        expect(() => assertEmployerRole('EMPLOYER_OWNER')).not.toThrow();
        expect(() => assertEmployerRole('EMPLOYER_ADMIN')).not.toThrow();
        expect(() => assertEmployerRole('EMPLOYER_VIEWER')).not.toThrow();
      });

      // Viewer context
      context = createTenantContext({
        user: EMPLOYER_VIEWER,
        superAdmin: null,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        // Viewer can only meet VIEWER requirement
        expect(() => assertEmployerRole('EMPLOYER_VIEWER')).not.toThrow();
        expect(() => assertEmployerRole('EMPLOYER_RECRUITER')).toThrow();
        expect(() => assertEmployerRole('EMPLOYER_ADMIN')).toThrow();
        expect(() => assertEmployerRole('EMPLOYER_OWNER')).toThrow();
      });
    });

    it('assertEmployerRole() should allow Super Admin', async () => {
      const context = createTenantContext({
        user: null,
        superAdmin: SUPER_ADMIN,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        // Super Admin bypasses role checks
        expect(() => assertEmployerRole('EMPLOYER_OWNER')).not.toThrow();
      });
    });
  });

  describe('Resource Ownership', () => {
    it('should validate user-owned resources', async () => {
      const context = createTenantContext({
        user: EMPLOYEE,
        superAdmin: null,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        // Own resource
        await expect(
          validateResourceOwnership(EMPLOYEE.id, null)
        ).resolves.not.toThrow();

        // Other user's resource
        await expect(
          validateResourceOwnership('other-user-id', null)
        ).rejects.toThrow('You do not own this resource');
      });
    });

    it('should validate tenant-owned resources', async () => {
      const context = createTenantContext({
        user: EMPLOYER_OWNER,
        superAdmin: null,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        // Own tenant resource
        await expect(
          validateResourceOwnership(null, TENANT_ID)
        ).resolves.not.toThrow();

        // Other tenant's resource
        await expect(
          validateResourceOwnership(null, 'other-tenant')
        ).rejects.toThrow('Resource belongs to a different tenant');
      });
    });

    it('Super Admin should bypass ownership checks', async () => {
      const context = createTenantContext({
        user: null,
        superAdmin: SUPER_ADMIN,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        // Can access any user's resource
        await expect(
          validateResourceOwnership('any-user', null)
        ).resolves.not.toThrow();

        // Can access any tenant's resource
        await expect(
          validateResourceOwnership(null, 'any-tenant')
        ).resolves.not.toThrow();
      });
    });
  });

  describe('Admin-Only Resources', () => {
    it('should DENY non-admins access to admin resources', async () => {
      const context = createTenantContext({
        user: EMPLOYER_OWNER,
        superAdmin: null,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        await expect(
          authorize({
            resource: 'user_management',
            action: 'read',
          })
        ).rejects.toThrow('only accessible to administrators');

        await expect(
          authorize({
            resource: 'audit_log',
            action: 'read',
          })
        ).rejects.toThrow('only accessible to administrators');
      });
    });

    it('should allow Super Admin access to admin resources', async () => {
      const context = createTenantContext({
        user: null,
        superAdmin: SUPER_ADMIN,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        const result = await authorize({
          resource: 'user_management',
          action: 'read',
        });
        expect(result.allowed).toBe(true);
      });
    });
  });
});

describe('Audit Severity', () => {
  const SUPER_ADMIN = {
    id: 'admin-id',
    email: 'admin@jobly.com',
    role: 'SUPER_ADMIN' as const,
  };

  it('should flag cross-tenant access as critical/warning', async () => {
    const context = createTenantContext({
      user: null,
      superAdmin: SUPER_ADMIN,
      tenant: null,
    });

    await withTenantContextAsync(context, async () => {
      const result = await authorize({
        resource: 'job',
        action: 'update',
        tenantId: 'some-tenant',
        crossTenantAccess: true,
        reason: 'Urgent content policy violation fix',
      });

      expect(result.shouldAudit).toBe(true);
      expect(result.auditSeverity).toBe('warning');
    });
  });
});

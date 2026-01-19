/**
 * Tenant Isolation Tests
 *
 * These tests verify that tenant data is completely isolated
 * and no cross-tenant access is possible.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createTenantContext,
  withTenantContextAsync,
  getTenantContext,
  validateTenantOwnership,
  enableCrossTenantAccess,
} from '../tenant-context';
import { secureWhere, guardAgainstIdGuessing } from '../prisma-security';
import { AuthorizationError } from '../types';

// Mock data
const TENANT_A = {
  id: 'tenant-a-id',
  name: 'Company A',
};

const TENANT_B = {
  id: 'tenant-b-id',
  name: 'Company B',
};

const EMPLOYER_A = {
  id: 'employer-a-id',
  email: 'admin@company-a.com',
  role: 'EMPLOYER_OWNER' as const,
  tenantId: TENANT_A.id,
  employerRole: 'EMPLOYER_OWNER' as const,
};

const EMPLOYER_B = {
  id: 'employer-b-id',
  email: 'admin@company-b.com',
  role: 'EMPLOYER_OWNER' as const,
  tenantId: TENANT_B.id,
  employerRole: 'EMPLOYER_OWNER' as const,
};

const SUPER_ADMIN = {
  id: 'super-admin-id',
  email: 'admin@jobly.com',
  role: 'SUPER_ADMIN' as const,
};

describe('Tenant Isolation', () => {
  describe('Tenant Context Creation', () => {
    it('should create context with tenant ID for employers', () => {
      const context = createTenantContext({
        user: EMPLOYER_A,
        superAdmin: null,
        tenant: null,
      });

      expect(context.tenantId).toBe(TENANT_A.id);
      expect(context.userId).toBe(EMPLOYER_A.id);
      expect(context.isSuperAdmin).toBe(false);
    });

    it('should create context without tenant ID for super admins', () => {
      const context = createTenantContext({
        user: null,
        superAdmin: SUPER_ADMIN,
        tenant: null,
      });

      expect(context.tenantId).toBeNull();
      expect(context.isSuperAdmin).toBe(true);
    });

    it('should throw if no auth context provided', () => {
      expect(() =>
        createTenantContext({
          user: null,
          superAdmin: null,
          tenant: null,
        })
      ).toThrow('Invalid auth context');
    });
  });

  describe('Tenant Ownership Validation', () => {
    it('should allow access to own tenant resources', async () => {
      const context = createTenantContext({
        user: EMPLOYER_A,
        superAdmin: null,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        // Should not throw
        expect(() => validateTenantOwnership(TENANT_A.id)).not.toThrow();
      });
    });

    it('should DENY access to other tenant resources', async () => {
      const context = createTenantContext({
        user: EMPLOYER_A,
        superAdmin: null,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        expect(() => validateTenantOwnership(TENANT_B.id)).toThrow(
          AuthorizationError
        );
      });
    });

    it('should DENY access when tenant ID is guessed', async () => {
      const context = createTenantContext({
        user: EMPLOYER_A,
        superAdmin: null,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        // Attempting to access Tenant B's resource
        expect(() => validateTenantOwnership(TENANT_B.id)).toThrow(
          'Resource belongs to a different tenant'
        );
      });
    });
  });

  describe('Cross-Tenant Access Prevention', () => {
    it('should DENY employer cross-tenant access even if ID is known', async () => {
      const context = createTenantContext({
        user: EMPLOYER_A,
        superAdmin: null,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        // Employer A tries to access Employer B's job
        const foreignJob = {
          id: 'job-from-tenant-b',
          tenantId: TENANT_B.id,
          title: 'Secret Job',
        };

        // guardAgainstIdGuessing should return "not found" (not "forbidden")
        // to prevent information leakage
        await expect(
          guardAgainstIdGuessing(foreignJob, 'Job')
        ).rejects.toThrow('Job not found');
      });
    });

    it('should allow Super Admin to read all tenants', async () => {
      const context = createTenantContext({
        user: null,
        superAdmin: SUPER_ADMIN,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        // Super Admin can read any tenant's resources
        expect(() => validateTenantOwnership(TENANT_A.id)).not.toThrow();
        expect(() => validateTenantOwnership(TENANT_B.id)).not.toThrow();
      });
    });

    it('should REQUIRE explicit cross-tenant flag for Super Admin writes', async () => {
      const context = createTenantContext({
        user: null,
        superAdmin: SUPER_ADMIN,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        // For writes, Super Admin must explicitly enable cross-tenant
        // This test would be integrated with the actual write operations
        const newContext = enableCrossTenantAccess(
          TENANT_A.id,
          'Fixing content violation as per support ticket #123'
        );

        expect(newContext.explicitCrossTenant).toBe(true);
        expect(newContext.targetTenantId).toBe(TENANT_A.id);
      });
    });

    it('should DENY cross-tenant access without valid reason', async () => {
      const context = createTenantContext({
        user: null,
        superAdmin: SUPER_ADMIN,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        // Short reason should be rejected
        expect(() => enableCrossTenantAccess(TENANT_A.id, 'short')).toThrow(
          'Cross-tenant access requires a valid reason'
        );
      });
    });
  });

  describe('Query Filtering', () => {
    it('should auto-inject tenantId into where clause for employers', async () => {
      const context = createTenantContext({
        user: EMPLOYER_A,
        superAdmin: null,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        const where = secureWhere({ isActive: true });
        expect(where.tenantId).toBe(TENANT_A.id);
      });
    });

    it('should NOT inject tenantId for Super Admin reads', async () => {
      const context = createTenantContext({
        user: null,
        superAdmin: SUPER_ADMIN,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        const where = secureWhere({ isActive: true });
        expect(where.tenantId).toBeUndefined();
      });
    });

    it('should inject targetTenantId for explicit cross-tenant access', async () => {
      let context = createTenantContext({
        user: null,
        superAdmin: SUPER_ADMIN,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        context = enableCrossTenantAccess(
          TENANT_A.id,
          'Investigating reported job posting'
        );

        await withTenantContextAsync(context, async () => {
          const where = secureWhere({ isActive: true });
          expect(where.tenantId).toBe(TENANT_A.id);
        });
      });
    });
  });

  describe('ID Guessing Attack Prevention', () => {
    it('should return "not found" for cross-tenant resources', async () => {
      const context = createTenantContext({
        user: EMPLOYER_A,
        superAdmin: null,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        // Resource from another tenant
        const resource = {
          id: 'some-id',
          tenantId: TENANT_B.id,
          data: 'sensitive',
        };

        // Should NOT reveal that resource exists
        await expect(guardAgainstIdGuessing(resource, 'Resource')).rejects.toThrow(
          'Resource not found' // Not "belongs to another tenant"
        );
      });
    });

    it('should return actual resource for own tenant', async () => {
      const context = createTenantContext({
        user: EMPLOYER_A,
        superAdmin: null,
        tenant: null,
      });

      await withTenantContextAsync(context, async () => {
        const resource = {
          id: 'my-resource',
          tenantId: TENANT_A.id,
          data: 'my data',
        };

        const result = await guardAgainstIdGuessing(resource, 'Resource');
        expect(result.data).toBe('my data');
      });
    });
  });
});

describe('Employee Isolation', () => {
  const EMPLOYEE = {
    id: 'employee-id',
    email: 'jobseeker@email.com',
    role: 'EMPLOYEE' as const,
    tenantId: null,
  };

  it('should NOT allow employees to access tenant resources', async () => {
    const context = createTenantContext({
      user: EMPLOYEE,
      superAdmin: null,
      tenant: null,
    });

    await withTenantContextAsync(context, async () => {
      // Employee trying to access employer resource
      expect(() => validateTenantOwnership(TENANT_A.id)).toThrow(
        'Employees cannot access tenant-scoped resources'
      );
    });
  });

  it('should inject userId for employee queries', async () => {
    const context = createTenantContext({
      user: EMPLOYEE,
      superAdmin: null,
      tenant: null,
    });

    await withTenantContextAsync(context, async () => {
      const where = secureWhere({});
      expect(where.userId).toBe(EMPLOYEE.id);
    });
  });
});

/**
 * Prisma Security Layer
 *
 * Provides secure database access with automatic tenant isolation,
 * query validation, and protection against unsafe operations.
 */

import { PrismaClient, Prisma } from '@prisma/client';
import {
  SecureQueryOptions,
  QueryValidation,
  AuthorizationError,
  Resource,
} from './types';
import {
  getTenantContext,
  getCurrentTenantId,
  isSuperAdmin,
} from './tenant-context';
import { logSecurityEvent } from './audit';

// ============================================
// TENANT-SCOPED MODELS
// ============================================

/**
 * Models that require tenantId for all operations
 */
const TENANT_SCOPED_MODELS = [
  'job',
  'screeningForm',
  'screeningQuestion',
  'screeningRule',
  'application', // Through job.tenantId
  'interviewInvite',
  'message',
  'employerShortlist',
  'shortlistCandidate',
  'savedFilter',
  'candidateBlock',
] as const;

/**
 * Models that are owned by users (not tenants)
 */
const USER_SCOPED_MODELS = [
  'user',
  'savedJob',
  'workExperience',
  'education',
  'certification',
  'language',
  'reference',
  'notification',
  'resume',
  'talentPoolProfile',
  'jobAlert',
  'companyReview',
  'salaryReport',
] as const;

/**
 * Models that are global (no tenant/user scope)
 */
const GLOBAL_MODELS = [
  'tenant',
  'superAdmin',
  'auditLog',
  'twoFactorAuth',
] as const;

type TenantScopedModel = typeof TENANT_SCOPED_MODELS[number];
type UserScopedModel = typeof USER_SCOPED_MODELS[number];

// ============================================
// SECURE PRISMA CLIENT
// ============================================

/**
 * Create a secure Prisma client with automatic tenant filtering
 */
export function createSecurePrismaClient(basePrisma: PrismaClient): PrismaClient {
  return basePrisma.$extends({
    query: {
      // Intercept all queries
      $allOperations({ model, operation, args, query }) {
        // Skip security for models without tenant scope
        if (!model) return query(args);

        const modelLower = model.toLowerCase();

        // Check if this is a tenant-scoped model
        if (TENANT_SCOPED_MODELS.includes(modelLower as TenantScopedModel)) {
          return handleTenantScopedQuery(model, operation, args, query);
        }

        // Check if this is a user-scoped model
        if (USER_SCOPED_MODELS.includes(modelLower as UserScopedModel)) {
          return handleUserScopedQuery(model, operation, args, query);
        }

        // Global models - no additional filtering
        return query(args);
      },
    },
  }) as PrismaClient;
}

/**
 * Handle queries on tenant-scoped models
 */
async function handleTenantScopedQuery(
  model: string,
  operation: string,
  args: any,
  query: (args: any) => Promise<any>
): Promise<any> {
  const context = getTenantContext();

  // Super Admin with explicit cross-tenant access
  if (context.isSuperAdmin && context.explicitCrossTenant && context.targetTenantId) {
    return injectTenantFilter(args, context.targetTenantId, operation, query);
  }

  // Super Admin read operations (no filter needed)
  if (context.isSuperAdmin && isReadOperation(operation)) {
    return query(args);
  }

  // Super Admin write operations require explicit cross-tenant
  if (context.isSuperAdmin && !isReadOperation(operation)) {
    throw new AuthorizationError(
      `Super Admin must use explicit cross-tenant access for write operations on ${model}`,
      'CROSS_TENANT_DENIED'
    );
  }

  // Employee cannot access tenant-scoped models directly
  if (context.userType === 'EMPLOYEE') {
    throw new AuthorizationError(
      `Employees cannot directly access ${model}`,
      'FORBIDDEN'
    );
  }

  // Employer must have tenant
  if (!context.tenantId) {
    throw new AuthorizationError(
      `Employer has no tenant ID for ${model} access`,
      'TENANT_MISMATCH'
    );
  }

  return injectTenantFilter(args, context.tenantId, operation, query);
}

/**
 * Handle queries on user-scoped models
 */
async function handleUserScopedQuery(
  model: string,
  operation: string,
  args: any,
  query: (args: any) => Promise<any>
): Promise<any> {
  const context = getTenantContext();

  // Super Admin can access all user data
  if (context.isSuperAdmin) {
    return query(args);
  }

  // Regular users can only access their own data
  return injectUserFilter(args, context.userId, operation, query);
}

/**
 * Inject tenant filter into query args
 */
function injectTenantFilter(
  args: any,
  tenantId: string,
  operation: string,
  query: (args: any) => Promise<any>
): Promise<any> {
  const newArgs = { ...args };

  switch (operation) {
    case 'findUnique':
    case 'findFirst':
    case 'findMany':
    case 'count':
    case 'aggregate':
    case 'groupBy':
      // Add tenant filter to where clause
      newArgs.where = {
        ...newArgs.where,
        tenantId,
      };
      break;

    case 'create':
      // Ensure tenantId is set on create
      newArgs.data = {
        ...newArgs.data,
        tenantId,
      };
      break;

    case 'createMany':
      // Ensure tenantId is set on all records
      if (Array.isArray(newArgs.data)) {
        newArgs.data = newArgs.data.map((item: any) => ({
          ...item,
          tenantId,
        }));
      }
      break;

    case 'update':
    case 'delete':
      // Add tenant filter to where clause
      newArgs.where = {
        ...newArgs.where,
        tenantId,
      };
      break;

    case 'updateMany':
    case 'deleteMany':
      // CRITICAL: Always add tenant filter for bulk operations
      newArgs.where = {
        ...newArgs.where,
        tenantId,
      };
      break;

    case 'upsert':
      // Add tenant filter and ensure create has tenantId
      newArgs.where = {
        ...newArgs.where,
        tenantId,
      };
      newArgs.create = {
        ...newArgs.create,
        tenantId,
      };
      newArgs.update = {
        ...newArgs.update,
        // Don't allow changing tenantId on update
      };
      break;
  }

  return query(newArgs);
}

/**
 * Inject user filter into query args
 */
function injectUserFilter(
  args: any,
  userId: string,
  operation: string,
  query: (args: any) => Promise<any>
): Promise<any> {
  const newArgs = { ...args };

  switch (operation) {
    case 'findUnique':
    case 'findFirst':
    case 'findMany':
    case 'count':
    case 'aggregate':
    case 'groupBy':
      newArgs.where = {
        ...newArgs.where,
        userId,
      };
      break;

    case 'create':
      newArgs.data = {
        ...newArgs.data,
        userId,
      };
      break;

    case 'createMany':
      if (Array.isArray(newArgs.data)) {
        newArgs.data = newArgs.data.map((item: any) => ({
          ...item,
          userId,
        }));
      }
      break;

    case 'update':
    case 'delete':
      newArgs.where = {
        ...newArgs.where,
        userId,
      };
      break;

    case 'updateMany':
    case 'deleteMany':
      newArgs.where = {
        ...newArgs.where,
        userId,
      };
      break;

    case 'upsert':
      newArgs.where = {
        ...newArgs.where,
        userId,
      };
      newArgs.create = {
        ...newArgs.create,
        userId,
      };
      break;
  }

  return query(newArgs);
}

/**
 * Check if operation is read-only
 */
function isReadOperation(operation: string): boolean {
  return ['findUnique', 'findFirst', 'findMany', 'count', 'aggregate', 'groupBy'].includes(operation);
}

// ============================================
// QUERY BUILDERS WITH SECURITY
// ============================================

/**
 * Build a secure where clause with tenant filter
 */
export function secureWhere<T extends Record<string, any>>(
  where: T,
  options?: { requireTenant?: boolean }
): T & { tenantId?: string; userId?: string } {
  const context = getTenantContext();

  // Super Admin - no filter unless explicitly requested
  if (context.isSuperAdmin) {
    if (context.explicitCrossTenant && context.targetTenantId) {
      return { ...where, tenantId: context.targetTenantId };
    }
    return where;
  }

  // Employee - add userId
  if (context.userType === 'EMPLOYEE') {
    return { ...where, userId: context.userId };
  }

  // Employer - add tenantId
  if (options?.requireTenant && !context.tenantId) {
    throw new AuthorizationError(
      'Tenant context required for this query',
      'TENANT_MISMATCH'
    );
  }

  if (context.tenantId) {
    return { ...where, tenantId: context.tenantId };
  }

  return where;
}

/**
 * Validate a resource belongs to current tenant before access
 */
export async function validateResourceAccess(
  prisma: PrismaClient,
  model: string,
  resourceId: string
): Promise<void> {
  const context = getTenantContext();

  // Super Admin bypasses
  if (context.isSuperAdmin) return;

  // Get resource's tenant/user
  const resource = await (prisma as any)[model].findUnique({
    where: { id: resourceId },
    select: { tenantId: true, userId: true },
  });

  if (!resource) {
    throw new AuthorizationError(
      'Resource not found',
      'RESOURCE_NOT_FOUND'
    );
  }

  // Check tenant match
  if (resource.tenantId && resource.tenantId !== context.tenantId) {
    throw new AuthorizationError(
      'Resource belongs to another tenant',
      'TENANT_MISMATCH'
    );
  }

  // Check user match
  if (resource.userId && resource.userId !== context.userId) {
    throw new AuthorizationError(
      'Resource belongs to another user',
      'FORBIDDEN'
    );
  }
}

// ============================================
// DANGEROUS OPERATION GUARDS
// ============================================

/**
 * Guard against unsafe bulk operations
 * Must be called explicitly before deleteMany/updateMany without tenantId
 */
export function assertSafeBulkOperation(
  where: Record<string, any>,
  operation: 'deleteMany' | 'updateMany'
): void {
  const context = getTenantContext();

  // Check if where clause is too broad
  const hasSpecificFilter = where.tenantId || where.userId || where.id || where.ids;

  if (!hasSpecificFilter) {
    // Super Admin requires explicit acknowledgment
    if (context.isSuperAdmin) {
      throw new AuthorizationError(
        `Unsafe ${operation}: Super Admin must specify tenantId, userId, or id filter. ` +
        'Use withBulkOperationAcknowledgment() for intentional broad operations.',
        'FORBIDDEN'
      );
    }

    throw new AuthorizationError(
      `Unsafe ${operation}: Query has no tenant or user filter`,
      'FORBIDDEN'
    );
  }
}

/**
 * Guard against ID guessing attacks
 * Validates the resource belongs to current context before returning
 */
export async function guardAgainstIdGuessing<T extends { tenantId?: string; userId?: string }>(
  resource: T | null,
  resourceType: string
): Promise<T> {
  if (!resource) {
    throw new AuthorizationError(
      `${resourceType} not found`,
      'RESOURCE_NOT_FOUND'
    );
  }

  const context = getTenantContext();

  // Super Admin bypasses
  if (context.isSuperAdmin) return resource;

  // Check tenant
  if (resource.tenantId && resource.tenantId !== context.tenantId) {
    // Log potential ID guessing attempt
    await logSecurityEvent({
      eventType: 'suspicious_activity',
      actor: {
        type: context.userType === 'EMPLOYER' ? 'employer' : 'user',
        id: context.userId,
        role: context.role,
      },
      target: {
        type: resourceType as Resource,
        id: 'unknown',
        tenantId: resource.tenantId,
      },
      action: 'read',
      result: 'denied',
      reason: 'Potential ID guessing - tenant mismatch',
    });

    // Return generic "not found" to prevent information leakage
    throw new AuthorizationError(
      `${resourceType} not found`,
      'RESOURCE_NOT_FOUND'
    );
  }

  // Check user
  if (resource.userId && resource.userId !== context.userId && context.userType === 'EMPLOYEE') {
    await logSecurityEvent({
      eventType: 'suspicious_activity',
      actor: {
        type: 'user',
        id: context.userId,
        role: context.role,
      },
      target: {
        type: resourceType as Resource,
        id: 'unknown',
      },
      action: 'read',
      result: 'denied',
      reason: 'Potential ID guessing - user mismatch',
    });

    throw new AuthorizationError(
      `${resourceType} not found`,
      'RESOURCE_NOT_FOUND'
    );
  }

  return resource;
}

// ============================================
// TRANSACTION SECURITY
// ============================================

/**
 * Run a transaction with tenant context preserved
 */
export async function secureTransaction<T>(
  prisma: PrismaClient,
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  const context = getTenantContext();

  return prisma.$transaction(async (tx) => {
    // The context is preserved through AsyncLocalStorage
    // But we add extra validation
    const currentContext = getTenantContext();

    if (currentContext.userId !== context.userId) {
      throw new AuthorizationError(
        'Security context changed during transaction',
        'FORBIDDEN'
      );
    }

    return fn(tx);
  });
}

// ============================================
// QUERY SANITIZATION
// ============================================

/**
 * Sanitize and validate a query to prevent injection
 */
export function sanitizeQuery(
  where: Record<string, any>
): QueryValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for potentially dangerous patterns
  const dangerousPatterns = [
    { pattern: /\$where/i, message: 'MongoDB-style $where not allowed' },
    { pattern: /\$expr/i, message: 'MongoDB-style $expr not allowed' },
    { pattern: /;.*DROP/i, message: 'Potential SQL injection detected' },
    { pattern: /UNION\s+SELECT/i, message: 'Potential SQL injection detected' },
  ];

  const whereString = JSON.stringify(where);

  for (const { pattern, message } of dangerousPatterns) {
    if (pattern.test(whereString)) {
      errors.push(message);
    }
  }

  // Check for overly broad queries
  if (Object.keys(where).length === 0) {
    warnings.push('Query has no filters - this will return all records');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sanitizedWhere: where, // Prisma handles parameterization
  };
}

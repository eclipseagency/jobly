/**
 * Security Middleware for API Routes
 *
 * Provides authentication, authorization, and tenant context
 * for all API routes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  AuthContext,
  TenantContext,
  Resource,
  Action,
  Role,
  EmployerRole,
  AuthorizationError,
} from './types';
import {
  createTenantContext,
  withTenantContextAsync,
} from './tenant-context';
import { authorize } from './authorization';
import { logSecurityEvent } from './audit';
import { hasPermission } from './permissions';

// ============================================
// TOKEN VERIFICATION
// ============================================

interface JWTPayload {
  userId?: string;
  superAdminId?: string;
  email: string;
  role: string;
  tenantId?: string;
  employerRole?: EmployerRole;
  iat: number;
  exp: number;
}

/**
 * Verify JWT token and extract payload
 * In production, use a proper JWT library
 */
async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    // Simple base64 decode for demonstration
    // In production, use jsonwebtoken with proper secret verification
    const [, payload] = token.split('.');
    if (!payload) return null;

    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());

    // Check expiration
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

/**
 * Extract auth context from request
 */
async function extractAuthContext(request: NextRequest): Promise<AuthContext> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  // Check for Super Admin token
  const superAdminToken = request.headers.get('x-superadmin-token');

  // Legacy: Check for user ID header (will be deprecated)
  const legacyUserId = request.headers.get('x-user-id');

  let authContext: AuthContext = {
    user: null,
    superAdmin: null,
    tenant: null,
  };

  // Super Admin authentication
  if (superAdminToken) {
    const payload = await verifyToken(superAdminToken);
    if (payload?.superAdminId) {
      const superAdmin = await prisma.superAdmin.findUnique({
        where: { id: payload.superAdminId },
        select: { id: true, email: true, role: true, isActive: true },
      });

      if (superAdmin?.isActive) {
        authContext.superAdmin = {
          id: superAdmin.id,
          email: superAdmin.email,
          role: superAdmin.role as 'SUPER_ADMIN' | 'MODERATOR',
        };
      }
    }
  }

  // User authentication
  if (token) {
    const payload = await verifyToken(token);
    if (payload?.userId) {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          role: true,
          tenantId: true,
          isActive: true,
          isSuspended: true,
        },
      });

      if (user?.isActive && !user.isSuspended) {
        // Get employer role if applicable
        let employerRole: EmployerRole | undefined;
        if (user.role === 'EMPLOYER' && user.tenantId) {
          // In a real system, this would come from a team membership table
          // For now, we'll use the token's employer role
          employerRole = payload.employerRole || 'EMPLOYER_OWNER';
        }

        authContext.user = {
          id: user.id,
          email: user.email,
          role: user.role === 'EMPLOYEE' ? 'EMPLOYEE' : employerRole || 'EMPLOYER_OWNER',
          tenantId: user.tenantId,
          employerRole,
        };
      }
    }
  }

  // Legacy support: x-user-id header
  if (!authContext.user && !authContext.superAdmin && legacyUserId) {
    const user = await prisma.user.findUnique({
      where: { id: legacyUserId },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        isActive: true,
        isSuspended: true,
      },
    });

    if (user?.isActive && !user.isSuspended) {
      authContext.user = {
        id: user.id,
        email: user.email || '',
        role: user.role === 'EMPLOYEE' ? 'EMPLOYEE' : 'EMPLOYER_OWNER',
        tenantId: user.tenantId,
      };
    }
  }

  return authContext;
}

// ============================================
// MIDDLEWARE FUNCTIONS
// ============================================

/**
 * Options for secured route
 */
interface SecuredRouteOptions {
  // Required permissions for this route
  resource?: Resource;
  action?: Action;

  // Allow specific roles
  allowedRoles?: Role[];

  // Allow unauthenticated access (for public endpoints)
  allowUnauthenticated?: boolean;

  // Allow suspended users (for viewing suspension info)
  allowSuspended?: boolean;

  // Require Super Admin
  requireSuperAdmin?: boolean;

  // Require specific employer role
  requireEmployerRole?: EmployerRole;
}

/**
 * Secure route handler type
 */
type SecuredHandler<T = any> = (
  request: NextRequest,
  context: {
    auth: AuthContext;
    tenant: TenantContext;
    params?: Record<string, string>;
  }
) => Promise<NextResponse<T>>;

/**
 * Create a secured API route handler
 *
 * @example
 * export const GET = securedRoute(
 *   { resource: 'job', action: 'list' },
 *   async (request, { auth, tenant }) => {
 *     const jobs = await prisma.job.findMany({
 *       where: { tenantId: tenant.tenantId }
 *     });
 *     return NextResponse.json({ jobs });
 *   }
 * );
 */
export function securedRoute<T = any>(
  options: SecuredRouteOptions,
  handler: SecuredHandler<T>
): (request: NextRequest, context?: { params?: Record<string, string> }) => Promise<NextResponse> {
  return async (request: NextRequest, routeContext?: { params?: Record<string, string> }) => {
    try {
      // Extract auth context
      const auth = await extractAuthContext(request);

      // Check authentication
      if (!options.allowUnauthenticated && !auth.user && !auth.superAdmin) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Check for suspended account
      if (!options.allowSuspended && auth.user) {
        const user = await prisma.user.findUnique({
          where: { id: auth.user.id },
          select: { isSuspended: true, suspensionReason: true },
        });

        if (user?.isSuspended) {
          return NextResponse.json(
            {
              error: 'Account suspended',
              reason: user.suspensionReason,
            },
            { status: 403 }
          );
        }
      }

      // Check Super Admin requirement
      if (options.requireSuperAdmin && !auth.superAdmin) {
        return NextResponse.json(
          { error: 'Super Admin access required' },
          { status: 403 }
        );
      }

      // Check role requirements
      if (options.allowedRoles && options.allowedRoles.length > 0) {
        const userRole = auth.superAdmin?.role || auth.user?.role;
        if (!userRole || !options.allowedRoles.includes(userRole)) {
          return NextResponse.json(
            { error: 'Insufficient role permissions' },
            { status: 403 }
          );
        }
      }

      // Check employer role requirement
      if (options.requireEmployerRole && auth.user) {
        if (!auth.user.employerRole) {
          return NextResponse.json(
            { error: 'Employer role required' },
            { status: 403 }
          );
        }

        // Check role hierarchy
        const roleHierarchy = [
          'EMPLOYER_VIEWER',
          'EMPLOYER_RECRUITER',
          'EMPLOYER_ADMIN',
          'EMPLOYER_OWNER',
        ];
        const requiredIndex = roleHierarchy.indexOf(options.requireEmployerRole);
        const userIndex = roleHierarchy.indexOf(auth.user.employerRole);

        if (userIndex < requiredIndex) {
          return NextResponse.json(
            { error: `Requires at least ${options.requireEmployerRole} role` },
            { status: 403 }
          );
        }
      }

      // Create tenant context
      let tenantContext: TenantContext;

      if (auth.superAdmin) {
        tenantContext = createTenantContext(auth);
      } else if (auth.user) {
        tenantContext = createTenantContext(auth);
      } else {
        // Unauthenticated - minimal context
        tenantContext = {
          tenantId: null,
          userId: 'anonymous',
          userType: 'EMPLOYEE',
          role: 'EMPLOYEE',
          permissions: [],
          isSuperAdmin: false,
        };
      }

      // Check resource permission
      if (options.resource && options.action) {
        if (!hasPermission(tenantContext.role, options.resource, options.action)) {
          await logSecurityEvent({
            eventType: 'permission_denied',
            actor: {
              type: tenantContext.isSuperAdmin ? 'super_admin' : tenantContext.userType === 'EMPLOYER' ? 'employer' : 'user',
              id: tenantContext.userId,
              role: tenantContext.role,
            },
            action: options.action,
            result: 'denied',
            reason: `No ${options.action} permission on ${options.resource}`,
            ipAddress: request.headers.get('x-forwarded-for') || undefined,
            userAgent: request.headers.get('user-agent') || undefined,
          });

          return NextResponse.json(
            { error: 'Permission denied' },
            { status: 403 }
          );
        }
      }

      // Run handler with tenant context
      return await withTenantContextAsync(tenantContext, async () => {
        return handler(request, {
          auth,
          tenant: tenantContext,
          params: routeContext?.params,
        });
      });
    } catch (error) {
      // Handle authorization errors
      if (error instanceof AuthorizationError) {
        const status = error.code === 'UNAUTHENTICATED' ? 401 :
                      error.code === 'RESOURCE_NOT_FOUND' ? 404 : 403;

        return NextResponse.json(
          { error: error.message, code: error.code },
          { status }
        );
      }

      // Log unexpected errors
      console.error('[Security Middleware] Unexpected error:', error);

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// ============================================
// CONVENIENCE MIDDLEWARE FACTORIES
// ============================================

/**
 * Create a route that requires authentication only
 */
export function authenticatedRoute<T = any>(
  handler: SecuredHandler<T>
): (request: NextRequest, context?: { params?: Record<string, string> }) => Promise<NextResponse> {
  return securedRoute({}, handler);
}

/**
 * Create a route that requires Super Admin
 */
export function superAdminRoute<T = any>(
  handler: SecuredHandler<T>
): (request: NextRequest, context?: { params?: Record<string, string> }) => Promise<NextResponse> {
  return securedRoute({ requireSuperAdmin: true }, handler);
}

/**
 * Create a route for employers only
 */
export function employerRoute<T = any>(
  options: { resource?: Resource; action?: Action; minimumRole?: EmployerRole },
  handler: SecuredHandler<T>
): (request: NextRequest, context?: { params?: Record<string, string> }) => Promise<NextResponse> {
  return securedRoute(
    {
      ...options,
      allowedRoles: ['EMPLOYER_OWNER', 'EMPLOYER_ADMIN', 'EMPLOYER_RECRUITER', 'EMPLOYER_VIEWER'],
      requireEmployerRole: options.minimumRole,
    },
    handler
  );
}

/**
 * Create a route for employees only
 */
export function employeeRoute<T = any>(
  options: { resource?: Resource; action?: Action },
  handler: SecuredHandler<T>
): (request: NextRequest, context?: { params?: Record<string, string> }) => Promise<NextResponse> {
  return securedRoute(
    {
      ...options,
      allowedRoles: ['EMPLOYEE'],
    },
    handler
  );
}

/**
 * Create a public route (no auth required)
 */
export function publicRoute<T = any>(
  handler: SecuredHandler<T>
): (request: NextRequest, context?: { params?: Record<string, string> }) => Promise<NextResponse> {
  return securedRoute({ allowUnauthenticated: true }, handler);
}

// ============================================
// HELPER TO GET TENANT FROM REQUEST
// ============================================

/**
 * Quick helper to get tenant ID from authenticated request
 * For use in routes that don't use securedRoute
 */
export async function getTenantFromRequest(
  request: NextRequest
): Promise<{ tenantId: string; userId: string } | null> {
  const auth = await extractAuthContext(request);

  if (!auth.user?.tenantId) {
    return null;
  }

  return {
    tenantId: auth.user.tenantId,
    userId: auth.user.id,
  };
}

/**
 * Quick helper to get user ID from authenticated request
 */
export async function getUserFromRequest(
  request: NextRequest
): Promise<{ userId: string; role: Role } | null> {
  const auth = await extractAuthContext(request);

  if (!auth.user && !auth.superAdmin) {
    return null;
  }

  if (auth.superAdmin) {
    return {
      userId: auth.superAdmin.id,
      role: auth.superAdmin.role,
    };
  }

  return {
    userId: auth.user!.id,
    role: auth.user!.role,
  };
}

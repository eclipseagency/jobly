/**
 * Example: Secured API Route
 *
 * This file demonstrates how to use the security system
 * in an actual API route.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  // Middleware helpers
  securedRoute,
  employerRoute,
  superAdminRoute,

  // Authorization
  authorize,
  can,
  assertEmployerRole,

  // Prisma security
  secureWhere,
  guardAgainstIdGuessing,
  secureTransaction,

  // Tenant context
  getCurrentTenantId,
  getCurrentUserId,
  withCrossTenantAccess,

  // Audit
  logDataExport,
  logBulkOperation,

  // Types
  AuthContext,
  TenantContext,
} from '../index';

// ============================================
// EXAMPLE 1: Basic Secured Route
// ============================================

/**
 * GET /api/employer/jobs - List jobs for current tenant
 *
 * Uses employerRoute() which:
 * - Requires authentication
 * - Requires employer role
 * - Automatically sets up tenant context
 */
export const GET_Jobs = employerRoute(
  { resource: 'job', action: 'list' },
  async (request, { auth, tenant }) => {
    // Tenant context is already set up
    // secureWhere automatically adds tenantId filter
    const jobs = await prisma.job.findMany({
      where: secureWhere({
        isActive: true,
      }),
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ jobs });
  }
);

// ============================================
// EXAMPLE 2: Role-Restricted Route
// ============================================

/**
 * POST /api/employer/jobs - Create a new job
 *
 * Only RECRUITER and above can create jobs
 */
export const POST_Jobs = employerRoute(
  {
    resource: 'job',
    action: 'create',
    minimumRole: 'EMPLOYER_RECRUITER',
  },
  async (request, { auth, tenant }) => {
    const body = await request.json();

    const job = await prisma.job.create({
      data: {
        ...body,
        tenantId: tenant.tenantId!, // Guaranteed to exist
      },
    });

    return NextResponse.json({ job }, { status: 201 });
  }
);

// ============================================
// EXAMPLE 3: Resource-Specific Access
// ============================================

/**
 * GET /api/employer/jobs/[id] - Get specific job
 *
 * Demonstrates resource ownership validation
 */
export const GET_JobById = employerRoute(
  { resource: 'job', action: 'read' },
  async (request, { auth, tenant, params }) => {
    const jobId = params?.id;

    // Fetch the job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    // This will:
    // 1. Return "not found" for non-existent jobs
    // 2. Return "not found" for jobs from other tenants (prevents ID guessing)
    // 3. Return the job if it belongs to current tenant
    const validatedJob = await guardAgainstIdGuessing(job, 'Job');

    return NextResponse.json({ job: validatedJob });
  }
);

// ============================================
// EXAMPLE 4: Sensitive Operation (Export)
// ============================================

/**
 * GET /api/employer/applicants/export - Export applicants
 *
 * Only ADMIN and above can export data
 */
export const GET_ExportApplicants = employerRoute(
  {
    resource: 'applicant',
    action: 'export',
    minimumRole: 'EMPLOYER_ADMIN',
  },
  async (request, { auth, tenant }) => {
    // Check authorization for export
    await authorize({
      resource: 'applicant',
      action: 'export',
      tenantId: tenant.tenantId!,
    });

    const applicants = await prisma.application.findMany({
      where: secureWhere({}),
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        job: {
          select: {
            title: true,
          },
        },
      },
    });

    // Log the export for audit trail
    await logDataExport(
      tenant.userId,
      tenant.role,
      'applicant',
      applicants.length,
      tenant.tenantId!
    );

    return NextResponse.json({ applicants });
  }
);

// ============================================
// EXAMPLE 5: Bulk Operation with Protection
// ============================================

/**
 * POST /api/employer/applicants/bulk-reject - Bulk reject applicants
 *
 * Demonstrates bulk operation security
 */
export const POST_BulkReject = employerRoute(
  {
    resource: 'applicant',
    action: 'bulk_update',
    minimumRole: 'EMPLOYER_RECRUITER',
  },
  async (request, { auth, tenant }) => {
    const { applicationIds } = await request.json();

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json(
        { error: 'applicationIds array required' },
        { status: 400 }
      );
    }

    // Use secure transaction for consistency
    const result = await secureTransaction(prisma, async (tx) => {
      // Update applications - tenantId filter is auto-injected
      const updated = await tx.application.updateMany({
        where: secureWhere({
          id: { in: applicationIds },
        }),
        data: {
          status: 'rejected',
        },
      });

      return updated;
    });

    // Log the bulk operation
    await logBulkOperation(
      tenant.userId,
      tenant.role,
      'applicant',
      'bulk_update',
      result.count,
      tenant.tenantId!
    );

    return NextResponse.json({
      success: true,
      affected: result.count,
    });
  }
);

// ============================================
// EXAMPLE 6: Super Admin Route
// ============================================

/**
 * GET /api/superadmin/tenants/[id]/jobs - View tenant's jobs
 *
 * Super Admin can view any tenant's data
 */
export const GET_TenantJobs = superAdminRoute(
  async (request, { auth, tenant, params }) => {
    const targetTenantId = params?.id;

    if (!targetTenantId) {
      return NextResponse.json(
        { error: 'Tenant ID required' },
        { status: 400 }
      );
    }

    // Super Admin read access - no cross-tenant flag needed
    const jobs = await prisma.job.findMany({
      where: { tenantId: targetTenantId },
    });

    return NextResponse.json({ jobs });
  }
);

// ============================================
// EXAMPLE 7: Super Admin Write (Cross-Tenant)
// ============================================

/**
 * DELETE /api/superadmin/jobs/[id] - Delete a job
 *
 * Super Admin must explicitly acknowledge cross-tenant access
 */
export const DELETE_Job = superAdminRoute(
  async (request, { auth, tenant, params }) => {
    const jobId = params?.id;
    const reason = request.headers.get('x-reason');

    if (!reason || reason.length < 10) {
      return NextResponse.json(
        { error: 'Reason required for job deletion (min 10 chars)' },
        { status: 400 }
      );
    }

    // Find the job first to get its tenant
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, tenantId: true },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Use cross-tenant access with explicit reason
    await withCrossTenantAccess(job.tenantId, reason, async () => {
      await prisma.job.delete({
        where: { id: jobId },
      });
    });

    return NextResponse.json({ success: true });
  }
);

// ============================================
// EXAMPLE 8: Conditional Permissions
// ============================================

/**
 * Example of checking multiple permissions conditionally
 */
export const GET_ConditionalAccess = employerRoute(
  {},
  async (request, { auth, tenant }) => {
    // Check what the user can do
    const canCreateJobs = await can('job', 'create', tenant.tenantId!);
    const canExport = await can('applicant', 'export', tenant.tenantId!);
    const canManageTeam = await can('employer_team', 'create', tenant.tenantId!);

    return NextResponse.json({
      permissions: {
        canCreateJobs,
        canExport,
        canManageTeam,
      },
    });
  }
);

// ============================================
// EXAMPLE 9: Manual Permission Check
// ============================================

/**
 * Sometimes you need more granular control
 */
export const POST_ManualCheck = employerRoute(
  {},
  async (request, { auth, tenant }) => {
    const { action } = await request.json();

    // Manual authorization check
    try {
      await authorize({
        resource: 'job',
        action: action,
        tenantId: tenant.tenantId!,
      });

      // Authorized - proceed
      return NextResponse.json({ authorized: true });
    } catch (error) {
      // Not authorized
      return NextResponse.json(
        { authorized: false, error: 'Permission denied' },
        { status: 403 }
      );
    }
  }
);

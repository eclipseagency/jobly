import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'jobly-secret-key-change-in-production';
const TOKEN_EXPIRY_HOURS = 24;

interface SuperAdminTokenPayload {
  adminId: string;
  email: string;
  name: string;
  role: string;
  permissions: Record<string, boolean>;
  exp: number;
  iat: number;
}

/**
 * Generate a secure token for super admin
 */
export function generateSuperAdminToken(payload: Omit<SuperAdminTokenPayload, 'exp' | 'iat'>): string {
  const now = Date.now();
  const fullPayload: SuperAdminTokenPayload = {
    ...payload,
    exp: now + (TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
    iat: now,
  };

  const payloadStr = JSON.stringify(fullPayload);
  const payloadBase64 = Buffer.from(payloadStr).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET + '-superadmin').update(payloadBase64).digest('base64url');

  return `sa_${payloadBase64}.${signature}`;
}

/**
 * Verify super admin token
 */
export function verifySuperAdminToken(token: string): { valid: boolean; payload?: SuperAdminTokenPayload; error?: string } {
  try {
    if (!token || !token.startsWith('sa_')) {
      return { valid: false, error: 'Invalid token format' };
    }

    const tokenWithoutPrefix = token.substring(3);
    const parts = tokenWithoutPrefix.split('.');
    if (parts.length !== 2) {
      return { valid: false, error: 'Invalid token format' };
    }

    const [payloadBase64, signature] = parts;

    // Verify signature
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET + '-superadmin').update(payloadBase64).digest('base64url');
    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid token signature' };
    }

    // Decode payload
    const payload: SuperAdminTokenPayload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString());

    // Check expiration
    if (payload.exp < Date.now()) {
      return { valid: false, error: 'Token expired' };
    }

    return { valid: true, payload };
  } catch (error) {
    return { valid: false, error: 'Token verification failed' };
  }
}

/**
 * Get super admin from request
 */
export function getSuperAdminFromRequest(request: NextRequest): {
  authenticated: boolean;
  admin?: SuperAdminTokenPayload;
  error?: string;
} {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { authenticated: false, error: 'No authorization header' };
  }

  const token = authHeader.substring(7);
  const { valid, payload, error } = verifySuperAdminToken(token);

  if (valid && payload) {
    return { authenticated: true, admin: payload };
  }

  return { authenticated: false, error };
}

/**
 * Require super admin authentication middleware
 */
export function requireSuperAdmin(request: NextRequest): { admin: SuperAdminTokenPayload } | NextResponse {
  const { authenticated, admin, error } = getSuperAdminFromRequest(request);

  if (!authenticated || !admin) {
    return NextResponse.json(
      { error: error || 'Unauthorized - Super admin access required' },
      { status: 401 }
    );
  }

  return { admin };
}

/**
 * Check if super admin has specific permission
 */
export function hasPermission(admin: SuperAdminTokenPayload, permission: string): boolean {
  if (admin.role === 'super_admin') return true; // Super admins have all permissions
  return admin.permissions?.[permission] === true;
}

/**
 * Initialize default super admin if none exists
 */
export async function initializeSuperAdmin(): Promise<void> {
  const email = process.env.SUPERADMIN_EMAIL || 'admin@jobly.ph';
  const password = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin@123';
  const name = process.env.SUPERADMIN_NAME || 'Super Admin';

  try {
    const existing = await prisma.superAdmin.findUnique({
      where: { email },
    });

    if (!existing) {
      const passwordHash = await bcrypt.hash(password, 12);
      await prisma.superAdmin.create({
        data: {
          email,
          passwordHash,
          name,
          role: 'super_admin',
          permissions: {
            canApproveJobs: true,
            canManageUsers: true,
            canManageEmployers: true,
            canViewAnalytics: true,
            canManageSettings: true,
          },
        },
      });
      console.log('[SuperAdmin] Default super admin created:', email);
    }
  } catch (error) {
    console.error('[SuperAdmin] Failed to initialize:', error);
  }
}

// Default permissions for roles
export const DEFAULT_PERMISSIONS = {
  super_admin: {
    canApproveJobs: true,
    canManageUsers: true,
    canManageEmployers: true,
    canViewAnalytics: true,
    canManageSettings: true,
    canDeleteData: true,
    canSuspendAccounts: true,
  },
  moderator: {
    canApproveJobs: true,
    canManageUsers: false,
    canManageEmployers: false,
    canViewAnalytics: true,
    canManageSettings: false,
    canDeleteData: false,
    canSuspendAccounts: false,
  },
};

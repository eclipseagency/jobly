import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'jobly-secret-key-change-in-production';
const TOKEN_EXPIRY_DAYS = 7;

interface TokenPayload {
  userId: string;
  email: string;
  role: 'EMPLOYEE' | 'EMPLOYER';
  tenantId?: string;
  exp: number;
  iat: number;
}

/**
 * Generate a secure JWT-like token using HMAC
 */
export function generateAuthToken(payload: Omit<TokenPayload, 'exp' | 'iat'>): string {
  const now = Date.now();
  const fullPayload: TokenPayload = {
    ...payload,
    exp: now + (TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    iat: now,
  };

  const payloadStr = JSON.stringify(fullPayload);
  const payloadBase64 = Buffer.from(payloadStr).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payloadBase64).digest('base64url');

  return `${payloadBase64}.${signature}`;
}

/**
 * Verify and decode a token
 */
export function verifyAuthToken(token: string): { valid: boolean; payload?: TokenPayload; error?: string } {
  try {
    if (!token) {
      return { valid: false, error: 'No token provided' };
    }

    const parts = token.split('.');
    if (parts.length !== 2) {
      return { valid: false, error: 'Invalid token format' };
    }

    const [payloadBase64, signature] = parts;

    // Verify signature
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(payloadBase64).digest('base64url');
    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid token signature' };
    }

    // Decode payload
    const payload: TokenPayload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString());

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
 * Extract and verify auth from request
 * Checks Authorization header first, then falls back to x-user-id for backwards compatibility
 */
export function getAuthFromRequest(request: NextRequest): {
  authenticated: boolean;
  userId?: string;
  email?: string;
  role?: 'EMPLOYEE' | 'EMPLOYER';
  tenantId?: string;
  error?: string;
} {
  // Check for Authorization header (preferred)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const { valid, payload, error } = verifyAuthToken(token);

    if (valid && payload) {
      return {
        authenticated: true,
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        tenantId: payload.tenantId,
      };
    }

    return { authenticated: false, error };
  }

  // Fallback to x-user-id header (for backwards compatibility during migration)
  // This should be removed once all clients are updated to use Bearer tokens
  const userId = request.headers.get('x-user-id');
  const tenantId = request.headers.get('x-tenant-id');

  if (userId) {
    // Log warning about deprecated auth method
    console.warn('[Auth] Using deprecated x-user-id header auth. Please migrate to Bearer token.');
    return {
      authenticated: true,
      userId,
      tenantId: tenantId || undefined,
    };
  }

  return { authenticated: false, error: 'No authentication provided' };
}

/**
 * Middleware helper to require authentication
 */
export function requireAuth(request: NextRequest): {
  user: { userId: string; email?: string; role?: string; tenantId?: string }
} | NextResponse {
  const auth = getAuthFromRequest(request);

  if (!auth.authenticated || !auth.userId) {
    return NextResponse.json(
      { error: auth.error || 'Unauthorized' },
      { status: 401 }
    );
  }

  return {
    user: {
      userId: auth.userId,
      email: auth.email,
      role: auth.role,
      tenantId: auth.tenantId,
    },
  };
}

/**
 * Middleware helper to require employer role
 */
export function requireEmployer(request: NextRequest): {
  user: { userId: string; email?: string; tenantId?: string }
} | NextResponse {
  const auth = getAuthFromRequest(request);

  if (!auth.authenticated || !auth.userId) {
    return NextResponse.json(
      { error: auth.error || 'Unauthorized' },
      { status: 401 }
    );
  }

  if (auth.role && auth.role !== 'EMPLOYER') {
    return NextResponse.json(
      { error: 'Employer access required' },
      { status: 403 }
    );
  }

  return {
    user: {
      userId: auth.userId,
      email: auth.email,
      tenantId: auth.tenantId,
    },
  };
}

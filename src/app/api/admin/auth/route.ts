import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Admin credentials from environment variables with fallback for development
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'joblyadmin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Jobly@admin441';
const JWT_SECRET = process.env.JWT_SECRET || 'jobly-secret-key-change-in-production';
const TOKEN_EXPIRY_HOURS = 24;

// Generate a secure token with HMAC signature
function generateSecureToken(username: string): string {
  const payload = {
    username,
    role: 'super_admin',
    exp: Date.now() + (TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
    iat: Date.now(),
  };
  const payloadStr = JSON.stringify(payload);
  const payloadBase64 = Buffer.from(payloadStr).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payloadBase64).digest('base64url');
  return `${payloadBase64}.${signature}`;
}

// Verify token and return payload
function verifySecureToken(token: string): { valid: boolean; payload?: { username: string; role: string; exp: number } } {
  try {
    const [payloadBase64, signature] = token.split('.');
    if (!payloadBase64 || !signature) return { valid: false };

    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(payloadBase64).digest('base64url');
    if (signature !== expectedSignature) return { valid: false };

    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString());
    if (payload.exp < Date.now()) return { valid: false };

    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}

// POST /api/admin/auth - Admin login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Verify credentials
    if (username !== ADMIN_USERNAME) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if password is stored as hash or plain text (for migration)
    let isValidPassword = false;
    if (ADMIN_PASSWORD.startsWith('$2')) {
      // Password is already hashed
      isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD);
    } else {
      // Password is plain text (development only)
      isValidPassword = password === ADMIN_PASSWORD;
    }

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate a secure token with HMAC signature
    const adminToken = generateSecureToken(ADMIN_USERNAME);

    return NextResponse.json({
      success: true,
      token: adminToken,
      admin: {
        username: ADMIN_USERNAME,
        role: 'super_admin',
      },
    });
  } catch (error) {
    console.error('[Admin Auth] Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// GET /api/admin/auth - Verify admin token
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { valid, payload } = verifySecureToken(token);

    if (!valid || !payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      valid: true,
      admin: {
        username: payload.username,
        role: payload.role,
      },
    });
  } catch (error) {
    console.error('[Admin Auth] Verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}

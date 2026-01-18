import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'jobly-secret-key-change-in-production';

interface ResetTokenPayload {
  email: string;
  exp: number;
  iat: number;
  type: string;
}

// Verify reset token
function verifyResetToken(token: string): { valid: boolean; email?: string; error?: string } {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) {
      return { valid: false, error: 'Invalid token format' };
    }

    const [payloadBase64, signature] = parts;

    // Verify signature
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(payloadBase64).digest('base64url');
    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid token' };
    }

    // Decode payload
    const payload: ResetTokenPayload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString());

    // Check token type
    if (payload.type !== 'password_reset') {
      return { valid: false, error: 'Invalid token type' };
    }

    // Check expiration
    if (payload.exp < Date.now()) {
      return { valid: false, error: 'Token has expired' };
    }

    return { valid: true, email: payload.email };
  } catch (error) {
    return { valid: false, error: 'Token verification failed' };
  }
}

// POST /api/auth/reset-password - Reset user password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one uppercase letter' },
        { status: 400 }
      );
    }

    if (!/[a-z]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one lowercase letter' },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one number' },
        { status: 400 }
      );
    }

    // Verify the reset token
    const { valid, email, error } = verifyResetToken(token);

    if (!valid || !email) {
      return NextResponse.json(
        { error: error || 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('[Auth] Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}

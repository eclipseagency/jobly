import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'jobly-secret-key-change-in-production';
const RESET_TOKEN_EXPIRY_HOURS = 1;

// Generate a password reset token
function generateResetToken(email: string): string {
  const payload = {
    email: email.toLowerCase(),
    exp: Date.now() + (RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000),
    iat: Date.now(),
    type: 'password_reset',
  };

  const payloadStr = JSON.stringify(payload);
  const payloadBase64 = Buffer.from(payloadStr).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payloadBase64).digest('base64url');

  return `${payloadBase64}.${signature}`;
}

// POST /api/auth/forgot-password - Request password reset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true },
    });

    // Always return success to prevent email enumeration
    // But only generate token if user exists
    if (user) {
      const resetToken = generateResetToken(user.email);
      const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://jobly.ph'}/auth/reset-password?token=${resetToken}`;

      // TODO: Send email with reset link
      // For now, log the reset URL (remove in production)
      console.log(`[Password Reset] Reset URL for ${user.email}: ${resetUrl}`);

      // In production, integrate with email service:
      // await sendEmail({
      //   to: user.email,
      //   subject: 'Reset your Jobly password',
      //   html: `
      //     <h1>Password Reset Request</h1>
      //     <p>Hi ${user.name || 'there'},</p>
      //     <p>You requested to reset your password. Click the link below to proceed:</p>
      //     <a href="${resetUrl}">Reset Password</a>
      //     <p>This link expires in ${RESET_TOKEN_EXPIRY_HOURS} hour(s).</p>
      //     <p>If you didn't request this, please ignore this email.</p>
      //   `,
      // });
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
    });
  } catch (error) {
    console.error('[Auth] Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

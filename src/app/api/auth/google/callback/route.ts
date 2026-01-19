import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import {
  exchangeCodeForTokens,
  getUserInfo,
  verifyState,
} from '@/lib/auth/oauth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// GET /api/auth/google/callback - Handle Google OAuth callback
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/auth/error?message=${error}`, request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/auth/error?message=missing_params', request.url)
      );
    }

    // Get stored values from cookies
    const cookieStore = cookies();
    const storedState = cookieStore.get('oauth_state')?.value;
    const returnUrl = cookieStore.get('oauth_return_url')?.value || '/dashboard';
    const userType = cookieStore.get('oauth_user_type')?.value || 'employee';

    // Verify state
    if (!storedState || !verifyState(storedState, state)) {
      return NextResponse.redirect(
        new URL('/auth/error?message=invalid_state', request.url)
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens('google', code);

    // Get user info
    const userInfo = await getUserInfo('google', tokens.accessToken);

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: userInfo.email },
    });

    if (!user) {
      // Create new user
      const randomPassword = Math.random().toString(36).substring(2, 15);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          name: userInfo.name,
          password: hashedPassword,
          role: userType === 'employer' ? 'employer' : 'employee',
          avatar: userInfo.avatar,
          emailVerified: true, // OAuth emails are verified
        },
      });
    }

    // Create or update OAuth account
    const existingOAuth = await prisma.oAuthAccount.findFirst({
      where: {
        provider: 'google',
        providerAccountId: userInfo.id,
      },
    });

    if (existingOAuth) {
      await prisma.oAuthAccount.update({
        where: { id: existingOAuth.id },
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          accessTokenExpires: tokens.expiresIn
            ? new Date(Date.now() + tokens.expiresIn * 1000)
            : null,
        },
      });
    } else {
      await prisma.oAuthAccount.create({
        data: {
          userId: user.id,
          provider: 'google',
          providerAccountId: userInfo.id,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          accessTokenExpires: tokens.expiresIn
            ? new Date(Date.now() + tokens.expiresIn * 1000)
            : null,
        },
      });
    }

    // Clear OAuth cookies
    cookieStore.delete('oauth_state');
    cookieStore.delete('oauth_return_url');
    cookieStore.delete('oauth_user_type');

    // Set session cookie (simplified - in production use proper session management)
    const response = NextResponse.redirect(new URL(returnUrl, request.url));

    // Create a simple session token
    const sessionData = JSON.stringify({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    });

    response.cookies.set('auth_session', Buffer.from(sessionData).toString('base64'), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('[Google OAuth Callback] Error:', error);
    return NextResponse.redirect(
      new URL('/auth/error?message=oauth_failed', request.url)
    );
  }
}

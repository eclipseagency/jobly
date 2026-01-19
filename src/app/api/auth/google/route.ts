import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthorizationUrl, generateState } from '@/lib/auth/oauth';

export const dynamic = 'force-dynamic';

// GET /api/auth/google - Initiate Google OAuth flow
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const returnUrl = searchParams.get('returnUrl') || '/dashboard';
    const userType = searchParams.get('type') || 'employee'; // employee or employer

    // Generate and store state
    const state = generateState();

    // Store state and metadata in cookie
    const cookieStore = cookies();
    cookieStore.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });
    cookieStore.set('oauth_return_url', returnUrl, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
    });
    cookieStore.set('oauth_user_type', userType, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
    });

    // Generate authorization URL
    const authUrl = getAuthorizationUrl('google', state);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('[Google OAuth] Error:', error);
    return NextResponse.redirect(
      new URL('/auth/error?message=oauth_init_failed', request.url)
    );
  }
}

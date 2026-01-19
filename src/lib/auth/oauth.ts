/**
 * OAuth Utilities for Social Login
 *
 * Supports:
 * - Google OAuth 2.0
 * - LinkedIn OAuth 2.0
 */

// OAuth Configuration (these should be set in environment variables)
export const OAUTH_CONFIG = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scopes: ['email', 'profile'],
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID || '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
    redirectUri: process.env.LINKEDIN_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`,
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    userInfoUrl: 'https://api.linkedin.com/v2/userinfo',
    scopes: ['openid', 'profile', 'email'],
  },
};

export type OAuthProvider = 'google' | 'linkedin';

export interface OAuthUserInfo {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  provider: OAuthProvider;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

/**
 * Generate OAuth authorization URL
 */
export function getAuthorizationUrl(provider: OAuthProvider, state: string): string {
  const config = OAUTH_CONFIG[provider];

  const baseParams: Record<string, string> = {
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    state,
  };

  if (provider === 'google') {
    baseParams.access_type = 'offline';
    baseParams.prompt = 'consent';
  }

  const params = new URLSearchParams(baseParams);

  return `${config.authUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  provider: OAuthProvider,
  code: string
): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}> {
  const config = OAUTH_CONFIG[provider];

  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code',
  });

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

/**
 * Get user info from OAuth provider
 */
export async function getUserInfo(
  provider: OAuthProvider,
  accessToken: string
): Promise<OAuthUserInfo> {
  const config = OAUTH_CONFIG[provider];

  const response = await fetch(config.userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get user info');
  }

  const data = await response.json();

  if (provider === 'google') {
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      firstName: data.given_name,
      lastName: data.family_name,
      avatar: data.picture,
      provider,
      accessToken,
    };
  }

  if (provider === 'linkedin') {
    return {
      id: data.sub,
      email: data.email,
      name: data.name,
      firstName: data.given_name,
      lastName: data.family_name,
      avatar: data.picture,
      provider,
      accessToken,
    };
  }

  throw new Error(`Unknown provider: ${provider}`);
}

/**
 * Generate a random state string for OAuth
 */
export function generateState(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}

/**
 * Verify OAuth state to prevent CSRF attacks
 */
export function verifyState(expectedState: string, receivedState: string): boolean {
  return expectedState === receivedState;
}

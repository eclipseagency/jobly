import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Marketing domains that should show the landing page
const MARKETING_DOMAINS = [
  'eclipsecloud.io',
  'www.eclipsecloud.io',
  // Add localhost for development
  'localhost',
];

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // Extract the domain without port (for localhost:3000)
  const domain = hostname.split(':')[0];

  // Check if this is a marketing domain
  const isMarketingDomain = MARKETING_DOMAINS.some(
    (marketingDomain) => domain === marketingDomain || domain.endsWith(`.${marketingDomain}`)
  );

  // If it's NOT a marketing domain and the path is exactly "/", redirect to /login
  if (!isMarketingDomain && pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    return NextResponse.redirect(url);
  }

  // For all other cases, continue normally
  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     * - API routes (they handle their own logic)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|api/).*)',
  ],
};

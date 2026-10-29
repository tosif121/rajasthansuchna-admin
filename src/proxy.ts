import { NextRequest, NextResponse } from 'next/server';

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionCookie = req.cookies.get('rs_admin_session')?.value;
  const authHeader = req.headers.get('authorization') || '';

  // Valid session token check (must be prefixed and non-empty)
  const hasValidCookieSession = Boolean(sessionCookie && sessionCookie.startsWith('admin_session_'));
  const hasValidAuthHeader = Boolean(authHeader.startsWith('Bearer ') && authHeader.slice(7).trim().startsWith('admin_token_'));
  const isAuthenticated = hasValidCookieSession || hasValidAuthHeader;

  // If visiting login page while already authenticated, redirect to dashboard
  if (pathname === '/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // Allow admin auth login endpoint without pre-existing session
  if (pathname === '/api/v1/admin/auth/login') {
    return NextResponse.next();
  }

  // Protect Admin API endpoints
  if (pathname.startsWith('/api/v1/admin')) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required.' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Protect Admin Pages
  const protectedPaths = [
    '/',
    '/dashboard',
    '/notices',
    '/agencies',
    '/categories',
    '/mcq-tests',
    '/audit-logs',
    '/notifications',
    '/settings',
  ];
  const isProtectedPage = protectedPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));

  if (isProtectedPage && !isAuthenticated) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/notices/:path*',
    '/agencies/:path*',
    '/categories/:path*',
    '/mcq-tests/:path*',
    '/notifications/:path*',
    '/audit-logs/:path*',
    '/settings',
    '/settings/:path*',
    '/login',
    '/api/v1/admin/:path*',
  ],
};

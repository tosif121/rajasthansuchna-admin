import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionCookie = req.cookies.get('rs_admin_session');
  const isAuthenticated = Boolean(sessionCookie && sessionCookie.value);

  // If visiting login page while already authenticated, redirect to dashboard
  if (pathname === '/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // Allow admin auth endpoints without session
  if (pathname.startsWith('/api/v1/admin/auth')) {
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

  // Protect Admin Pages: '/', '/dashboard', '/notices', '/agencies', '/audit-logs', '/review-queue'
  const protectedPaths = ['/', '/dashboard', '/notices', '/agencies', '/audit-logs', '/review-queue', '/settings'];
  const isProtectedPage = protectedPaths.some(p => pathname === p || pathname.startsWith(p + '/'));

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
    '/audit-logs/:path*',
    '/review-queue/:path*',
    '/settings',
    '/settings/:path*',
    '/login',
    '/api/v1/admin/:path*'
  ]
};

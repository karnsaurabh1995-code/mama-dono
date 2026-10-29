import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 16 Edge Proxy (Convention replacing middleware.ts)
 * Enforces edge-level perimeter defense on administrative routes.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Dedicated Admin Login Screen is always accessible
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // 2. Protect all administrative dashboard and sub-routes
  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('dokind_session')?.value;

    // Fail closed: cookie must be present and follow signed token format (<payload>.<signature>)
    if (!sessionCookie || !sessionCookie.includes('.')) {
      const returnUrl = encodeURIComponent(`${pathname}${search}`);
      const loginUrl = new URL(`/admin/login?returnUrl=${returnUrl}`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Role } from '@tbms/shared-types';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev-only" });
  const userRole = token?.role as string | undefined;
  const { pathname } = request.nextUrl;

  // 1. Redirect to login if accessing protected route without token
  const protectedRoutes = ['/dashboard', '/orders', '/customers', '/employees', '/payments', '/expenses', '/reports', '/config'];
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route) || pathname === '/');

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Role-based Access Control
  if (token && userRole) {
    // Admin only routes
    const adminOnlyRoutes = ['/config', '/reports', '/employees/new'];
    const isAdminRoute = adminOnlyRoutes.some(route => pathname.startsWith(route));

    if (isAdminRoute && userRole !== Role.ADMIN && userRole !== Role.SUPER_ADMIN) {
       return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Entry Operator restrictions (cannot view reports or full config)
    if (userRole === Role.ENTRY_OPERATOR) {
       if (pathname.startsWith('/reports') || pathname.startsWith('/config')) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
       }
    }

    // Employee Portal restrictions (only /my-orders and /status)
    if (userRole === Role.EMPLOYEE) {
       const allowedForEmployees = ['/my-orders', '/profile', '/unauthorized'];
       const isAllowed = allowedForEmployees.some(route => pathname.startsWith(route));
       if (!isAllowed && pathname !== '/') {
          return NextResponse.redirect(new URL('/my-orders', request.url));
       }
    }
    
    // Redirect / to appropriate dashboard based on role
    if (pathname === '/') {
        if (userRole === Role.EMPLOYEE) {
           return NextResponse.redirect(new URL('/my-orders', request.url));
        }
        if (userRole === Role.ENTRY_OPERATOR) {
           return NextResponse.redirect(new URL('/orders', request.url));
        }
        // Admin, Super Admin, and Viewer can access the main dashboard at /
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - status (public shareable status page)
     * - login (login page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|status|login).*)',
  ],
};

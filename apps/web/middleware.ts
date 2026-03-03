import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Role } from '@tbms/shared-types';
import {
  ADMIN_ROLES,
  ADMIN_ONLY_PREFIXES,
  APP_PROTECTED_PREFIXES,
  DEFAULT_HOME_BY_ROLE,
  EMPLOYEE_ALLOWED_PREFIXES,
  ENTRY_OPERATOR_BLOCKED_PREFIXES,
} from '@tbms/shared-constants';
import { getNextAuthSecret } from '@/lib/env';

function isKnownRole(value: unknown): value is Role {
  return typeof value === 'string' && (Object.values(Role) as string[]).includes(value);
}

function isAdminRole(role: Role): role is (typeof ADMIN_ROLES)[number] {
  return role === Role.ADMIN || role === Role.SUPER_ADMIN;
}

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: getNextAuthSecret() });
  const userRole = isKnownRole(token?.role) ? token.role : undefined;
  const { pathname } = request.nextUrl;

  // 1. Redirect to login if accessing protected route without token
  const isProtected = APP_PROTECTED_PREFIXES.some((route) =>
    route === '/' ? pathname === '/' : pathname.startsWith(route),
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Role-based Access Control
  if (token && userRole) {
    // Admin only routes
    const isAdminRoute = ADMIN_ONLY_PREFIXES.some((route) =>
      pathname.startsWith(route),
    );

    if (isAdminRoute && !isAdminRole(userRole)) {
       return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Entry Operator restrictions
    if (userRole === Role.ENTRY_OPERATOR) {
       if (ENTRY_OPERATOR_BLOCKED_PREFIXES.some((route) => pathname.startsWith(route))) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
       }
    }

    // Employee Portal restrictions (only /my-orders and /status)
    if (userRole === Role.EMPLOYEE) {
       const isAllowed = EMPLOYEE_ALLOWED_PREFIXES.some(route => pathname.startsWith(route));
       if (!isAllowed && pathname !== '/') {
          return NextResponse.redirect(new URL('/my-orders', request.url));
       }
    }
    
    // Redirect / to appropriate dashboard based on role
    if (pathname === '/') {
        const homePath = DEFAULT_HOME_BY_ROLE[userRole];
        if (homePath && homePath !== '/') {
           return NextResponse.redirect(new URL(homePath, request.url));
        }
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

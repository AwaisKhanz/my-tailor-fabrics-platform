import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import {
  canRoleAccessPathname,
  DEFAULT_HOME_BY_ROLE,
  isRole,
  resolveRoutePermissionPolicy,
} from '@tbms/shared-constants';
import { getNextAuthSecret } from '@/lib/env';
import {
  buildExpiredLoginRoute,
  HOME_ROUTE,
  LOGIN_ROUTE,
  UNAUTHORIZED_ROUTE,
} from '@/lib/auth-routes';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: getNextAuthSecret() });
  const userRole = isRole(token?.role) ? token.role : undefined;
  const { pathname } = request.nextUrl;
  const routePolicy = resolveRoutePermissionPolicy(pathname);
  const authError =
    token && typeof token.error === 'string' && token.error.length > 0
      ? token.error
      : null;
  const hasAccessToken =
    token &&
    typeof token.accessToken === 'string' &&
    token.accessToken.length > 0;

  if (routePolicy && !token) {
    return NextResponse.redirect(new URL(LOGIN_ROUTE, request.url));
  }

  if (routePolicy && token && (authError || !hasAccessToken)) {
    return NextResponse.redirect(new URL(buildExpiredLoginRoute(), request.url));
  }

  if (token && userRole) {
    if (pathname === HOME_ROUTE) {
      const homePath = DEFAULT_HOME_BY_ROLE[userRole];
      const canAccessDashboard = canRoleAccessPathname(userRole, HOME_ROUTE);

      if (homePath && homePath !== HOME_ROUTE && !canAccessDashboard) {
        return NextResponse.redirect(new URL(homePath, request.url));
      }
    }

    if (routePolicy && !canRoleAccessPathname(userRole, pathname)) {
      return NextResponse.redirect(new URL(UNAUTHORIZED_ROUTE, request.url));
    }
  }

  if (token && !userRole && routePolicy) {
    return NextResponse.redirect(new URL(UNAUTHORIZED_ROUTE, request.url));
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

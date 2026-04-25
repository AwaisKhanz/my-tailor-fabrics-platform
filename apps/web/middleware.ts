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
  INTERNAL_HOME_ROUTE,
  INTERNAL_LOGIN_ROUTE,
  INTERNAL_UNAUTHORIZED_ROUTE,
  LOGIN_ROUTE,
  UNAUTHORIZED_ROUTE,
} from '@/lib/auth-routes';
import {
  buildMarketingUrl,
  buildPortalUrl,
  hasSplitHostnameConfig,
  isInternalMarketingPath,
  isMarketingHost,
  isMarketingPublicPath,
  isPortalHost,
  stripInternalMarketingPrefix,
  toInternalMarketingPath,
} from '@/lib/host-routing';
import {
  isPortalRoutePath,
  stripPortalRoutePrefix,
  toPortalRoute,
  usesPortalPathPrefix,
} from '@/lib/portal-routing';

function withPortalNoIndex(response: NextResponse) {
  response.headers.set('x-robots-tag', 'noindex, nofollow');
  return response;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get('host');
  const marketingRequest = isMarketingHost(host);
  const portalRequest = isPortalHost(host);
  const hasSplitHosts = hasSplitHostnameConfig();
  const portalPrefixMode = usesPortalPathPrefix();
  const portalPrefixedRequest = portalPrefixMode && isPortalRoutePath(pathname);
  const internalPathname =
    portalPrefixedRequest ? stripPortalRoutePrefix(pathname) : pathname;
  const routePolicy = resolveRoutePermissionPolicy(internalPathname);

  if (hasSplitHosts && marketingRequest) {
    if (
      pathname === '/robots.txt' ||
      pathname === '/sitemap.xml' ||
      /\.[a-z0-9]+$/i.test(pathname)
    ) {
      return NextResponse.next();
    }

    if (isInternalMarketingPath(pathname)) {
      return NextResponse.redirect(
        new URL(buildMarketingUrl(stripInternalMarketingPrefix(pathname))),
      );
    }

    if (pathname.startsWith('/status/')) {
      return NextResponse.next();
    }

    if (pathname === LOGIN_ROUTE || pathname === UNAUTHORIZED_ROUTE) {
      return NextResponse.redirect(new URL(buildPortalUrl(pathname)));
    }

    if (pathname === HOME_ROUTE || isMarketingPublicPath(pathname) || !routePolicy) {
      const marketingUrl = request.nextUrl.clone();
      marketingUrl.pathname = toInternalMarketingPath(pathname);
      return NextResponse.rewrite(marketingUrl);
    }

    if (routePolicy) {
      return NextResponse.redirect(new URL(buildPortalUrl(pathname)));
    }
  }

  if (
    hasSplitHosts &&
    portalRequest &&
    internalPathname !== INTERNAL_HOME_ROUTE &&
    (isMarketingPublicPath(pathname) || isInternalMarketingPath(pathname))
  ) {
    return withPortalNoIndex(
      NextResponse.redirect(
        new URL(
          buildMarketingUrl(
            isInternalMarketingPath(pathname)
              ? stripInternalMarketingPrefix(pathname)
              : pathname,
          ),
        ),
      ),
    );
  }

  if (portalPrefixMode) {
    if (
      pathname === '/robots.txt' ||
      pathname === '/sitemap.xml' ||
      /\.[a-z0-9]+$/i.test(pathname)
    ) {
      return NextResponse.next();
    }

    if (isInternalMarketingPath(pathname)) {
      return NextResponse.redirect(
        new URL(buildMarketingUrl(stripInternalMarketingPrefix(pathname)), request.url),
      );
    }

    if (pathname.startsWith('/status/')) {
      return NextResponse.next();
    }

    if (portalPrefixedRequest) {
      // Portal requests continue through auth checks below and rewrite at the end.
    } else if (
      pathname === INTERNAL_HOME_ROUTE ||
      isMarketingPublicPath(pathname) ||
      (!routePolicy &&
        pathname !== INTERNAL_LOGIN_ROUTE &&
        pathname !== INTERNAL_UNAUTHORIZED_ROUTE)
    ) {
      const marketingUrl = request.nextUrl.clone();
      marketingUrl.pathname = toInternalMarketingPath(pathname);
      return NextResponse.rewrite(marketingUrl);
    } else if (
      pathname === INTERNAL_LOGIN_ROUTE ||
      pathname === INTERNAL_UNAUTHORIZED_ROUTE ||
      routePolicy
    ) {
      return NextResponse.redirect(new URL(toPortalRoute(pathname), request.url));
    }
  }

  const token = await getToken({ req: request, secret: getNextAuthSecret() });
  const userRole = isRole(token?.role) ? token.role : undefined;
  const authError =
    token && typeof token.error === 'string' && token.error.length > 0
      ? token.error
      : null;
  const hasAccessToken =
    token &&
    typeof token.accessToken === 'string' &&
    token.accessToken.length > 0;

  if (routePolicy && !token) {
    return withPortalNoIndex(
      NextResponse.redirect(new URL(LOGIN_ROUTE, request.url)),
    );
  }

  if (routePolicy && token && (authError || !hasAccessToken)) {
    return withPortalNoIndex(
      NextResponse.redirect(new URL(buildExpiredLoginRoute(), request.url)),
    );
  }

  if (token && userRole) {
    if (internalPathname === INTERNAL_HOME_ROUTE) {
      const homePath = DEFAULT_HOME_BY_ROLE[userRole];
      const canAccessDashboard = canRoleAccessPathname(
        userRole,
        INTERNAL_HOME_ROUTE,
      );

      if (homePath && homePath !== INTERNAL_HOME_ROUTE && !canAccessDashboard) {
        return withPortalNoIndex(
          NextResponse.redirect(new URL(toPortalRoute(homePath), request.url)),
        );
      }
    }

    if (routePolicy && !canRoleAccessPathname(userRole, internalPathname)) {
      return withPortalNoIndex(
        NextResponse.redirect(new URL(UNAUTHORIZED_ROUTE, request.url)),
      );
    }
  }

  if (token && !userRole && routePolicy) {
    return withPortalNoIndex(
      NextResponse.redirect(new URL(UNAUTHORIZED_ROUTE, request.url)),
    );
  }

  if (portalPrefixedRequest) {
    const portalUrl = request.nextUrl.clone();
    portalUrl.pathname = internalPathname;
    return withPortalNoIndex(NextResponse.rewrite(portalUrl));
  }

  return portalRequest || !hasSplitHosts
    ? withPortalNoIndex(NextResponse.next())
    : NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|healthz).*)',
  ],
};

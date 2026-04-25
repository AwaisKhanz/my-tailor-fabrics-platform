import { getMarketingSiteUrl, getPortalBaseUrl } from '@/lib/env';

const LOCAL_PORTAL_PREFIX = '/portal';

function getHostname(url: string): string {
  return new URL(url).hostname.toLowerCase();
}

export function usesPortalPathPrefix(): boolean {
  return getHostname(getPortalBaseUrl()) === getHostname(getMarketingSiteUrl());
}

export function getPortalRoutePrefix(): string {
  return usesPortalPathPrefix() ? LOCAL_PORTAL_PREFIX : '';
}

export function toPortalRoute(pathname: string): string {
  const prefix = getPortalRoutePrefix();

  if (!prefix) {
    return pathname;
  }

  return pathname === '/' ? prefix : `${prefix}${pathname}`;
}

export function isPortalRoutePath(pathname: string): boolean {
  const prefix = getPortalRoutePrefix();

  if (!prefix) {
    return false;
  }

  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function stripPortalRoutePrefix(pathname: string): string {
  const prefix = getPortalRoutePrefix();

  if (!prefix || !isPortalRoutePath(pathname)) {
    return pathname;
  }

  const stripped = pathname.slice(prefix.length);
  return stripped.length > 0 ? stripped : '/';
}

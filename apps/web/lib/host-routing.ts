import { getMarketingHostname, getMarketingSiteUrl, getPortalBaseUrl, getPortalHostname } from '@/lib/env';

const MARKETING_PATHS = new Set(['/']);
const INTERNAL_MARKETING_PREFIX = '/site';

export function hasSplitHostnameConfig(): boolean {
  return getMarketingHostname() !== getPortalHostname();
}

export function normalizeRequestHost(host: string | null): string {
  if (!host) {
    return '';
  }

  return host.split(':')[0]?.trim().toLowerCase() ?? '';
}

export function isMarketingHost(host: string | null): boolean {
  const normalizedHost = normalizeRequestHost(host);
  const marketingHost = getMarketingHostname();

  if (!hasSplitHostnameConfig() || !normalizedHost || !marketingHost) {
    return false;
  }

  if (normalizedHost === marketingHost) {
    return true;
  }

  return normalizedHost === `www.${marketingHost.replace(/^www\./, '')}`;
}

export function isPortalHost(host: string | null): boolean {
  const normalizedHost = normalizeRequestHost(host);
  return Boolean(normalizedHost) && normalizedHost === getPortalHostname();
}

export function isInternalMarketingPath(pathname: string): boolean {
  return pathname === INTERNAL_MARKETING_PREFIX || pathname.startsWith(`${INTERNAL_MARKETING_PREFIX}/`);
}

export function isMarketingPublicPath(pathname: string): boolean {
  return MARKETING_PATHS.has(pathname);
}

export function toInternalMarketingPath(pathname: string): string {
  return pathname === '/' ? INTERNAL_MARKETING_PREFIX : `${INTERNAL_MARKETING_PREFIX}${pathname}`;
}

export function stripInternalMarketingPrefix(pathname: string): string {
  if (!isInternalMarketingPath(pathname)) {
    return pathname;
  }

  const stripped = pathname.slice(INTERNAL_MARKETING_PREFIX.length);
  return stripped.length > 0 ? stripped : '/';
}

export function buildPortalUrl(pathname: string): string {
  return `${getPortalBaseUrl()}${pathname}`;
}

export function buildMarketingUrl(pathname: string): string {
  return `${getMarketingSiteUrl()}${pathname}`;
}

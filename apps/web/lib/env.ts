const isProduction = process.env.NODE_ENV === 'production';
const DEFAULT_PORTAL_DEV_URL = 'http://localhost:3000/portal';

function resolveEnv(name: string, value: string | undefined, devFallback: string): string {
  if (value && value.trim().length > 0) {
    return value;
  }

  if (isProduction) {
    throw new Error(`${name} is required in production`);
  }

  return devFallback;
}

function normalizeUrl(rawUrl: string): string {
  return rawUrl.replace(/\/$/, '');
}

export function isWebProductionEnvironment(): boolean {
  return isProduction;
}

export function getWebApiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_URL;
  if (value && value.trim().length > 0) {
    return value;
  }

  // Keep frontend builds resilient when env injection is missing locally.
  // Server-only routes still enforce strict production env checks.
  return 'http://localhost:8000';
}

export function getServerApiBaseUrl(): string {
  const internalApiUrl = process.env.INTERNAL_API_URL;
  if (internalApiUrl && internalApiUrl.trim().length > 0) {
    return internalApiUrl;
  }

  return resolveEnv(
    'INTERNAL_API_URL or NEXT_PUBLIC_API_URL',
    process.env.NEXT_PUBLIC_API_URL,
    'http://localhost:8000',
  );
}

export function getNextAuthSecret(): string {
  return resolveEnv(
    'NEXTAUTH_SECRET',
    process.env.NEXTAUTH_SECRET,
    'dev-only-nextauth-secret-change-me',
  );
}

export function getPortalBaseUrl(): string {
  return normalizeUrl(
    resolveEnv(
      'NEXT_PUBLIC_PORTAL_BASE_URL or PORTAL_BASE_URL or NEXTAUTH_URL',
      process.env.NEXT_PUBLIC_PORTAL_BASE_URL ??
        process.env.PORTAL_BASE_URL ??
        process.env.NEXTAUTH_URL,
      DEFAULT_PORTAL_DEV_URL,
    ),
  );
}

export function getNextAuthUrl(): string {
  return normalizeUrl(
    resolveEnv(
      'NEXTAUTH_URL',
      process.env.NEXTAUTH_URL,
      'http://localhost:3000',
    ),
  );
}

export function getPublicPortalBaseUrl(): string {
  return normalizeUrl(
    resolveEnv(
      'NEXT_PUBLIC_PORTAL_BASE_URL or PORTAL_BASE_URL or NEXTAUTH_URL',
      process.env.NEXT_PUBLIC_PORTAL_BASE_URL ??
        process.env.PORTAL_BASE_URL ??
        process.env.NEXTAUTH_URL,
      DEFAULT_PORTAL_DEV_URL,
    ),
  );
}

export function getMarketingSiteUrl(): string {
  return getNextAuthUrl();
}

export function getPublicMarketingSiteUrl(): string {
  return getNextAuthUrl();
}

export function getPublicMarketingWhatsappUrl(): string | undefined {
  const value = process.env.NEXT_PUBLIC_MARKETING_WHATSAPP_URL;
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function getHostnameFromUrl(url: string): string {
  return new URL(url).hostname.toLowerCase();
}

export function getPortalHostname(): string {
  return getHostnameFromUrl(getPortalBaseUrl());
}

export function getMarketingHostname(): string {
  return getHostnameFromUrl(getMarketingSiteUrl());
}

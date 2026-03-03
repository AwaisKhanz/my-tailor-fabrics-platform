const isProduction = process.env.NODE_ENV === 'production';

function resolveEnv(name: string, value: string | undefined, devFallback: string): string {
  if (value && value.trim().length > 0) {
    return value;
  }

  if (isProduction) {
    throw new Error(`${name} is required in production`);
  }

  return devFallback;
}

export function getJwtSecret(): string {
  return resolveEnv('JWT_SECRET', process.env.JWT_SECRET, 'dev-only-jwt-secret-change-me');
}

export function getJwtRefreshSecret(): string {
  return resolveEnv(
    'JWT_REFRESH_SECRET',
    process.env.JWT_REFRESH_SECRET,
    'dev-only-jwt-refresh-secret-change-me',
  );
}

export function getJwtExpiresIn(): number | StringValue {
  const value = process.env.JWT_EXPIRES_IN;
  if (!value || value.trim().length === 0) {
    return '7d';
  }
  return value as StringValue;
}

export function getFrontendUrl(): string {
  return resolveEnv('FRONTEND_URL', process.env.FRONTEND_URL, 'http://localhost:3000');
}

export function isPublicMailEndpointsEnabled(): boolean {
  if (!isProduction) {
    return true;
  }
  return process.env.ENABLE_PUBLIC_MAIL_ENDPOINTS === 'true';
}
import type { StringValue } from 'ms';

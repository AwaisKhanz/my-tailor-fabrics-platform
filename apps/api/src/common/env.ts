import ms, { type StringValue } from 'ms';

const isProduction = process.env.NODE_ENV === 'production';
type TrustProxyConfig = boolean | number | string | string[];
const DEFAULT_GOOGLE_REDIRECT_URI =
  'https://developers.google.com/oauthplayground';
const DURATION_ENV_PATTERN =
  /^-?(?:\d+|\d*\.\d+)(?:\s*(?:years?|yrs?|yr|y|weeks?|week|w|days?|day|d|hours?|hour|hrs?|hr|h|minutes?|minute|mins?|min|m|seconds?|second|secs?|sec|s|milliseconds?|millisecond|msecs?|msec|ms))?$/i;

export type GoogleMailEnvironment = {
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
  senderEmail?: string;
  redirectUri: string;
};

function resolveEnv(
  name: string,
  value: string | undefined,
  devFallback: string,
): string {
  if (value && value.trim().length > 0) {
    return value;
  }

  if (isProduction) {
    throw new Error(`${name} is required in production`);
  }

  return devFallback;
}

function resolveDurationEnv(
  name: string,
  value: string | undefined,
  devFallback: StringValue,
): StringValue {
  const trimmedValue = resolveOptionalEnv(value);
  if (trimmedValue) {
    if (!isDurationStringValue(trimmedValue)) {
      throw new Error(`${name} must be a valid duration string`);
    }
    return trimmedValue;
  }

  if (isProduction) {
    throw new Error(`${name} is required in production`);
  }

  return devFallback;
}

function resolveOptionalEnv(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function isDurationStringValue(value: string): value is StringValue {
  return DURATION_ENV_PATTERN.test(value);
}

export function isProductionEnvironment(): boolean {
  return isProduction;
}

export function getJwtSecret(): string {
  return resolveEnv(
    'JWT_SECRET',
    process.env.JWT_SECRET,
    'dev-only-jwt-secret-change-me',
  );
}

export function getJwtRefreshSecret(): string {
  return resolveEnv(
    'JWT_REFRESH_SECRET',
    process.env.JWT_REFRESH_SECRET,
    'dev-only-jwt-refresh-secret-change-me',
  );
}

export function getJwtExpiresIn(): number | StringValue {
  return resolveDurationEnv(
    'JWT_EXPIRES_IN',
    process.env.JWT_EXPIRES_IN,
    '15m',
  );
}

export function getJwtRefreshExpiresIn(): number | StringValue {
  return resolveDurationEnv(
    'JWT_REFRESH_EXPIRES_IN',
    process.env.JWT_REFRESH_EXPIRES_IN,
    '7d',
  );
}

export function getJwtRefreshCookieMaxAgeMs(): number {
  const expiresIn = getJwtRefreshExpiresIn();
  if (typeof expiresIn === 'number') {
    return expiresIn * 1000;
  }

  const parsed = ms(expiresIn);
  if (typeof parsed !== 'number' || parsed <= 0) {
    throw new Error(
      'JWT_REFRESH_EXPIRES_IN must resolve to a positive duration',
    );
  }

  return parsed;
}

export function getJwtRefreshRotationGraceMs(): number {
  const rawValue = process.env.JWT_REFRESH_ROTATION_GRACE_SECONDS?.trim();
  if (!rawValue) {
    return 30_000;
  }

  const parsedSeconds = Number.parseInt(rawValue, 10);
  if (
    Number.isNaN(parsedSeconds) ||
    parsedSeconds < 5 ||
    parsedSeconds > 300 ||
    String(parsedSeconds) !== rawValue
  ) {
    throw new Error(
      'JWT_REFRESH_ROTATION_GRACE_SECONDS must be an integer between 5 and 300',
    );
  }

  return parsedSeconds * 1000;
}

export function getFrontendUrl(): string {
  return resolveEnv(
    'FRONTEND_URL',
    process.env.FRONTEND_URL,
    'http://localhost:3000',
  );
}

export function isPublicMailEndpointsEnabled(): boolean {
  if (!isProduction) {
    return true;
  }
  return process.env.ENABLE_PUBLIC_MAIL_ENDPOINTS === 'true';
}

export function getStatusPinPepper(): string {
  return resolveEnv(
    'STATUS_PIN_PEPPER',
    process.env.STATUS_PIN_PEPPER,
    'dev-only-status-pin-pepper-change-me',
  );
}

export function getTrustProxyConfig(): TrustProxyConfig {
  const rawValue = process.env.TRUST_PROXY;
  const value = rawValue?.trim();

  if (!value) {
    if (isProduction) {
      throw new Error('TRUST_PROXY is required in production');
    }
    return false;
  }

  const normalized = value.toLowerCase();
  if (
    normalized === 'false' ||
    normalized === '0' ||
    normalized === 'off' ||
    normalized === 'no'
  ) {
    return false;
  }

  if (
    normalized === 'true' ||
    normalized === '1' ||
    normalized === 'on' ||
    normalized === 'yes'
  ) {
    return true;
  }

  if (/^\d+$/.test(value)) {
    const hops = Number.parseInt(value, 10);
    if (hops < 0) {
      throw new Error('TRUST_PROXY numeric value must be >= 0');
    }
    return hops;
  }

  if (value.includes(',')) {
    const entries = value
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);

    if (entries.length === 0) {
      throw new Error('TRUST_PROXY list must contain at least one entry');
    }

    return entries;
  }

  return value;
}

export function getServerPort(): number {
  const rawPort = resolveOptionalEnv(process.env.PORT);
  if (!rawPort) {
    return 5000;
  }

  const parsedPort = Number.parseInt(rawPort, 10);
  if (
    Number.isNaN(parsedPort) ||
    parsedPort <= 0 ||
    parsedPort > 65535 ||
    String(parsedPort) !== rawPort
  ) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  return parsedPort;
}

export function getRedisUrl(): string | undefined {
  return resolveOptionalEnv(process.env.REDIS_URL);
}

export function isInternalSchedulerEnabled(): boolean {
  const rawValue = resolveOptionalEnv(process.env.ENABLE_INTERNAL_SCHEDULER);

  if (!rawValue) {
    return true;
  }

  const normalized = rawValue.toLowerCase();
  if (
    normalized === 'true' ||
    normalized === '1' ||
    normalized === 'on' ||
    normalized === 'yes'
  ) {
    return true;
  }

  if (
    normalized === 'false' ||
    normalized === '0' ||
    normalized === 'off' ||
    normalized === 'no'
  ) {
    return false;
  }

  throw new Error(
    'ENABLE_INTERNAL_SCHEDULER must be a boolean-like value (true/false)',
  );
}

export function getGoogleMailEnvironment(): GoogleMailEnvironment {
  return {
    clientId: resolveOptionalEnv(process.env.GOOGLE_CLIENT_ID),
    clientSecret: resolveOptionalEnv(process.env.GOOGLE_CLIENT_SECRET),
    refreshToken: resolveOptionalEnv(process.env.GOOGLE_REFRESH_TOKEN),
    senderEmail: resolveOptionalEnv(process.env.GOOGLE_EMAIL),
    redirectUri:
      resolveOptionalEnv(process.env.GOOGLE_REDIRECT_URI) ??
      DEFAULT_GOOGLE_REDIRECT_URI,
  };
}

export function assertSecurityEnvironment(): void {
  void getJwtSecret();
  void getJwtRefreshSecret();
  void getJwtExpiresIn();
  void getJwtRefreshExpiresIn();
  void getJwtRefreshCookieMaxAgeMs();
  void getJwtRefreshRotationGraceMs();
  void getFrontendUrl();
  void getStatusPinPepper();
  void getTrustProxyConfig();
  void getServerPort();
  void isInternalSchedulerEnabled();
}

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

export function getWebApiBaseUrl(): string {
  return resolveEnv(
    'NEXT_PUBLIC_API_URL',
    process.env.NEXT_PUBLIC_API_URL,
    'http://localhost:8000',
  );
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

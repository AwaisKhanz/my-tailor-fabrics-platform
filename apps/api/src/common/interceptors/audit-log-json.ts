import { Prisma } from '@prisma/client';

const SENSITIVE_AUDIT_KEYS = [
  'password',
  'passwordhash',
  'refreshtoken',
  'accesstoken',
  'token',
  'secret',
  'authorization',
  'cookie',
  'apikey',
  'api_key',
] as const;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function redactSensitiveFields(value: unknown, seen: WeakSet<object>): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveFields(item, seen));
  }

  if (!isRecord(value)) {
    return value;
  }

  if (seen.has(value)) {
    return '[Circular]';
  }

  seen.add(value);

  const redacted: Record<string, unknown> = {};
  for (const [key, nestedValue] of Object.entries(value)) {
    const normalizedKey = key.toLowerCase();
    const isSensitive = SENSITIVE_AUDIT_KEYS.some((token) =>
      normalizedKey.includes(token),
    );
    redacted[key] = isSensitive
      ? '[REDACTED]'
      : redactSensitiveFields(nestedValue, seen);
  }

  return redacted;
}

function toPrismaJsonValue(
  value: unknown,
  seen: WeakSet<object>,
): Prisma.InputJsonValue | undefined {
  if (value === null) {
    return undefined;
  }

  if (typeof value === 'string' || typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.reduce<Prisma.InputJsonArray>((acc, item) => {
      const convertedItem = toPrismaJsonValue(item, seen);
      return [...acc, convertedItem ?? null];
    }, []);
  }

  if (!isRecord(value)) {
    return undefined;
  }

  if (seen.has(value)) {
    return '[Circular]';
  }

  seen.add(value);
  return Object.entries(value).reduce<Prisma.InputJsonObject>(
    (acc, [key, nestedValue]) => {
      const convertedValue = toPrismaJsonValue(nestedValue, seen);
      return {
        ...acc,
        [key]: convertedValue ?? null,
      };
    },
    {},
  );
}

export function toAuditJsonValue(
  value: unknown,
): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  if (value === undefined || value === null) {
    return Prisma.JsonNull;
  }

  const sanitized = redactSensitiveFields(value, new WeakSet());
  if (sanitized === undefined || sanitized === null) {
    return Prisma.JsonNull;
  }

  const converted = toPrismaJsonValue(sanitized, new WeakSet());
  return converted ?? Prisma.JsonNull;
}

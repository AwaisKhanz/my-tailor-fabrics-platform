export const ACCESS_TOKEN_REFRESH_BUFFER_MS = 30_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function decodeBase64Url(value: string): string {
  if (typeof atob === "function") {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padLength = (4 - (normalized.length % 4)) % 4;
    const padded = `${normalized}${"=".repeat(padLength)}`;
    return atob(padded);
  }

  return Buffer.from(value, "base64url").toString("utf-8");
}

export function decodeJwtExpiryMs(jwtToken: string): number | null {
  const parts = jwtToken.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    const payload: unknown = JSON.parse(decodeBase64Url(parts[1]));
    if (!isRecord(payload)) {
      return null;
    }

    const expiry = payload.exp;
    return typeof expiry === "number" ? expiry * 1000 : null;
  } catch {
    return null;
  }
}

export function isTokenExpiringSoon(jwtToken: string): boolean {
  const expiry = decodeJwtExpiryMs(jwtToken);
  return !hasRefreshBufferRemaining(expiry);
}

export function hasRefreshBufferRemaining(
  expiryMs: number | null | undefined,
): boolean {
  if (typeof expiryMs !== "number") {
    return false;
  }

  return Date.now() < expiryMs - ACCESS_TOKEN_REFRESH_BUFFER_MS;
}

const ACCESS_TOKEN_REFRESH_BUFFER_MS = 30_000;

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
    const payload = JSON.parse(decodeBase64Url(parts[1])) as {
      exp?: number;
    };
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isTokenExpiringSoon(jwtToken: string): boolean {
  const expiry = decodeJwtExpiryMs(jwtToken);
  if (typeof expiry !== "number") {
    return true;
  }
  return Date.now() >= expiry - ACCESS_TOKEN_REFRESH_BUFFER_MS;
}

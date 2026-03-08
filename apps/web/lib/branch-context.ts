export const ACTIVE_BRANCH_COOKIE_KEY = "tbms_active_branch";

const ACTIVE_BRANCH_COOKIE_TTL_DAYS = 7;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function readActiveBranchCookie(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const encodedName = `${ACTIVE_BRANCH_COOKIE_KEY}=`;
  const cookies = document.cookie.split(";");

  for (const rawCookie of cookies) {
    const cookie = rawCookie.trim();
    if (cookie.startsWith(encodedName)) {
      return decodeURIComponent(cookie.slice(encodedName.length));
    }
  }

  return null;
}

export function writeActiveBranchCookie(branchId: string): void {
  if (typeof document === "undefined") {
    return;
  }

  const expiresAt = new Date(
    Date.now() + ACTIVE_BRANCH_COOKIE_TTL_DAYS * DAY_IN_MS,
  );

  document.cookie = [
    `${ACTIVE_BRANCH_COOKIE_KEY}=${encodeURIComponent(branchId)}`,
    `expires=${expiresAt.toUTCString()}`,
    "path=/",
    "SameSite=Lax",
  ].join("; ");
}

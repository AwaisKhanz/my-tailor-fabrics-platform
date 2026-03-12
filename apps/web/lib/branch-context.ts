export const ACTIVE_BRANCH_COOKIE_KEY = "tbms_active_branch";
const ACTIVE_BRANCH_LOCAL_STORAGE_KEY = "tbms_active_branch";
export const SUPER_ADMIN_BRANCH_CONFIRMED_KEY =
  "tbms_super_admin_branch_confirmed";
const SUPER_ADMIN_BRANCH_CONFIRMED_SCOPE_KEY =
  "tbms_super_admin_branch_confirmed_scope";

const ACTIVE_BRANCH_COOKIE_TTL_DAYS = 7;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function readActiveBranchCookie(): string | null {
  if (typeof window !== "undefined") {
    const localValue = window.localStorage.getItem(
      ACTIVE_BRANCH_LOCAL_STORAGE_KEY,
    );
    if (localValue && localValue.length > 0) {
      return localValue;
    }
  }

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

  if (typeof window !== "undefined") {
    window.localStorage.setItem(ACTIVE_BRANCH_LOCAL_STORAGE_KEY, branchId);
  }
}

export function clearActiveBranchCookie(): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = [
    `${ACTIVE_BRANCH_COOKIE_KEY}=`,
    "expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "path=/",
    "SameSite=Lax",
  ].join("; ");

  if (typeof window !== "undefined") {
    window.localStorage.removeItem(ACTIVE_BRANCH_LOCAL_STORAGE_KEY);
  }
}

export function readSuperAdminBranchSelectionConfirmed(
  scopeToken?: string,
): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const isConfirmed =
    window.localStorage.getItem(SUPER_ADMIN_BRANCH_CONFIRMED_KEY) === "1";
  if (!isConfirmed) {
    return false;
  }

  if (!scopeToken) {
    return true;
  }

  return (
    window.localStorage.getItem(SUPER_ADMIN_BRANCH_CONFIRMED_SCOPE_KEY) ===
    scopeToken
  );
}

export function writeSuperAdminBranchSelectionConfirmed(
  scopeToken?: string,
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SUPER_ADMIN_BRANCH_CONFIRMED_KEY, "1");
  if (scopeToken) {
    window.localStorage.setItem(
      SUPER_ADMIN_BRANCH_CONFIRMED_SCOPE_KEY,
      scopeToken,
    );
  }
}

export function clearSuperAdminBranchSelectionConfirmed(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SUPER_ADMIN_BRANCH_CONFIRMED_KEY);
  window.localStorage.removeItem(SUPER_ADMIN_BRANCH_CONFIRMED_SCOPE_KEY);
}

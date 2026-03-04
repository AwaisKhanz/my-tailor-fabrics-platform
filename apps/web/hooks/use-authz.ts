"use client";

import { useCallback } from "react";
import { useSession } from "next-auth/react";
import { type Permission, type Role } from "@tbms/shared-types";
import {
  resolveSessionRole,
  sessionHasAllPermissions,
  sessionHasAnyPermission,
} from "@/lib/authz";

export interface AuthzAccess {
  role: Role | null;
  canAll: (permissions: readonly Permission[]) => boolean;
  canAny: (permissions: readonly Permission[]) => boolean;
}

export function useAuthz(): AuthzAccess {
  const { data: session } = useSession();
  const role = resolveSessionRole(session);

  const canAll = useCallback(
    (permissions: readonly Permission[]) => {
      return sessionHasAllPermissions(session, permissions);
    },
    [session],
  );

  const canAny = useCallback(
    (permissions: readonly Permission[]) => {
      return sessionHasAnyPermission(session, permissions);
    },
    [session],
  );

  return {
    role,
    canAll,
    canAny,
  };
}

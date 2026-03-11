"use client";

import { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { Permission, Role } from "@tbms/shared-types";
import {
  resolveSessionRole,
  sessionHasAllPermissions,
  sessionHasAnyPermission,
} from "@/lib/authz";

type CanProps = {
  children: ReactNode;
  fallback?: ReactNode;
  roles?: readonly Role[];
  all?: readonly Permission[];
  anyOf?: readonly Permission[];
};

export function Can({
  children,
  fallback = null,
  roles,
  all,
  anyOf,
}: CanProps) {
  const { data: session } = useSession();
  const role = resolveSessionRole(session);

  if (!role) {
    return <>{fallback}</>;
  }

  if (roles && roles.length > 0 && !roles.includes(role)) {
    return <>{fallback}</>;
  }

  if (all && all.length > 0 && !sessionHasAllPermissions(session, all)) {
    return <>{fallback}</>;
  }

  if (anyOf && anyOf.length > 0 && !sessionHasAnyPermission(session, anyOf)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

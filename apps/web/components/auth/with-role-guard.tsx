"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Permission, Role } from "@tbms/shared-types";
import {
  resolveSessionRole,
  sessionHasAllPermissions,
  sessionHasAnyPermission,
} from "@/lib/authz";

type GuardOptions = {
  redirectTo?: string;
  roles?: readonly Role[];
  all?: readonly Permission[];
  any?: readonly Permission[];
};

export function withRoleGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: GuardOptions,
) {
  const {
    redirectTo = "/unauthorized",
    roles,
    all,
    any,
  } = options;

  return function RoleGuardedComponent(props: P) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const role = resolveSessionRole(session);

    const isAllowed =
      !!role &&
      (!roles || roles.length === 0 || roles.includes(role)) &&
      (!all || all.length === 0 || sessionHasAllPermissions(session, all)) &&
      (!any || any.length === 0 || sessionHasAnyPermission(session, any));

    useEffect(() => {
      if (status !== "loading" && !isAllowed) {
        router.replace(redirectTo);
      }
    }, [isAllowed, router, status]);

    if (status === "loading" || !isAllowed) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

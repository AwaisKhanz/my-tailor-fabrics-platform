"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Permission, Role } from "@tbms/shared-types";
import { resolveRoutePermissionPolicy } from "@tbms/shared-constants";
import {
  resolveSessionRole,
  sessionHasAllPermissions,
  sessionHasAnyPermission,
} from "@/lib/authz";
import { UNAUTHORIZED_ROUTE } from "@/lib/auth-routes";

type GuardOptions = {
  redirectTo?: string;
  roles?: readonly Role[];
  all?: readonly Permission[];
  any?: readonly Permission[];
};

type RouteGuardOptions = Pick<GuardOptions, "redirectTo" | "roles">;

export function withRoleGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: GuardOptions,
) {
  const {
    redirectTo = UNAUTHORIZED_ROUTE,
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

export function withRouteGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  pathname: string,
  options: RouteGuardOptions = {},
) {
  const routePolicy = resolveRoutePermissionPolicy(pathname);

  if (!routePolicy) {
    throw new Error(`Missing shared route permission policy for ${pathname}`);
  }

  return withRoleGuard(WrappedComponent, {
    ...options,
    all: routePolicy.requireAll,
    any: routePolicy.requireAny,
  });
}

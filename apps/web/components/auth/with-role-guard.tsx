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
import { stripPortalRoutePrefix } from "@/lib/portal-routing";

type GuardOptions = {
  redirectTo?: string;
  roles?: readonly Role[];
  all?: readonly Permission[];
  anyOf?: readonly Permission[];
};

type RouteGuardOptions = Pick<GuardOptions, "redirectTo" | "roles">;

export function withRoleGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: GuardOptions,
) {
  const { redirectTo = UNAUTHORIZED_ROUTE, roles, all, anyOf } = options;

  return function RoleGuardedComponent(props: P) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const role = resolveSessionRole(session);

    const isAllowed =
      !!role &&
      (!roles || roles.length === 0 || roles.includes(role)) &&
      (!all || all.length === 0 || sessionHasAllPermissions(session, all)) &&
      (!anyOf || anyOf.length === 0 || sessionHasAnyPermission(session, anyOf));

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
  const policyPathname = stripPortalRoutePrefix(pathname);
  const routePolicy = resolveRoutePermissionPolicy(policyPathname);

  if (!routePolicy) {
    throw new Error(
      `Missing shared route permission policy for ${policyPathname}`,
    );
  }

  return withRoleGuard(WrappedComponent, {
    ...options,
    all: routePolicy.requireAll,
    anyOf: routePolicy.requireAny,
  });
}

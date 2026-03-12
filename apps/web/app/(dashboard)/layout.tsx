"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { BranchSelector } from "@/components/layout/BranchSelector";
import { buildExpiredLoginRoute, LOGIN_ROUTE } from "@/lib/auth-routes";
import { clearSuperAdminBranchSelectionConfirmed } from "@/lib/branch-context";
import { SidebarInset, SidebarProvider } from "@tbms/ui/components/sidebar";
import { LoadingState } from "@tbms/ui/components/loading-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";
import { Badge } from "@tbms/ui/components/badge";
import { Label } from "@tbms/ui/components/label";
import { Role } from "@tbms/shared-types";
import { useBranchStore } from "@/store/useBranchStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { activeBranchId, clearActiveBranch, hydrate } = useBranchStore();
  const handledInvalidSessionRef = useRef(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(LOGIN_ROUTE);
      return;
    }

    const hasAccessToken =
      typeof session?.accessToken === "string" &&
      session.accessToken.length > 0;

    if (
      status === "authenticated" &&
      ((typeof session?.error === "string" && session.error.length > 0) ||
        !hasAccessToken)
    ) {
      if (handledInvalidSessionRef.current) {
        return;
      }
      handledInvalidSessionRef.current = true;
      clearActiveBranch();
      clearSuperAdminBranchSelectionConfirmed();
      void signOut({ redirect: false });
      router.replace(buildExpiredLoginRoute());
    }
  }, [clearActiveBranch, router, session?.accessToken, session?.error, status]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <LoadingState
          text="Loading application..."
          caption="Preparing workspace and permissions."
        />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const requireBranchSelection =
    session?.user?.role === Role.SUPER_ADMIN && !activeBranchId;

  if (requireBranchSelection) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-xl">
          <CardHeader className="space-y-3">
            <Badge variant="secondary" className="w-fit">
              Branch Scope Required
            </Badge>
            <CardTitle>Select Active Branch</CardTitle>
            <CardDescription>
              Choose a branch to continue. Your dashboard and records will load
              in that branch context.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Branch
            </Label>
            <BranchSelector className="h-10 w-full text-sm" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "18rem",
          "--header-height": "3.5rem",
        } as CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <div className="flex flex-1 flex-col overflow-x-hidden">
          <div className="@container/main flex flex-1 flex-col">
            <div className="flex flex-1 flex-col p-6">{children}</div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

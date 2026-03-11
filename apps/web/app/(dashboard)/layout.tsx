"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { buildExpiredLoginRoute, LOGIN_ROUTE } from "@/lib/auth-routes";
import { SidebarInset, SidebarProvider } from "@tbms/ui/components/sidebar";
import { LoadingState } from "@tbms/ui/components/loading-state";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const handledInvalidSessionRef = useRef(false);

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
      void signOut({ redirect: false });
      router.replace(buildExpiredLoginRoute());
    }
  }, [router, session?.accessToken, session?.error, status]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <LoadingState
          text="Loading application..."
          caption="Preparing workspace and permissions."
          className="min-w-[280px] rounded-3xl bg-card px-8 py-10 shadow"
        />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
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

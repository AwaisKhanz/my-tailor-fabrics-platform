"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Topbar } from "@/components/layout/Topbar";
import { Sidebar } from "@/components/layout/Sidebar";

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
      router.replace("/login");
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
      router.replace("/login?expired=1");
    }
  }, [router, session?.accessToken, session?.error, status]);

  useEffect(() => {
    document.body.classList.add("dashboard-shell");
    return () => {
      document.body.classList.remove("dashboard-shell");
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex min-w-[280px] flex-col items-center rounded-snow-28 border border-border bg-card px-8 py-10 shadow">
          <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-primary/25 border-t-primary" />
          <p className="mt-4 text-[0.875rem] font-medium text-muted-foreground">
            Loading application...
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="dashboard-shell">
      <Topbar />
      <Sidebar />
      <main className="dashboard-shell-scroll !mt-14 sm:!mt-0">
        <div className="dashboard-shell-workspace">{children}</div>
      </main>
    </div>
  );
}

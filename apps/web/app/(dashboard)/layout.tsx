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
    document.body.classList.add("dashboard-liquid");
    return () => {
      document.body.classList.remove("dashboard-liquid");
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading application...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="dashboard-liquid-shell">
      <Topbar />
      <Sidebar />
      <main className="dashboard-liquid-scroll">
        <div className="dashboard-liquid-workspace">{children}</div>
      </main>
    </div>
  );
}

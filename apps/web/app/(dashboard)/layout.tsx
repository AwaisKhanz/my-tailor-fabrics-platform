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
      typeof session?.accessToken === "string" && session.accessToken.length > 0;

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

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="mt-4 text-text-secondary">Loading application...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Topbar />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar />
        <main className="scrollbar-theme flex-1 overflow-y-auto bg-surface px-3 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}

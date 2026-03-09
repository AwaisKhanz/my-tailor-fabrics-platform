"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MobileSidebarSheet } from "@/components/layout/mobile-sidebar-sheet";
import { SidebarNavList } from "@/components/layout/sidebar-nav";
import { useAuthz } from "@/hooks/use-authz";
import { getVisibleNavSections } from "@/lib/sidebar-navigation";

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuthz();
  const sections = getVisibleNavSections(role);

  return (
    <aside className="fixed bottom-4 left-4 top-[5.75rem] z-30 hidden w-[19rem] flex-col rounded-snow-32 border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm md:flex lg:bottom-5 lg:left-5 lg:top-[6rem]">
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <SidebarNavList sections={sections} pathname={pathname} />
      </div>
    </aside>
  );
}

/** Mobile hamburger button — rendered inside the Topbar on small screens */
export function MobileSidebarTrigger() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { role } = useAuthz();
  const sections = getVisibleNavSections(role);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <MobileSidebarSheet
        open={open}
        sections={sections}
        pathname={pathname}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

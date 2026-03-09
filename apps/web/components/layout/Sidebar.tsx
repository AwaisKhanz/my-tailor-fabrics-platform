"use client";

import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/config";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SectionIcon } from "@/components/ui/section-icon";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuthz } from "@/hooks/use-authz";
import {
  getVisibleNavSections,
  SidebarNavList,
} from "@/components/layout/sidebar-nav";

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

      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0 bg-foreground/24"
            onClick={() => setOpen(false)}
          />

          <div className="relative m-3 flex h-[calc(100%-1.5rem)] w-[19rem] flex-col rounded-snow-32 border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm ">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
              <div className="flex min-w-0 items-center gap-2">
                <SectionIcon
                  tone="default"
                  size="md"
                  className="relative overflow-hidden"
                >
                  <Image
                    src={siteConfig.branding.logo}
                    alt={siteConfig.name}
                    width={32}
                    height={32}
                    className="object-contain p-1"
                  />
                </SectionIcon>
                <span className="truncate text-base font-semibold  text-sidebar-foreground">
                  {siteConfig.shortName}
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4">
              <SidebarNavList
                sections={sections}
                pathname={pathname}
                onNavigate={() => setOpen(false)}
              />
            </div>

            <div className="flex shrink-0 items-center justify-between border-t border-sidebar-border px-4 py-4">
              <Label className="text-xs font-bold uppercase tracking-[0.08em] text-sidebar-foreground">
                Theme
              </Label>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

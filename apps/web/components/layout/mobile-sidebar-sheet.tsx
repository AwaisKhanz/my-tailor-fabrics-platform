"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SectionIcon } from "@/components/ui/section-icon";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import {
  type NavSection,
  SidebarNavList,
} from "@/components/layout/sidebar-nav";
import { siteConfig } from "@/lib/config";

interface MobileSidebarSheetProps {
  open: boolean;
  sections: NavSection[];
  pathname: string;
  onClose: () => void;
}

export function MobileSidebarSheet({
  open,
  sections,
  pathname,
  onClose,
}: MobileSidebarSheetProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      <div className="absolute inset-0 bg-foreground/24" onClick={onClose} />

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
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarNavList
            sections={sections}
            pathname={pathname}
            onNavigate={onClose}
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
  );
}

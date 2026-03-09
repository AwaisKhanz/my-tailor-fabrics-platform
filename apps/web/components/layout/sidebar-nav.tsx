"use client";

import Link from "next/link";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { HOME_ROUTE } from "@/lib/auth-routes";
import {
  type NavItem,
  type NavSection,
} from "@/lib/sidebar-navigation";

function SidebarNavItem({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const isActive =
    pathname === item.href ||
    (item.href !== HOME_ROUTE && pathname.startsWith(`${item.href}/`));
  const ItemIcon = item.icon;

  const baseClasses =
    "group flex w-full cursor-pointer items-center gap-3 rounded-snow-20 border border-transparent bg-transparent px-4 py-3.5 text-[0.875rem] font-medium transition-all duration-200 ease-out";

  const activeClasses =
    "border-secondary bg-secondary text-primary font-semibold";

  const inactiveClasses =
    "text-sidebar-foreground hover:-translate-y-px hover:border-secondary hover:bg-background hover:text-primary";

  return (
    <div
      data-active={isActive ? "true" : "false"}
      className={cn(baseClasses, isActive ? activeClasses : inactiveClasses)}
    >
      <ItemIcon
        className={cn(
          "h-5 w-5 shrink-0 transition-colors",
          isActive
            ? "!text-primary"
            : "text-sidebar-foreground group-hover:text-primary",
        )}
      />
      <span className="flex-1 truncate transition-colors">{item.title}</span>
    </div>
  );
}

export function SidebarNavList({
  sections,
  pathname,
  onNavigate,
}: {
  sections: NavSection[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <section key={section.title} className="space-y-1.5">
          <div className="px-3">
            <Label className="text-xs font-bold uppercase tracking-[0.08em] text-sidebar-foreground">
              {section.title}
            </Label>
          </div>

          <div className="space-y-1">
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className="block"
              >
                <SidebarNavItem item={item} pathname={pathname} />
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

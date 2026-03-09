"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Role } from "@tbms/shared-types";
import {
  canRoleAccessPathname,
  FRONTEND_ROUTE_ROLES,
} from "@tbms/shared-constants";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/config";
import {
  EXPENSES_ROUTE,
  PAYMENTS_ROUTE,
  REPORTS_ROUTE,
} from "@/lib/finance-routes";
import { CUSTOMERS_ROUTE, EMPLOYEES_ROUTE } from "@/lib/people-routes";
import {
  ATTENDANCE_SETTINGS_ROUTE,
  AUDIT_LOGS_SETTINGS_ROUTE,
  BRANCHES_SETTINGS_ROUTE,
  DESIGN_TYPES_SETTINGS_ROUTE,
  EXPENSE_CATEGORIES_SETTINGS_ROUTE,
  GARMENTS_SETTINGS_ROUTE,
  INTEGRATIONS_SETTINGS_ROUTE,
  MEASUREMENTS_SETTINGS_ROUTE,
  RATES_SETTINGS_ROUTE,
  SETTINGS_ROUTE,
  SYSTEM_SETTINGS_ROUTE,
  USERS_SETTINGS_ROUTE,
} from "@/lib/settings-routes";
import Image from "next/image";
import {
  PieChart,
  Users,
  ShoppingBag,
  Briefcase,
  Menu,
  X,
  BarChart,
  LayoutDashboard,
  Building2,
  Shirt,
  Banknote,
  Ruler,
  UserCog,
  Layout,
  SlidersHorizontal,
  Clock3,
  Wallet,
  PlugZap,
  ClipboardList,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SectionIcon } from "@/components/ui/section-icon";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuthz } from "@/hooks/use-authz";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: Role[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const SETTINGS_ROLES = FRONTEND_ROUTE_ROLES[SETTINGS_ROUTE];

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Workspace",
    items: [
      {
        title: "Dashboard",
        href: "/",
        icon: PieChart,
        roles: FRONTEND_ROUTE_ROLES["/"],
      },
      {
        title: "My Orders",
        href: "/my-orders",
        icon: LayoutDashboard,
        roles: FRONTEND_ROUTE_ROLES["/my-orders"],
      },
      {
        title: "Orders",
        href: "/orders",
        icon: ShoppingBag,
        roles: FRONTEND_ROUTE_ROLES["/orders"],
      },
      {
        title: "Customers",
        href: CUSTOMERS_ROUTE,
        icon: Users,
        roles: FRONTEND_ROUTE_ROLES[CUSTOMERS_ROUTE],
      },
      {
        title: "Employees",
        href: EMPLOYEES_ROUTE,
        icon: Briefcase,
        roles: FRONTEND_ROUTE_ROLES[EMPLOYEES_ROUTE],
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        title: "Payments",
        href: PAYMENTS_ROUTE,
        icon: Banknote,
        roles: FRONTEND_ROUTE_ROLES[PAYMENTS_ROUTE],
      },
      {
        title: "Expenses",
        href: EXPENSES_ROUTE,
        icon: Banknote,
        roles: FRONTEND_ROUTE_ROLES[EXPENSES_ROUTE],
      },
      {
        title: "Reports",
        href: REPORTS_ROUTE,
        icon: BarChart,
        roles: FRONTEND_ROUTE_ROLES[REPORTS_ROUTE],
      },
    ],
  },
  {
    title: "Configuration",
    items: [
      {
        title: "Branches",
        href: BRANCHES_SETTINGS_ROUTE,
        icon: Building2,
        roles: SETTINGS_ROLES,
      },
      {
        title: "Garments",
        href: GARMENTS_SETTINGS_ROUTE,
        icon: Shirt,
        roles: SETTINGS_ROLES,
      },
      {
        title: "Labor Rates",
        href: RATES_SETTINGS_ROUTE,
        icon: Banknote,
        roles: SETTINGS_ROLES,
      },
      {
        title: "Expense Categories",
        href: EXPENSE_CATEGORIES_SETTINGS_ROUTE,
        icon: Wallet,
        roles: SETTINGS_ROLES,
      },
      {
        title: "Design Types",
        href: DESIGN_TYPES_SETTINGS_ROUTE,
        icon: Layout,
        roles: SETTINGS_ROLES,
      },
      {
        title: "Measurements",
        href: MEASUREMENTS_SETTINGS_ROUTE,
        icon: Ruler,
        roles: SETTINGS_ROLES,
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        title: "Staff Accounts",
        href: USERS_SETTINGS_ROUTE,
        icon: UserCog,
        roles: SETTINGS_ROLES,
      },
      {
        title: "Attendance",
        href: ATTENDANCE_SETTINGS_ROUTE,
        icon: Clock3,
        roles: SETTINGS_ROLES,
      },
      {
        title: "System Controls",
        href: SYSTEM_SETTINGS_ROUTE,
        icon: SlidersHorizontal,
        roles: SETTINGS_ROLES,
      },
      {
        title: "Integrations",
        href: INTEGRATIONS_SETTINGS_ROUTE,
        icon: PlugZap,
        roles: SETTINGS_ROLES,
      },
      {
        title: "Audit Logs",
        href: AUDIT_LOGS_SETTINGS_ROUTE,
        icon: ClipboardList,
        roles: SETTINGS_ROLES,
      },
    ],
  },
];

function getVisibleNavSections(role: Role | null): NavSection[] {
  if (!role) {
    return [];
  }

  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        item.roles.includes(role) && canRoleAccessPathname(role, item.href),
    ),
  })).filter((section) => section.items.length > 0);
}

function NavList({
  sections,
  pathname,
  onNavigate,
}: {
  sections: NavSection[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const NavItemContent = ({ item }: { item: NavItem }) => {
    const isActive =
      pathname === item.href ||
      (item.href !== "/" && pathname.startsWith(`${item.href}/`));
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
  };

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
                <NavItemContent item={item} />
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuthz();
  const sections = getVisibleNavSections(role);

  return (
    <aside className="fixed bottom-4 left-4 top-[5.75rem] z-30 hidden w-[19rem] flex-col rounded-snow-32 border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm md:flex lg:bottom-5 lg:left-5 lg:top-[6rem]">
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <NavList sections={sections} pathname={pathname} />
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
              <NavList
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

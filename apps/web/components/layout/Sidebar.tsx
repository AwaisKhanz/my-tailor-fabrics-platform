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

const SETTINGS_ROLES = FRONTEND_ROUTE_ROLES["/settings"];

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
        href: "/customers",
        icon: Users,
        roles: FRONTEND_ROUTE_ROLES["/customers"],
      },
      {
        title: "Employees",
        href: "/employees",
        icon: Briefcase,
        roles: FRONTEND_ROUTE_ROLES["/employees"],
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        title: "Payments",
        href: "/payments",
        icon: Banknote,
        roles: FRONTEND_ROUTE_ROLES["/payments"],
      },
      {
        title: "Expenses",
        href: "/expenses",
        icon: Banknote,
        roles: FRONTEND_ROUTE_ROLES["/expenses"],
      },
      {
        title: "Reports",
        href: "/reports",
        icon: BarChart,
        roles: FRONTEND_ROUTE_ROLES["/reports"],
      },
    ],
  },
  {
    title: "Configuration",
    items: [
      {
        title: "Branches",
        href: "/settings/branches",
        icon: Building2,
        roles: SETTINGS_ROLES,
      },
      {
        title: "Garments",
        href: "/settings/garments",
        icon: Shirt,
        roles: SETTINGS_ROLES,
      },
      {
        title: "Labor Rates",
        href: "/settings/rates",
        icon: Banknote,
        roles: SETTINGS_ROLES,
      },
      {
        title: "Expense Categories",
        href: "/settings/expense-categories",
        icon: Wallet,
        roles: SETTINGS_ROLES,
      },
      {
        title: "Design Types",
        href: "/settings/design-types",
        icon: Layout,
        roles: SETTINGS_ROLES,
      },
      {
        title: "Measurements",
        href: "/settings/measurements",
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
        href: "/settings/users",
        icon: UserCog,
        roles: SETTINGS_ROLES,
      },
      {
        title: "Attendance",
        href: "/settings/attendance",
        icon: Clock3,
        roles: SETTINGS_ROLES,
      },
      {
        title: "System Controls",
        href: "/settings/system",
        icon: SlidersHorizontal,
        roles: SETTINGS_ROLES,
      },
      {
        title: "Integrations",
        href: "/settings/integrations",
        icon: PlugZap,
        roles: SETTINGS_ROLES,
      },
      {
        title: "Audit Logs",
        href: "/settings/audit-logs",
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
      "group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all";

    const activeClasses =
      "border border-sidebar-border bg-sidebar-active text-sidebar-foreground shadow-sm";

    const inactiveClasses =
      "border border-transparent text-sidebar-foreground/70 hover:border-sidebar-border hover:bg-interaction-hover hover:text-sidebar-foreground";

    return (
      <div
        className={cn(baseClasses, isActive ? activeClasses : inactiveClasses)}
      >
        <ItemIcon
          className={cn(
            "h-5 w-5 shrink-0 transition-colors",
            isActive
              ? "text-sidebar-foreground"
              : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground",
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
            <Label
              variant="dashboard"
              className="text-[10px] uppercase tracking-[0.12em] text-sidebar-foreground/45"
            >
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

  // const BrandHeader = () => (
  //   <div className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b border-sidebar-border bg-sidebar/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-sidebar/90">
  //     <Image
  //       src={siteConfig.branding.logo}
  //       alt={siteConfig.name}
  //       width={32}
  //       height={32}
  //       className="rounded-md object-contain"
  //     />
  //     <div className="flex min-w-0 flex-col">
  //       <span className="truncate text-sm font-semibold text-sidebar-foreground">{siteConfig.name}</span>
  //       <Label variant="dashboard" className="mt-0.5">
  //         {siteConfig.branding.edition}
  //       </Label>
  //     </div>
  //   </div>
  // );

  return (
    <aside className="hidden h-full w-72 flex-shrink-0 flex-col border-r border-sidebar-border bg-sidebar/95 md:flex">
      {/* <BrandHeader /> */}
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
        variant="sidebarIcon"
        size="iconSm"
        className="md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0 bg-overlay backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="relative flex h-full w-[18.5rem] flex-col border-r border-sidebar-border bg-sidebar shadow-theme-modal">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border bg-sidebar/95 px-4">
              <div className="flex min-w-0 items-center gap-2">
                <SectionIcon
                  tone="sidebar"
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
                <span className="truncate text-sm font-semibold text-sidebar-foreground">
                  {siteConfig.shortName}
                </span>
              </div>
              <Button
                variant="sidebarIcon"
                size="iconSm"
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

            <div className="flex shrink-0 items-center justify-between border-t border-sidebar-border bg-sidebar px-4 py-4">
              <Label variant="dashboard">Theme</Label>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

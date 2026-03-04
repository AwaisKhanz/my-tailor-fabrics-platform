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
  Settings as SettingsIcon,
  ShoppingBag,
  Briefcase,
  Menu,
  X,
  BarChart,
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  Building2,
  Shirt,
  Banknote,
  Ruler,
  UserCog,
  Layout,
  Palette,
  SlidersHorizontal,
  Clock3,
  Wallet,
  PlugZap,
  ClipboardList,
} from "lucide-react";
import { useEffect, useState } from "react";
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
  subItems?: { title: string; href: string; icon?: React.ElementType }[];
}

const NAV_ITEMS: NavItem[] = [
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
  {
    title: "Settings",
    href: "/settings",
    icon: SettingsIcon,
    roles: FRONTEND_ROUTE_ROLES["/settings"],
    subItems: [
      { title: "Branches", href: "/settings/branches", icon: Building2 },
      { title: "Garments", href: "/settings/garments", icon: Shirt },
      { title: "Labor Rates", href: "/settings/rates", icon: Banknote },
      {
        title: "Expense Categories",
        href: "/settings/expense-categories",
        icon: Wallet,
      },
      { title: "Design Types", href: "/settings/design-types", icon: Layout },
      { title: "Measurements", href: "/settings/measurements", icon: Ruler },
      { title: "Staff Accounts", href: "/settings/users", icon: UserCog },
      { title: "Attendance", href: "/settings/attendance", icon: Clock3 },
      {
        title: "System Controls",
        href: "/settings/system",
        icon: SlidersHorizontal,
      },
      { title: "Integrations", href: "/settings/integrations", icon: PlugZap },
      {
        title: "Audit Logs",
        href: "/settings/audit-logs",
        icon: ClipboardList,
      },
      { title: "Appearance", href: "/settings/appearance", icon: Palette },
    ],
  },
];

function getVisibleNavItems(role: Role | null): NavItem[] {
  if (!role) {
    return [];
  }

  return NAV_ITEMS.map((item) => ({
    ...item,
    subItems: item.subItems?.filter((subItem) =>
      canRoleAccessPathname(role, subItem.href),
    ),
  })).filter(
    (item) =>
      item.roles.includes(role) && canRoleAccessPathname(role, item.href),
  );
}

function NavList({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const [expandedItems, setExpandedItems] = useState<string[]>(() =>
    pathname.startsWith("/settings") ? ["/settings"] : [],
  );

  useEffect(() => {
    if (pathname.startsWith("/settings")) {
      setExpandedItems((prev) =>
        prev.includes("/settings") ? prev : [...prev, "/settings"],
      );
    }
  }, [pathname]);

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((i) => i !== href) : [...prev, href],
    );
  };

  const NavItemContent = ({
    item,
    isSubItem = false,
  }: {
    item: NavItem | { title: string; href: string; icon?: React.ElementType };
    isSubItem?: boolean;
  }) => {
    const isActive =
      pathname === item.href ||
      (item.href !== "/" && pathname.startsWith(`${item.href}/`));
    const isExpanded = expandedItems.includes(item.href);
    const hasSubItems =
      "subItems" in item && item.subItems && item.subItems.length > 0;
    const ItemIcon = "icon" in item ? item.icon : undefined;

    const baseClasses = cn(
      "group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all",
      isSubItem ? "ml-4 py-2.5 text-xs" : "py-2.5",
    );

    const activeClasses = isSubItem
      ? "bg-sidebar-active font-semibold text-sidebar-foreground"
      : "border border-sidebar-border bg-sidebar-active text-sidebar-foreground shadow-sm";

    const inactiveClasses = isSubItem
      ? "text-sidebar-foreground/70 hover:bg-interaction-hover hover:text-sidebar-foreground"
      : "border border-transparent text-sidebar-foreground/70 hover:border-sidebar-border hover:bg-interaction-hover hover:text-sidebar-foreground";

    return (
      <div
        className={cn(baseClasses, isActive ? activeClasses : inactiveClasses)}
      >
        {ItemIcon && (
          <ItemIcon
            className={cn(
              isSubItem ? "h-4 w-4" : "h-5 w-5",
              "shrink-0 transition-colors",
              isActive
                ? "text-sidebar-foreground"
                : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground",
            )}
          />
        )}
        <span className="flex-1 truncate transition-colors">{item.title}</span>
        {hasSubItems &&
          (isExpanded ? (
            <ChevronDown className="w-4 h-4 text-sidebar-foreground/50" />
          ) : (
            <ChevronRight className="w-4 h-4 text-sidebar-foreground/50" />
          ))}
      </div>
    );
  };

  return (
    <div className="space-y-1.5">
      {items.map((item) => {
        const hasSubItems = item.subItems && item.subItems.length > 0;
        const isExpanded = expandedItems.includes(item.href);

        return (
          <div key={item.href} className="space-y-1">
            {hasSubItems ? (
              <button
                type="button"
                onClick={() => toggleExpand(item.href)}
                className="block w-full text-left"
                aria-expanded={isExpanded}
                aria-controls={`nav-group-${item.href.replaceAll("/", "-")}`}
              >
                <NavItemContent item={item} />
              </button>
            ) : (
              <Link href={item.href} onClick={onNavigate} className="block">
                <NavItemContent item={item} />
              </Link>
            )}

            {hasSubItems && isExpanded && (
              <div
                id={`nav-group-${item.href.replaceAll("/", "-")}`}
                className="ml-5 mt-1 space-y-1 border-l border-sidebar-border pl-1"
              >
                {item.subItems?.map((sub) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    onClick={onNavigate}
                    className="block"
                  >
                    <NavItemContent item={sub} isSubItem />
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuthz();
  const items = getVisibleNavItems(role);

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
        <NavList items={items} pathname={pathname} />
      </div>
    </aside>
  );
}

/** Mobile hamburger button — rendered inside the Topbar on small screens */
export function MobileSidebarTrigger() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { role } = useAuthz();
  const items = getVisibleNavItems(role);

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

          <div className="relative flex h-full w-[18.5rem] flex-col border-r border-sidebar-border bg-sidebar shadow-xl">
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
                items={items}
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

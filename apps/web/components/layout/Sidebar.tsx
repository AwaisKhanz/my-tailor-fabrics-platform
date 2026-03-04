"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Role } from "@tbms/shared-types";
import { canRoleAccessPathname, FRONTEND_ROUTE_ROLES } from "@tbms/shared-constants";
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
      { title: 'Branches', href: '/settings/branches', icon: Building2 },
      { title: 'Garments', href: '/settings/garments', icon: Shirt },
      { title: 'Labor Rates', href: '/settings/rates', icon: Banknote },
      { title: 'Expense Categories', href: '/settings/expense-categories', icon: Wallet },
      { title: 'Design Types', href: '/settings/design-types', icon: Layout },
      { title: 'Measurements', href: '/settings/measurements', icon: Ruler },
      { title: 'Staff Accounts', href: '/settings/users', icon: UserCog },
      { title: 'Attendance', href: '/settings/attendance', icon: Clock3 },
      { title: 'System Controls', href: '/settings/system', icon: SlidersHorizontal },
      { title: 'Integrations', href: '/settings/integrations', icon: PlugZap },
      { title: 'Audit Logs', href: '/settings/audit-logs', icon: ClipboardList },
      { title: 'Appearance', href: '/settings/appearance', icon: Palette },
    ],
  },
];

function getVisibleNavItems(role: Role | null): NavItem[] {
  if (!role) {
    return [];
  }

  return NAV_ITEMS
    .map((item) => ({
      ...item,
      subItems: item.subItems?.filter((subItem) =>
        canRoleAccessPathname(role, subItem.href),
      ),
    }))
    .filter(
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
    pathname.startsWith("/settings") ? ["/settings"] : []
  );

  useEffect(() => {
    if (pathname.startsWith("/settings")) {
      setExpandedItems((prev) =>
        prev.includes("/settings") ? prev : [...prev, "/settings"]
      );
    }
  }, [pathname]);

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((i) => i !== href) : [...prev, href]
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
    const hasSubItems = 'subItems' in item && item.subItems && item.subItems.length > 0;
    const ItemIcon = "icon" in item ? item.icon : undefined;

    const baseClasses = cn(
      "group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all",
      isSubItem ? "ml-4 py-2.5 text-xs" : "py-2.5"
    );
    
    const activeClasses = isSubItem 
      ? "bg-primary/10 font-semibold text-primary"
      : "border border-primary/20 bg-primary/10 text-primary shadow-sm";
    
    const inactiveClasses = isSubItem
      ? "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
      : "border border-transparent text-muted-foreground hover:border-border/80 hover:bg-muted/40 hover:text-foreground";

    return (
      <div className={cn(baseClasses, isActive ? activeClasses : inactiveClasses)}>
        {ItemIcon && (
          <ItemIcon
            className={cn(
              isSubItem ? "h-4 w-4" : "h-5 w-5",
              "shrink-0 transition-colors",
              isActive
                ? "text-primary"
                : "text-muted-foreground group-hover:text-primary",
            )}
          />
        )}
        <span className="flex-1 truncate transition-colors">{item.title}</span>
        {hasSubItems && (
          isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground/50" /> : <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
        )}
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
                className="ml-5 mt-1 space-y-1 border-l border-border/70 pl-1"
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


  const BrandHeader = () => (
    <div className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b border-border/70 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <Image
        src={siteConfig.branding.logo}
        alt={siteConfig.name}
        width={32}
        height={32}
        className="rounded-md object-contain"
      />
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-semibold text-foreground">{siteConfig.name}</span>
        <Label variant="dashboard" className="mt-0.5">
          {siteConfig.branding.edition}
        </Label>
      </div>
    </div>
  );


  return (
    <aside className="hidden h-full w-72 flex-shrink-0 flex-col border-r border-border/70 bg-background/95 md:flex">
      <BrandHeader />
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
        variant="outline"
        size="iconSm"
        className="rounded-lg border-border/80 md:hidden"
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

          <div className="relative flex h-full w-[18.5rem] flex-col border-r border-border/70 bg-background shadow-xl">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/70 bg-background/95 px-4">
              <div className="flex min-w-0 items-center gap-2">
                <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-background">
                  <Image
                    src={siteConfig.branding.logo}
                    alt={siteConfig.name}
                    width={32}
                    height={32}
                    className="object-contain p-1"
                  />
                </div>
                <span className="truncate text-sm font-semibold text-foreground">{siteConfig.shortName}</span>
              </div>
              <Button
                variant="outline"
                size="iconSm"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-lg border-border/80"
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

            <div className="flex shrink-0 items-center justify-between border-t border-border/70 bg-background px-4 py-4">
              <Label variant="dashboard">Theme</Label>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

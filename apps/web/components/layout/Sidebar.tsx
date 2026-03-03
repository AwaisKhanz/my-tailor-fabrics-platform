"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Role } from "@tbms/shared-types";
import { FRONTEND_ROUTE_ROLES } from "@tbms/shared-constants";
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
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

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
      { title: 'Design Types', href: '/settings/design-types', icon: Layout },
      { title: 'Measurements', href: '/settings/measurements', icon: Ruler },
      { title: 'Staff Accounts', href: '/settings/users', icon: UserCog },
    ],
  },
];

function NavList({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const [expandedItems, setExpandedItems] = useState<string[]>(["/settings"]);

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((i) => i !== href) : [...prev, href]
    );
  };

  const NavItemContent = ({ item, isSubItem = false }: { item: NavItem | { title: string; href: string }, isSubItem?: boolean }) => {
    const isActive =
      pathname === item.href ||
      (item.href !== "/" && pathname.startsWith(`${item.href}/`));
    const isExpanded = expandedItems.includes(item.href);
    const hasSubItems = 'subItems' in item && item.subItems && item.subItems.length > 0;

    const baseClasses = cn(
      "group flex cursor-pointer items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all",
      isSubItem ? "ml-4 py-2 text-xs" : "py-2.5"
    );
    
    const activeClasses = isSubItem 
      ? "text-primary font-bold bg-primary/10 shadow-sm" 
      : "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20";
    
    const inactiveClasses = isSubItem
      ? "text-muted-foreground hover:text-foreground hover:bg-muted/30"
      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground";

    return (
      <div className={cn(baseClasses, isActive ? activeClasses : inactiveClasses)}>
        {'icon' in item && (
          <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
        )}
        <span className="flex-1 transition-colors">{item.title}</span>
        {hasSubItems && (
          isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground/50" /> : <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
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
                className="mt-1 ml-5 space-y-1 border-l border-border"
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
  const { data: session } = useSession();
  const user = session?.user;
  const role = user?.role;

  const items = NAV_ITEMS.filter((item) => role && item.roles.includes(role as Role));


  const BrandHeader = () => (
    <div className="sticky top-0 z-10 flex h-20 shrink-0 items-center gap-3 border-b border-border/50 bg-background/60 px-6 backdrop-blur-md">
      <Image
        src={siteConfig.branding.logo}
        alt={siteConfig.name}
        width={40}
        height={40}
        className="object-contain"
      />
      <div className="flex flex-col">
        <Label variant="dashboard" className="text-foreground opacity-100">{siteConfig.name}</Label>
        <div className="flex items-center gap-1.5">
          <Label variant="dashboard">{siteConfig.branding.edition}</Label>
        </div>
      </div>
    </div>
  );


  return (
    <aside className="hidden h-full w-64 flex-shrink-0 flex-col border-r border-border bg-card/95 md:flex">
      <BrandHeader />
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <NavList items={items} pathname={pathname} />
      </div>
    </aside>
  );
}

/** Mobile hamburger button — rendered inside the Topbar on small screens */
export function MobileSidebarTrigger() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const role = user?.role;

  const items = NAV_ITEMS.filter((item) => role && item.roles.includes(role));

  return (
    <>
      <Button
        variant="ghost"
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
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <div className="relative flex h-full w-72 flex-col border-r bg-card shadow-xl">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/50 bg-muted/30 px-6">
              <div className="flex items-center gap-2">
                <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-background shadow-sm">
                  <Image
                    src={siteConfig.branding.logo}
                    alt={siteConfig.name}
                    width={32}
                    height={32}
                    className="object-contain p-1"
                  />
                </div>
                <span className="text-sm font-extrabold uppercase tracking-tight text-foreground">{siteConfig.shortName}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="h-8 w-8 rounded-full hover:bg-muted"
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

            <div className="flex shrink-0 items-center justify-center border-t border-border/50 bg-muted/20 px-6 py-5">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

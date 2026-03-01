"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Role } from "@tbms/shared-types";
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
  Wallet,
  BarChart,
  LayoutDashboard,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Building2,
  Shirt,
  Ruler,
  UserCog,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
  subItems?: { title: string; href: string; icon?: React.ElementType }[];
}

const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: PieChart,
    roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.VIEWER],
  },
  {
    title: "My Orders",
    href: "/my-orders",
    icon: LayoutDashboard,
    roles: [Role.EMPLOYEE],
  },
  {
    title: "Orders",
    href: "/orders",
    icon: ShoppingBag,
    roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.ENTRY_OPERATOR, Role.VIEWER],
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
    roles: [Role.SUPER_ADMIN, Role.ADMIN, "ENTRY_OPERATOR", "VIEWER"],
  },
  {
    title: "Employees",
    href: "/employees",
    icon: Briefcase,
    roles: [Role.SUPER_ADMIN, Role.ADMIN, "VIEWER"],
  },
  {
    title: "Payments",
    href: "/payments",
    icon: Wallet,
    roles: [Role.SUPER_ADMIN, Role.ADMIN, "VIEWER"],
  },
  {
    title: "Expenses",
    href: "/expenses",
    icon: DollarSign,
    roles: [Role.SUPER_ADMIN, Role.ADMIN, "VIEWER"],
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart,
    roles: [Role.SUPER_ADMIN, Role.ADMIN, "VIEWER"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: SettingsIcon,
    roles: [Role.SUPER_ADMIN, Role.ADMIN],
    subItems: [
      { title: 'Branches', href: '/settings/branches', icon: Building2 },
      { title: 'Garments', href: '/settings/garments', icon: Shirt },
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
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all cursor-pointer group",
      isSubItem ? "ml-4 py-1.5 text-xs" : "py-2.5"
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
              <div onClick={() => toggleExpand(item.href)}>
                <NavItemContent item={item} />
              </div>
            ) : (
              <Link href={item.href} onClick={onNavigate} className="block">
                <NavItemContent item={item} />
              </Link>
            )}

            {hasSubItems && isExpanded && (
              <div className="space-y-1 mt-1 border-l border-border ml-5">
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

  const items = NAV_ITEMS.filter((item) => role && item.roles.includes(role));


  const BrandHeader = () => (
    <div className="flex items-center gap-3 px-6 h-20 border-b border-border/50 shrink-0 bg-background/60 backdrop-blur-md sticky top-0 z-10">
        <Image 
          src={siteConfig.branding.logo} 
          alt={siteConfig.name} 
          width={40} 
          height={40} 
          className="object-contain"
        />
      <div className="flex flex-col">
        <span className="font-extrabold text-sm tracking-tight text-foreground uppercase">{siteConfig.name}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-bold text-primary tracking-[0.15em] uppercase">{siteConfig.branding.edition}</span>
        </div>
      </div>
    </div>
  );


  return (
    <aside className="w-64 flex-shrink-0 border-r border-border bg-card hidden md:flex flex-col h-full">
      <BrandHeader />
      <div className="flex-1 px-3 py-6 overflow-y-auto">
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
      {/* Hamburger button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Drawer panel */}
          <div className="relative flex flex-col w-72 bg-card border-r shadow-xl h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-border/50 shrink-0 bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden bg-background shadow-sm border border-border/50">
                   <Image 
                     src={siteConfig.branding.logo} 
                     alt={siteConfig.name} 
                     width={32} 
                     height={32} 
                     className="object-contain p-1"
                   />
                </div>
                <span className="font-extrabold text-sm tracking-tight text-foreground uppercase">{siteConfig.shortName}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-full h-8 w-8 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Nav */}
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <NavList
                items={items}
                pathname={pathname}
                onNavigate={() => setOpen(false)}
              />
            </div>

            {/* Footer — theme toggle */}
            <div className="border-t border-border/50 px-6 py-5 shrink-0 bg-muted/20 flex items-center justify-center">
                <ThemeToggle />
            </div>

          </div>
        </div>
      )}
    </>
  );
}

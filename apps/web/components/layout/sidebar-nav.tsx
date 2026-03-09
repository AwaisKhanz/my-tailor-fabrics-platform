"use client";

import Link from "next/link";
import { Role } from "@tbms/shared-types";
import {
  canRoleAccessPathname,
  FRONTEND_ROUTE_ROLES,
} from "@tbms/shared-constants";
import {
  PieChart,
  Users,
  ShoppingBag,
  Briefcase,
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
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  EXPENSES_ROUTE,
  PAYMENTS_ROUTE,
  REPORTS_ROUTE,
} from "@/lib/finance-routes";
import { HOME_ROUTE } from "@/lib/auth-routes";
import { CUSTOMERS_ROUTE, EMPLOYEES_ROUTE } from "@/lib/people-routes";
import { MY_ORDERS_ROUTE, ORDERS_ROUTE } from "@/lib/order-routes";
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

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: Role[];
}

export interface NavSection {
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
        href: HOME_ROUTE,
        icon: PieChart,
        roles: FRONTEND_ROUTE_ROLES[HOME_ROUTE],
      },
      {
        title: "My Orders",
        href: MY_ORDERS_ROUTE,
        icon: LayoutDashboard,
        roles: FRONTEND_ROUTE_ROLES[MY_ORDERS_ROUTE],
      },
      {
        title: "Orders",
        href: ORDERS_ROUTE,
        icon: ShoppingBag,
        roles: FRONTEND_ROUTE_ROLES[ORDERS_ROUTE],
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

export function getVisibleNavSections(role: Role | null): NavSection[] {
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

import type { ElementType } from "react";
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
  Package2,
  Wallet,
  PlugZap,
  ClipboardList,
} from "lucide-react";
import {
  EXPENSES_ROUTE,
  PAYMENTS_ROUTE,
  REPORTS_ROUTE,
} from "@/lib/finance-routes";
import { HOME_ROUTE } from "@/lib/auth-routes";
import { CUSTOMERS_ROUTE, EMPLOYEES_ROUTE } from "@/lib/people-routes";
import { MY_ORDERS_ROUTE, ORDERS_ROUTE } from "@/lib/order-routes";
import {
  AUDIT_LOGS_SETTINGS_ROUTE,
  BRANCHES_SETTINGS_ROUTE,
  DESIGN_TYPES_SETTINGS_ROUTE,
  EXPENSE_CATEGORIES_SETTINGS_ROUTE,
  FABRICS_SETTINGS_ROUTE,
  GARMENTS_SETTINGS_ROUTE,
  INTEGRATIONS_SETTINGS_ROUTE,
  MEASUREMENTS_SETTINGS_ROUTE,
  RATES_SETTINGS_ROUTE,
  SETTINGS_ROUTE,
  USERS_SETTINGS_ROUTE,
} from "@/lib/settings-routes";
import { stripPortalRoutePrefix } from "@/lib/portal-routing";

export interface NavItem {
  title: string;
  href: string;
  icon: ElementType;
  roles: Role[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

const SETTINGS_ROLES = FRONTEND_ROUTE_ROLES[stripPortalRoutePrefix(SETTINGS_ROUTE)];

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Workspace",
    items: [
      {
        title: "Dashboard",
        href: HOME_ROUTE,
        icon: PieChart,
        roles: FRONTEND_ROUTE_ROLES[stripPortalRoutePrefix(HOME_ROUTE)],
      },
      {
        title: "My Orders",
        href: MY_ORDERS_ROUTE,
        icon: LayoutDashboard,
        roles: FRONTEND_ROUTE_ROLES[stripPortalRoutePrefix(MY_ORDERS_ROUTE)],
      },
      {
        title: "Orders",
        href: ORDERS_ROUTE,
        icon: ShoppingBag,
        roles: FRONTEND_ROUTE_ROLES[stripPortalRoutePrefix(ORDERS_ROUTE)],
      },
      {
        title: "Customers",
        href: CUSTOMERS_ROUTE,
        icon: Users,
        roles: FRONTEND_ROUTE_ROLES[stripPortalRoutePrefix(CUSTOMERS_ROUTE)],
      },
      {
        title: "Employees",
        href: EMPLOYEES_ROUTE,
        icon: Briefcase,
        roles: FRONTEND_ROUTE_ROLES[stripPortalRoutePrefix(EMPLOYEES_ROUTE)],
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
        roles: FRONTEND_ROUTE_ROLES[stripPortalRoutePrefix(PAYMENTS_ROUTE)],
      },
      {
        title: "Expenses",
        href: EXPENSES_ROUTE,
        icon: Banknote,
        roles: FRONTEND_ROUTE_ROLES[stripPortalRoutePrefix(EXPENSES_ROUTE)],
      },
      {
        title: "Reports",
        href: REPORTS_ROUTE,
        icon: BarChart,
        roles: FRONTEND_ROUTE_ROLES[stripPortalRoutePrefix(REPORTS_ROUTE)],
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
        title: "Fabric Pricing",
        href: FABRICS_SETTINGS_ROUTE,
        icon: Package2,
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
        item.roles.includes(role) &&
        canRoleAccessPathname(role, stripPortalRoutePrefix(item.href)),
    ),
  })).filter((section) => section.items.length > 0);
}

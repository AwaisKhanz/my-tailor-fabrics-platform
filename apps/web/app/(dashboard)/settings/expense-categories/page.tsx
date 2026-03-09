"use client";

import { ExpenseCategoriesPage } from "@/components/config/expenses/expense-categories-page";
import { withRouteGuard } from "@/components/auth/with-role-guard";
import { EXPENSE_CATEGORIES_SETTINGS_ROUTE } from "@/lib/settings-routes";

function SettingsExpenseCategoriesPage() {
  return <ExpenseCategoriesPage />;
}

export default withRouteGuard(
  SettingsExpenseCategoriesPage,
  EXPENSE_CATEGORIES_SETTINGS_ROUTE,
);

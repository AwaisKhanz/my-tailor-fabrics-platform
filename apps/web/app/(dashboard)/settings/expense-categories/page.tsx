"use client";

import { ExpenseCategoriesPage } from "@/components/config/expenses/expense-categories-page";
import { withRouteGuard } from "@/components/auth/with-role-guard";

function SettingsExpenseCategoriesPage() {
  return <ExpenseCategoriesPage />;
}

export default withRouteGuard(
  SettingsExpenseCategoriesPage,
  "/settings/expense-categories",
);

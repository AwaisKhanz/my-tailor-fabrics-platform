"use client";

import { ExpenseCategoriesPage } from "@/components/config/expenses/expense-categories-page";
import { withRoleGuard } from "@/components/auth/with-role-guard";

function SettingsExpenseCategoriesPage() {
  return <ExpenseCategoriesPage />;
}

export default withRoleGuard(SettingsExpenseCategoriesPage, {
  all: ["settings.read", "expenses.read"],
});

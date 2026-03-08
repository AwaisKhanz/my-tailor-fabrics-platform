"use client";

import { ExpenseCategoriesPage } from "@/components/config/expenses/expense-categories-page";
import { withRoleGuard } from "@/components/auth/with-role-guard";
import { PERMISSION } from '@tbms/shared-constants';

function SettingsExpenseCategoriesPage() {
  return <ExpenseCategoriesPage />;
}

export default withRoleGuard(SettingsExpenseCategoriesPage, {
  all: [PERMISSION["settings.read"], PERMISSION["expenses.read"]],
});

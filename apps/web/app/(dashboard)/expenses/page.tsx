"use client";

import { withRoleGuard } from "@/components/auth/with-role-guard";
import { ExpensesPage } from "@/components/expenses/expenses-page";
import { PERMISSION } from "@tbms/shared-constants";

export default withRoleGuard(ExpensesPage, { all: [PERMISSION["expenses.manage"]] });

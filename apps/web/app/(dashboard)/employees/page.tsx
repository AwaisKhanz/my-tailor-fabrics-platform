"use client";

import { withRoleGuard } from "@/components/auth/with-role-guard";
import { EmployeesPage } from "@/components/employees/employees-page";
import { PERMISSION } from '@tbms/shared-constants';

export default withRoleGuard(EmployeesPage, { all: [PERMISSION["employees.read"]] });

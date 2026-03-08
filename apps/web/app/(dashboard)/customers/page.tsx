"use client";

import { CustomerTable } from "@/components/customers/CustomerTable";
import { withRoleGuard } from "@/components/auth/with-role-guard";
import { PERMISSION } from '@tbms/shared-constants';

function CustomersPage() {
  return <CustomerTable />;
}

export default withRoleGuard(CustomersPage, { all: [PERMISSION["customers.read"]] });

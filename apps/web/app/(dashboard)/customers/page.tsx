"use client";

import { CustomerTable } from "@/components/customers/CustomerTable";
import { withRoleGuard } from "@/components/auth/with-role-guard";

function CustomersPage() {
  return <CustomerTable />;
}

export default withRoleGuard(CustomersPage, { all: ["customers.read"] });

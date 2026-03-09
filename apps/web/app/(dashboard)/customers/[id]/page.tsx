"use client";

import { CustomerDetailPage } from "@/components/customers/detail/customer-detail-page";
import { useRequiredRouteParam } from "@/hooks/use-route-param";
import { withRoleGuard } from "@/components/auth/with-role-guard";
import { PERMISSION } from '@tbms/shared-constants';

function CustomerDetailRoutePage() {
  const customerId = useRequiredRouteParam("id");

  return customerId ? <CustomerDetailPage customerId={customerId} /> : null;
}

export default withRoleGuard(CustomerDetailRoutePage, {
  all: [PERMISSION["customers.read"]],
});

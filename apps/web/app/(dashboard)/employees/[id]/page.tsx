"use client";

import { useRequiredRouteParam } from "@/hooks/use-route-param";
import { withRoleGuard } from "@/components/auth/with-role-guard";
import { EmployeeDetailPage } from "@/components/employees/detail/employee-detail-page";
import { PERMISSION } from "@tbms/shared-constants";

function EmployeeDetailRoute() {
  const employeeId = useRequiredRouteParam("id");

  return <EmployeeDetailPage employeeId={employeeId} />;
}

export default withRoleGuard(EmployeeDetailRoute, { all: [PERMISSION["employees.read"]] });

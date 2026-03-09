"use client";

import { Role } from "@tbms/shared-types";
import { withRoleGuard } from "@/components/auth/with-role-guard";
import { PERMISSION } from "@tbms/shared-constants";
import { MyOrdersPage } from "@/components/orders/my-orders-page";

export default withRoleGuard(MyOrdersPage, {
  roles: [Role.EMPLOYEE],
  all: [PERMISSION["orders.read"]],
});

"use client";

import { withRoleGuard } from "@/components/auth/with-role-guard";
import { OrderFormPage } from "@/components/orders/order-form-page";
import { PERMISSION } from '@tbms/shared-constants';

export default withRoleGuard(OrderFormPage, {
  all: [PERMISSION["orders.create"]],
});

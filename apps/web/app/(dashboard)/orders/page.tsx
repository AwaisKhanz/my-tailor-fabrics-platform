"use client";

import { withRoleGuard } from "@/components/auth/with-role-guard";
import { OrdersPage } from "@/components/orders/orders-page";
import { PERMISSION } from '@tbms/shared-constants';

export default withRoleGuard(OrdersPage, { all: [PERMISSION["orders.read"]] });

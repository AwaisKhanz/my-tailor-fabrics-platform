"use client";

import { useRequiredRouteParam } from "@/hooks/use-route-param";
import { withRoleGuard } from "@/components/auth/with-role-guard";
import { OrderDetailPage } from "@/components/orders/order-detail-page";
import { PERMISSION } from "@tbms/shared-constants";

function OrderDetailRoute() {
  const orderId = useRequiredRouteParam("id");

  return <OrderDetailPage orderId={orderId} />;
}

export default withRoleGuard(OrderDetailRoute, { all: [PERMISSION["orders.read"]] });

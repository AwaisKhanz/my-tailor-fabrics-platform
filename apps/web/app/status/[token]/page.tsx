"use client";

import { OrderStatusPage } from "@/components/status/order-status-page";

export default function OrderStatusRoutePage({
  params,
}: {
  params: { token: string };
}) {
  return <OrderStatusPage token={params.token} />;
}

import { toPortalRoute } from '@/lib/portal-routing';
import { OrderStatus } from "@tbms/shared-types";

export const ORDERS_ROUTE = toPortalRoute("/orders");
export const MY_ORDERS_ROUTE = toPortalRoute("/my-orders");
export const NEW_ORDER_ROUTE = toPortalRoute("/orders/new");

export function buildOrderDetailRoute(orderId: string) {
  return `${ORDERS_ROUTE}/${orderId}`;
}

export function buildEditOrderRoute(orderId: string) {
  return `${NEW_ORDER_ROUTE}?edit=${orderId}`;
}

export function buildOrdersStatusRoute(status: OrderStatus) {
  return `${ORDERS_ROUTE}?status=${status}`;
}

export const OVERDUE_ORDERS_ROUTE = buildOrdersStatusRoute(
  OrderStatus.OVERDUE,
);

import { OrderStatus } from "@tbms/shared-types";

export const ORDERS_ROUTE = "/orders";
export const MY_ORDERS_ROUTE = "/my-orders";
export const NEW_ORDER_ROUTE = "/orders/new";

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

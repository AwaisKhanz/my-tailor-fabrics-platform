import { toPortalRoute } from '@/lib/portal-routing';

export const CUSTOMERS_ROUTE = toPortalRoute("/customers");
export const EMPLOYEES_ROUTE = toPortalRoute("/employees");

export function buildCustomerDetailRoute(customerId: string) {
  return `${CUSTOMERS_ROUTE}/${customerId}`;
}

export function buildEmployeeDetailRoute(employeeId: string) {
  return `${EMPLOYEES_ROUTE}/${employeeId}`;
}

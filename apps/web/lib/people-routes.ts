export const CUSTOMERS_ROUTE = "/customers";
export const EMPLOYEES_ROUTE = "/employees";

export function buildCustomerDetailRoute(customerId: string) {
  return `${CUSTOMERS_ROUTE}/${customerId}`;
}

export function buildEmployeeDetailRoute(employeeId: string) {
  return `${EMPLOYEES_ROUTE}/${employeeId}`;
}

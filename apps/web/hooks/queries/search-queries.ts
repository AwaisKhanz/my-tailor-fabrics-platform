"use client";

import { useQuery } from "@tanstack/react-query";
import type { Customer, Employee, Order } from "@tbms/shared-types";
import { customerApi } from "@/lib/api/customers";
import { employeesApi } from "@/lib/api/employees";
import { ordersApi } from "@/lib/api/orders";
import { searchKeys } from "@/lib/query-keys";

export interface GlobalSearchResults {
  orders: Order[];
  customers: Customer[];
  employees: Employee[];
}

const SEARCH_LIMIT = 6;

export function useGlobalSearchResults(term: string, enabled: boolean) {
  return useQuery({
    queryKey: searchKeys.global(term),
    queryFn: async (): Promise<GlobalSearchResults> => {
      const [ordersResponse, customersResponse, employeesResponse] =
        await Promise.all([
          ordersApi.getOrders({ page: 1, limit: SEARCH_LIMIT, search: term }),
          customerApi.getCustomers({
            page: 1,
            limit: SEARCH_LIMIT,
            search: term,
          }),
          employeesApi.getEmployees({
            page: 1,
            limit: SEARCH_LIMIT,
            search: term,
          }),
        ]);

      return {
        orders: ordersResponse.success ? ordersResponse.data.data : [],
        customers: customersResponse.success ? customersResponse.data.data : [],
        employees: employeesResponse.success ? employeesResponse.data.data : [],
      };
    },
    enabled,
    staleTime: 30 * 1000,
  });
}

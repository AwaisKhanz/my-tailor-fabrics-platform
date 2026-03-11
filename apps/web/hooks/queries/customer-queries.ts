"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "@/lib/api/customers";
import { customerKeys, orderKeys } from "@/lib/query-keys";
import type {
  CreateCustomerInput,
  CustomerOrdersQueryInput,
  CustomersListQueryInput,
  CustomersSummaryQueryInput,
  UpdateCustomerInput,
  UpsertCustomerMeasurementInput,
} from "@tbms/shared-types";

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useCustomersList(params: CustomersListQueryInput = {}) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customerApi.getCustomers(params),
  });
}

export function useCustomersSummary(params: CustomersSummaryQueryInput = {}) {
  return useQuery({
    queryKey: customerKeys.summary(params),
    queryFn: () => customerApi.getCustomersSummary(params),
  });
}

export function useCustomer(id: string | null) {
  return useQuery({
    queryKey: customerKeys.detail(id ?? ""),
    queryFn: () => customerApi.getCustomer(id!),
    enabled: !!id,
  });
}

export function useCustomerOrders(
  id: string | null,
  params: CustomerOrdersQueryInput = {},
) {
  return useQuery({
    queryKey: customerKeys.orders(id ?? "", params),
    queryFn: () => customerApi.getOrders(id!, params),
    enabled: !!id,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomerInput) => customerApi.createCustomer(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: customerKeys.all,
        predicate: (q) => q.queryKey.includes("summary"),
      });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerInput }) =>
      customerApi.updateCustomer(id, data),
    onSuccess: (_result, { id }) => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerApi.deleteCustomer(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: customerKeys.all,
        predicate: (q) => q.queryKey.includes("summary"),
      });
    },
  });
}

export function useUpsertCustomerMeasurements() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      customerId,
      categoryId,
      values,
    }: {
      customerId: string;
      categoryId: string;
      values: UpsertCustomerMeasurementInput["values"];
    }) => customerApi.upsertMeasurements(customerId, categoryId, values),
    onSuccess: (_result, { customerId }) => {
      void queryClient.invalidateQueries({
        queryKey: customerKeys.detail(customerId),
      });
      // Measurements can affect orders that reference them
      void queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

"use client";

import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { ordersApi } from "@/lib/api/orders";
import { orderKeys } from "@/lib/query-keys";
import type {
  AddOrderPaymentInput,
  CreateOrderInput,
  OrdersListQueryInput,
  OrdersSummaryQueryInput,
  ReverseOrderPaymentInput,
  TaskStatus,
  UpdateOrderInput,
  UpdateOrderStatusInput,
  UpdateOrderItemStatusInput,
  EligibleEmployeeQueryInput,
} from "@tbms/shared-types";

type EmployeesApi = typeof import("@/lib/api/employees").employeesApi;

type QueryOptions<TQueryFnData, TQueryKey extends readonly unknown[]> = Omit<
  UseQueryOptions<TQueryFnData, Error, TQueryFnData, TQueryKey>,
  "queryKey" | "queryFn"
>;

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useOrdersList(
  params: OrdersListQueryInput = {},
  options?: QueryOptions<
    Awaited<ReturnType<typeof ordersApi.getOrders>>,
    ReturnType<typeof orderKeys.list>
  >,
) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => ordersApi.getOrders(params),
    ...options,
  });
}

export function useOrdersSummary(
  params: OrdersSummaryQueryInput = {},
  options?: QueryOptions<
    Awaited<ReturnType<typeof ordersApi.getOrdersSummary>>,
    ReturnType<typeof orderKeys.summary>
  >,
) {
  return useQuery({
    queryKey: orderKeys.summary(params),
    queryFn: () => ordersApi.getOrdersSummary(params),
    ...options,
  });
}

export function useOrder(
  id: string | null,
  options?: QueryOptions<
    Awaited<ReturnType<typeof ordersApi.getOrder>>,
    ReturnType<typeof orderKeys.detail>
  >,
) {
  return useQuery({
    queryKey: orderKeys.detail(id ?? ""),
    queryFn: () => ordersApi.getOrder(id!),
    enabled: !!id,
    ...options,
  });
}

export function useEligibleEmployees(
  params: EligibleEmployeeQueryInput,
  options?: QueryOptions<
    Awaited<ReturnType<EmployeesApi["getEligibleEmployees"]>>,
    ReturnType<typeof orderKeys.eligible>
  >,
) {
  return useQuery({
    queryKey: orderKeys.eligible(params.garmentTypeId),
    queryFn: () =>
      import("@/lib/api/employees").then(({ employeesApi }) =>
        employeesApi.getEligibleEmployees(params),
      ),
    enabled: !!params.garmentTypeId,
    ...options,
  });
}

export function useTaskEligibleEmployees(
  taskId: string | null,
  options?: QueryOptions<
    Awaited<ReturnType<typeof ordersApi.getEligibleEmployeesForTask>>,
    ReturnType<typeof orderKeys.taskEligible>
  >,
) {
  return useQuery({
    queryKey: orderKeys.taskEligible(taskId ?? ""),
    queryFn: () => ordersApi.getEligibleEmployeesForTask(taskId!),
    enabled: !!taskId,
    ...options,
  });
}

export function useOrderTaskEligibleMap(taskIds: string[]) {
  return useQueries({
    queries: taskIds.map((taskId) => ({
      queryKey: orderKeys.taskEligible(taskId),
      queryFn: () => ordersApi.getEligibleEmployeesForTask(taskId),
      enabled: !!taskId,
    })),
  });
}

export function useTasksByEmployee(employeeId: string | null) {
  return useQuery({
    queryKey: orderKeys.employeeTasks(employeeId ?? ""),
    queryFn: () => ordersApi.getTasksByEmployee(employeeId!),
    enabled: !!employeeId,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderInput) => ordersApi.createOrder(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderInput }) =>
      ordersApi.updateOrder(id, data),
    onSuccess: (_result, { id }) => {
      void queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderStatusInput }) =>
      ordersApi.updateStatus(id, data),
    onSuccess: (_result, { id }) => {
      void queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      // Summary counts change when status changes
      void queryClient.invalidateQueries({
        queryKey: orderKeys.all,
        predicate: (q) => q.queryKey.includes("summary"),
      });
    },
  });
}

export function useAddOrderPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data: AddOrderPaymentInput;
    }) => ordersApi.addPayment(orderId, data),
    onSuccess: (_result, { orderId }) => {
      void queryClient.invalidateQueries({
        queryKey: orderKeys.detail(orderId),
      });
      // Payment affects order summary totals
      void queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

export function useReverseOrderPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      paymentId,
      data,
    }: {
      orderId: string;
      paymentId: string;
      data?: ReverseOrderPaymentInput;
    }) => ordersApi.reversePayment(orderId, paymentId, data),
    onSuccess: (_result, { orderId }) => {
      void queryClient.invalidateQueries({
        queryKey: orderKeys.detail(orderId),
      });
    },
  });
}

export function useShareOrder() {
  return useMutation({
    mutationFn: (orderId: string) => ordersApi.shareOrder(orderId),
  });
}

export function useOrderReceiptPdf() {
  return useMutation({
    mutationFn: (orderId: string) => ordersApi.getReceiptPdf(orderId),
  });
}

export function useUpdateOrderItemStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      itemId,
      data,
    }: {
      orderId: string;
      itemId: string;
      data: UpdateOrderItemStatusInput;
    }) => ordersApi.updateItem(orderId, itemId, data),
    onSuccess: (_result, { orderId }) => {
      void queryClient.invalidateQueries({
        queryKey: orderKeys.detail(orderId),
      });
    },
  });
}

export function useAssignOrderItemTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      employeeId,
      orderId,
    }: {
      orderId: string;
      taskId: string;
      employeeId: string | null;
    }) => ordersApi.assignTask(taskId, employeeId),
    // orderId passed along for cache invalidation only
    onSuccess: (_result, { orderId }) => {
      void queryClient.invalidateQueries({
        queryKey: orderKeys.detail(orderId),
      });
    },
  });
}

export function useUpdateOrderTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      status,
    }: {
      taskId: string;
      status: TaskStatus;
      orderId?: string;
    }) => ordersApi.updateTaskStatus(taskId, status),
    onSuccess: (_result, { orderId }) => {
      if (!orderId) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: orderKeys.detail(orderId),
      });
    },
  });
}

export function useUpdateOrderTaskRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      rate,
    }: {
      taskId: string;
      rate: number;
      orderId?: string;
    }) => ordersApi.updateTaskRate(taskId, rate),
    onSuccess: (_result, { orderId }) => {
      if (!orderId) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: orderKeys.detail(orderId),
      });
    },
  });
}

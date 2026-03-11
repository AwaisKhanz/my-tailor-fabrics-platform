"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeesApi } from "@/lib/api/employees";
import { employeeKeys, paymentKeys, ledgerKeys } from "@/lib/query-keys";
import type {
  AddEmployeeDocumentInput,
  CompensationChangeInput,
  CreateEmployeeInput,
  CreateEmployeeUserAccountInput,
  EmployeeCapabilitySnapshot,
  EmployeeItemsQueryInput,
  EmployeeListQueryInput,
  EligibleEmployeeQueryInput,
  UpdateEmployeeInput,
} from "@tbms/shared-types";

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useEmployeesList(params: EmployeeListQueryInput = {}) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => employeesApi.getEmployees(params),
  });
}

/** Flat list of all employees for select/dropdown use (limit 200). */
export function useEmployeesDropdown() {
  return useQuery({
    queryKey: employeeKeys.dropdown(),
    queryFn: () => employeesApi.getEmployees({ limit: 200 }),
    staleTime: 2 * 60 * 1000, // Names rarely change — cache longer
  });
}

export function useEmployee(id: string | null) {
  return useQuery({
    queryKey: employeeKeys.detail(id ?? ""),
    queryFn: () => employeesApi.getEmployee(id!),
    enabled: !!id,
  });
}

export function useEmployeeStats(id: string | null) {
  return useQuery({
    queryKey: employeeKeys.stats(id ?? ""),
    queryFn: () => employeesApi.getStats(id!),
    enabled: !!id,
  });
}

export function useEmployeeItems(
  id: string | null,
  params: EmployeeItemsQueryInput = {},
) {
  return useQuery({
    queryKey: employeeKeys.items(id ?? "", params),
    queryFn: () => employeesApi.getItems(id!, params),
    enabled: !!id,
  });
}

export function useEmployeeCapabilities(id: string | null) {
  return useQuery({
    queryKey: employeeKeys.capabilities(id ?? ""),
    queryFn: () => employeesApi.getCapabilities(id!),
    enabled: !!id,
  });
}

export function useEmployeeCompensationHistory(id: string | null) {
  return useQuery({
    queryKey: employeeKeys.compensation(id ?? ""),
    queryFn: () => employeesApi.getCompensationHistory(id!),
    enabled: !!id,
  });
}

export function useMyProfile() {
  return useQuery({
    queryKey: employeeKeys.myProfile(),
    queryFn: () => employeesApi.getMyProfile(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyStats() {
  return useQuery({
    queryKey: employeeKeys.myStats(),
    queryFn: () => employeesApi.getMyStats(),
  });
}

export function useMyItems() {
  return useQuery({
    queryKey: employeeKeys.myItems(),
    queryFn: () => employeesApi.getAssignedItems(),
  });
}

export function useEligibleEmployeesForItem(
  params: EligibleEmployeeQueryInput,
) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => employeesApi.getEligibleEmployees(params),
    enabled: !!params.garmentTypeId,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeInput) =>
      employeesApi.createEmployee(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeInput }) =>
      employeesApi.updateEmployee(id, data),
    onSuccess: (_result, { id }) => {
      void queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeesApi.deleteEmployee(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

export function useUploadEmployeeDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: AddEmployeeDocumentInput;
    }) => employeesApi.uploadDocument(id, data),
    onSuccess: (_result, { id }) => {
      void queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
    },
  });
}

export function useCreateEmployeeUserAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: CreateEmployeeUserAccountInput;
    }) => employeesApi.createUserAccount(id, data),
    onSuccess: (_result, { id }) => {
      void queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
    },
  });
}

export function useReplaceEmployeeCapabilities() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: EmployeeCapabilitySnapshot;
    }) => employeesApi.replaceCapabilities(id, data),
    onSuccess: (_result, { id }) => {
      void queryClient.invalidateQueries({
        queryKey: employeeKeys.capabilities(id),
      });
    },
  });
}

export function useCreateCompensationChange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompensationChangeInput }) =>
      employeesApi.createCompensationChange(id, data),
    onSuccess: (_result, { id }) => {
      void queryClient.invalidateQueries({
        queryKey: employeeKeys.compensation(id),
      });
      void queryClient.invalidateQueries({ queryKey: employeeKeys.stats(id) });
      // Compensation changes impact ledger and payments
      void queryClient.invalidateQueries({ queryKey: ledgerKeys.all });
      void queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    },
  });
}

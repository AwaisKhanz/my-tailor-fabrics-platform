"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api/users";
import { userKeys } from "@/lib/query-keys";
import type {
  CreateUserInput,
  UpdateUserInput,
  UserAccountsQueryInput,
} from "@tbms/shared-types";

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useUsersList(query: UserAccountsQueryInput = {}) {
  return useQuery({
    queryKey: userKeys.list(query),
    queryFn: () => usersApi.getUsers(query),
  });
}

export function useUsersStats() {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: () => usersApi.getStats(),
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserInput) => usersApi.createUser(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      usersApi.updateUser(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useSetUserActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersApi.setActive(id, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useRemoveUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.removeUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

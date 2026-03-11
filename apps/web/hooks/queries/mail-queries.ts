"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { mailApi } from "@/lib/api/mail";
import { configKeys } from "@/lib/query-keys";

export function useMailIntegrationStatus() {
  return useQuery({
    queryKey: configKeys.integrations(),
    queryFn: () => mailApi.getStatus(),
  });
}

export function useMailAuthUrl() {
  return useMutation({
    mutationFn: () => mailApi.getAuthUrl(),
  });
}

export function useSendTestMail() {
  return useMutation({
    mutationFn: (to: string) => mailApi.sendTestMail({ to }),
  });
}

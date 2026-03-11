"use client";

import { useMutation } from "@tanstack/react-query";
import { getPublicOrderStatus } from "@/lib/api/public-status";

export function usePublicOrderStatusLookup() {
  return useMutation({
    mutationFn: ({ token, pin }: { token: string; pin: string }) =>
      getPublicOrderStatus(token, pin),
  });
}

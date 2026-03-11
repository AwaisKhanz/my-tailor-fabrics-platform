"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceApi } from "@/lib/api/attendance";
import { attendanceKeys, employeeKeys } from "@/lib/query-keys";
import type { AttendanceListQueryInput } from "@tbms/shared-types";

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useAttendanceList(params: AttendanceListQueryInput = {}) {
  return useQuery({
    queryKey: attendanceKeys.list(params),
    queryFn: () => attendanceApi.getAttendance(params),
  });
}

export function useAttendanceEmployeeSummary(employeeId: string | null) {
  return useQuery({
    queryKey: attendanceKeys.employeeSummary(employeeId ?? ""),
    queryFn: () => attendanceApi.getEmployeeSummary(employeeId!),
    enabled: !!employeeId,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useClockIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeId, note }: { employeeId: string; note?: string }) =>
      attendanceApi.clockIn(employeeId, note),
    onSuccess: (_result, { employeeId }) => {
      void queryClient.invalidateQueries({
        queryKey: attendanceKeys.all,
      });
      void queryClient.invalidateQueries({
        queryKey: attendanceKeys.employeeSummary(employeeId),
      });
      void queryClient.invalidateQueries({
        queryKey: employeeKeys.stats(employeeId),
      });
    },
  });
}

export function useClockOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      recordId,
      employeeId,
    }: {
      recordId: string;
      /** passed through for targeted cache invalidation */
      employeeId: string;
    }) => attendanceApi.clockOut(recordId),
    onSuccess: (_result, { employeeId }) => {
      void queryClient.invalidateQueries({
        queryKey: attendanceKeys.all,
      });
      void queryClient.invalidateQueries({
        queryKey: attendanceKeys.employeeSummary(employeeId),
      });
      void queryClient.invalidateQueries({
        queryKey: employeeKeys.stats(employeeId),
      });
    },
  });
}

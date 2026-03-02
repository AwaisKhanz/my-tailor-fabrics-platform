import { api } from '../api';
import { ApiResponse, PaginatedResponse } from '@/types/common';
import type { AttendanceRecord, AttendanceSummary } from '@/types/attendance';

export const attendanceApi = {
  clockIn: async (employeeId: string, note?: string) => {
    const response = await api.post<ApiResponse<AttendanceRecord>>('/attendance/clock-in', {
      employeeId,
      note,
    });
    return response.data;
  },

  clockOut: async (recordId: string) => {
    const response = await api.post<ApiResponse<AttendanceRecord>>(
      `/attendance/clock-out/${recordId}`,
    );
    return response.data;
  },

  getAttendance: async (params: { employeeId?: string; page?: number; limit?: number }) => {
    const response = await api.get<ApiResponse<PaginatedResponse<AttendanceRecord>>>('/attendance', { params });
    return response.data;
  },

  getEmployeeSummary: async (employeeId: string) => {
    const response = await api.get<ApiResponse<AttendanceSummary>>(
      `/attendance/employee/${employeeId}/summary`,
    );
    return response.data;
  },
};

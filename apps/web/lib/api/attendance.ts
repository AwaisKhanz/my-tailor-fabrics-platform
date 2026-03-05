import { api } from '../api';
import type {
  ApiResponse,
  AttendanceListQueryInput,
  AttendanceListResult,
  AttendanceRecord,
  AttendanceSummary,
} from '@tbms/shared-types';

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

  getAttendance: async (params: AttendanceListQueryInput = {}) => {
    const response = await api.get<ApiResponse<AttendanceListResult>>(
      '/attendance',
      { params },
    );
    return response.data;
  },

  getEmployeeSummary: async (employeeId: string) => {
    const response = await api.get<ApiResponse<AttendanceSummary>>(
      `/attendance/employee/${employeeId}/summary`,
    );
    return response.data;
  },
};

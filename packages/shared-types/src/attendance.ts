import { PaginatedResponse } from './common';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  branchId: string;
  date: string;
  clockIn: string;
  clockOut?: string | null;
  hoursWorked?: number | null;
  note?: string | null;
  createdAt: string;
  employee?: {
    fullName: string;
    employeeCode: string;
    designation?: string | null;
  };
}

export interface AttendanceSummary {
  totalDays: number;
  totalHours: number;
  currentlyIn: AttendanceRecord | null;
  records: AttendanceRecord[];
}

export interface AttendanceListQueryInput {
  employeeId?: string;
  page?: number;
  limit?: number;
}

export type AttendanceListResult = PaginatedResponse<AttendanceRecord>;

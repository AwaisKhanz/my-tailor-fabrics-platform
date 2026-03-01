import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { AttendanceService } from './attendance.service';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    clockIn(employeeId: string, note: string | undefined, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            employee: {
                fullName: string;
                employeeCode: string;
            };
        } & {
            id: string;
            createdAt: Date;
            deletedAt: Date | null;
            employeeId: string;
            branchId: string;
            note: string | null;
            date: Date;
            clockIn: Date;
            clockOut: Date | null;
            hoursWorked: number | null;
        };
    }>;
    clockOut(recordId: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            employee: {
                fullName: string;
                employeeCode: string;
            };
        } & {
            id: string;
            createdAt: Date;
            deletedAt: Date | null;
            employeeId: string;
            branchId: string;
            note: string | null;
            date: Date;
            clockIn: Date;
            clockOut: Date | null;
            hoursWorked: number | null;
        };
    }>;
    findAll(employeeId: string | undefined, page: string, limit: string, req: AuthenticatedRequest): Promise<{
        data: ({
            employee: {
                fullName: string;
                employeeCode: string;
                designation: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            deletedAt: Date | null;
            employeeId: string;
            branchId: string;
            note: string | null;
            date: Date;
            clockIn: Date;
            clockOut: Date | null;
            hoursWorked: number | null;
        })[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
        success: boolean;
    }>;
    getEmployeeSummary(employeeId: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            totalDays: number;
            totalHours: number;
            currentlyIn: {
                id: string;
                createdAt: Date;
                deletedAt: Date | null;
                employeeId: string;
                branchId: string;
                note: string | null;
                date: Date;
                clockIn: Date;
                clockOut: Date | null;
                hoursWorked: number | null;
            } | undefined;
            records: {
                id: string;
                createdAt: Date;
                deletedAt: Date | null;
                employeeId: string;
                branchId: string;
                note: string | null;
                date: Date;
                clockIn: Date;
                clockOut: Date | null;
                hoursWorked: number | null;
            }[];
        };
    }>;
}

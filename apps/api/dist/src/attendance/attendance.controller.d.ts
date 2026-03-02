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
            branchId: string;
            employeeId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            note: string | null;
            clockIn: Date;
            date: Date;
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
            branchId: string;
            employeeId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            note: string | null;
            clockIn: Date;
            date: Date;
            clockOut: Date | null;
            hoursWorked: number | null;
        };
    }>;
    findAll(employeeId: string | undefined, page: string, limit: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            data: ({
                employee: {
                    fullName: string;
                    employeeCode: string;
                    designation: string | null;
                };
            } & {
                id: string;
                branchId: string;
                employeeId: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                note: string | null;
                clockIn: Date;
                date: Date;
                clockOut: Date | null;
                hoursWorked: number | null;
            })[];
            total: number;
        };
    }>;
    getEmployeeSummary(employeeId: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            totalDays: number;
            totalHours: number;
            currentlyIn: {
                id: string;
                branchId: string;
                employeeId: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                note: string | null;
                clockIn: Date;
                date: Date;
                clockOut: Date | null;
                hoursWorked: number | null;
            } | undefined;
            records: {
                id: string;
                branchId: string;
                employeeId: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                note: string | null;
                clockIn: Date;
                date: Date;
                clockOut: Date | null;
                hoursWorked: number | null;
            }[];
        };
    }>;
}

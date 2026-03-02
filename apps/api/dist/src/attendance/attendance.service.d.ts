import { PrismaService } from '../prisma/prisma.service';
export declare class AttendanceService {
    private prisma;
    constructor(prisma: PrismaService);
    clockIn(employeeId: string, branchId: string, note?: string): Promise<{
        employee: {
            employeeCode: string;
            fullName: string;
        };
    } & {
        id: string;
        date: Date;
        clockIn: Date;
        clockOut: Date | null;
        hoursWorked: number | null;
        note: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        employeeId: string;
        branchId: string;
    }>;
    clockOut(recordId: string, branchId: string): Promise<{
        employee: {
            employeeCode: string;
            fullName: string;
        };
    } & {
        id: string;
        date: Date;
        clockIn: Date;
        clockOut: Date | null;
        hoursWorked: number | null;
        note: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        employeeId: string;
        branchId: string;
    }>;
    findAll(branchId: string, employeeId?: string, page?: number, limit?: number): Promise<{
        data: ({
            employee: {
                employeeCode: string;
                fullName: string;
                designation: string | null;
            };
        } & {
            id: string;
            date: Date;
            clockIn: Date;
            clockOut: Date | null;
            hoursWorked: number | null;
            note: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            employeeId: string;
            branchId: string;
        })[];
        total: number;
    }>;
    getEmployeeSummary(employeeId: string, branchId: string): Promise<{
        totalDays: number;
        totalHours: number;
        currentlyIn: {
            id: string;
            date: Date;
            clockIn: Date;
            clockOut: Date | null;
            hoursWorked: number | null;
            note: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            employeeId: string;
            branchId: string;
        } | undefined;
        records: {
            id: string;
            date: Date;
            clockIn: Date;
            clockOut: Date | null;
            hoursWorked: number | null;
            note: string | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            employeeId: string;
            branchId: string;
        }[];
    }>;
}

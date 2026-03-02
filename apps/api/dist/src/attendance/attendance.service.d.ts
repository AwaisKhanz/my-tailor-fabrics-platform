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
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        employeeId: string;
        branchId: string;
        note: string | null;
        date: Date;
        clockIn: Date;
        clockOut: Date | null;
        hoursWorked: number | null;
    }>;
    clockOut(recordId: string, branchId: string): Promise<{
        employee: {
            employeeCode: string;
            fullName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        employeeId: string;
        branchId: string;
        note: string | null;
        date: Date;
        clockIn: Date;
        clockOut: Date | null;
        hoursWorked: number | null;
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
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            employeeId: string;
            branchId: string;
            note: string | null;
            date: Date;
            clockIn: Date;
            clockOut: Date | null;
            hoursWorked: number | null;
        })[];
        total: number;
    }>;
    getEmployeeSummary(employeeId: string, branchId: string): Promise<{
        totalDays: number;
        totalHours: number;
        currentlyIn: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
            updatedAt: Date;
            deletedAt: Date | null;
            employeeId: string;
            branchId: string;
            note: string | null;
            date: Date;
            clockIn: Date;
            clockOut: Date | null;
            hoursWorked: number | null;
        }[];
    }>;
}

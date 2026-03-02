import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '@tbms/shared-types';
import { LedgerService } from '../ledger/ledger.service';
export declare class TasksService {
    private readonly prisma;
    private readonly ledgerService;
    constructor(prisma: PrismaService, ledgerService: LedgerService);
    assignTask(taskId: string, employeeId: string, branchId: string, assignedById: string, userRole: string): Promise<{
        assignedEmployee: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            phone: string;
            deletedAt: Date | null;
            branchId: string;
            employeeCode: string;
            cnic: string | null;
            fullName: string;
            fatherName: string | null;
            phone2: string | null;
            city: string | null;
            dateOfBirth: Date | null;
            dateOfJoining: Date;
            designation: string | null;
            paymentType: import(".prisma/client").$Enums.PaymentType;
            accountNumber: string | null;
            emergencyName: string | null;
            emergencyPhone: string | null;
            photoUrl: string | null;
            status: import(".prisma/client").$Enums.EmployeeStatus;
            notes: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        sortOrder: number;
        stepKey: string;
        stepName: string;
        stepTemplateId: string | null;
        status: import(".prisma/client").$Enums.TaskStatus;
        notes: string | null;
        completedAt: Date | null;
        orderItemId: string;
        assignedEmployeeId: string | null;
        startedAt: Date | null;
        rateCardId: string | null;
        rateOverride: number | null;
        rateSnapshot: number | null;
    }>;
    updateTaskStatus(taskId: string, status: TaskStatus, branchId: string, updatedById: string): Promise<{
        assignedEmployee: {
            id: string;
            fullName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        sortOrder: number;
        stepKey: string;
        stepName: string;
        stepTemplateId: string | null;
        status: import(".prisma/client").$Enums.TaskStatus;
        notes: string | null;
        completedAt: Date | null;
        orderItemId: string;
        assignedEmployeeId: string | null;
        startedAt: Date | null;
        rateCardId: string | null;
        rateOverride: number | null;
        rateSnapshot: number | null;
    }>;
    findAllByOrder(orderId: string, branchId: string): Promise<({
        orderItem: {
            description: string | null;
            garmentTypeName: string;
        };
        assignedEmployee: {
            id: string;
            fullName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        sortOrder: number;
        stepKey: string;
        stepName: string;
        stepTemplateId: string | null;
        status: import(".prisma/client").$Enums.TaskStatus;
        notes: string | null;
        completedAt: Date | null;
        orderItemId: string;
        assignedEmployeeId: string | null;
        startedAt: Date | null;
        rateCardId: string | null;
        rateOverride: number | null;
        rateSnapshot: number | null;
    })[]>;
    findAllByEmployee(employeeId: string, branchId: string): Promise<({
        orderItem: {
            garmentTypeName: string;
            order: {
                orderNumber: string;
                dueDate: Date;
            };
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        sortOrder: number;
        stepKey: string;
        stepName: string;
        stepTemplateId: string | null;
        status: import(".prisma/client").$Enums.TaskStatus;
        notes: string | null;
        completedAt: Date | null;
        orderItemId: string;
        assignedEmployeeId: string | null;
        startedAt: Date | null;
        rateCardId: string | null;
        rateOverride: number | null;
        rateSnapshot: number | null;
    })[]>;
    updateTaskRate(taskId: string, rateOverride: number, branchId: string, userRole: string): Promise<{
        assignedEmployee: {
            id: string;
            fullName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        sortOrder: number;
        stepKey: string;
        stepName: string;
        stepTemplateId: string | null;
        status: import(".prisma/client").$Enums.TaskStatus;
        notes: string | null;
        completedAt: Date | null;
        orderItemId: string;
        assignedEmployeeId: string | null;
        startedAt: Date | null;
        rateCardId: string | null;
        rateOverride: number | null;
        rateSnapshot: number | null;
    }>;
}

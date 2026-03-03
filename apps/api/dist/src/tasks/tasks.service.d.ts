import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '@tbms/shared-types';
export declare class TasksService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    assignTask(taskId: string, employeeId: string, branchId: string, userRole: string): Promise<{
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
        designTypeId: string | null;
        assignedEmployeeId: string | null;
        rateOverride: number | null;
        rateSnapshot: number | null;
        orderItemId: string;
        startedAt: Date | null;
        rateCardId: string | null;
    }>;
    updateTaskStatus(taskId: string, status: TaskStatus, branchId: string, updatedById: string, userRole: string, requesterEmployeeId: string | null): Promise<{
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
        designTypeId: string | null;
        assignedEmployeeId: string | null;
        rateOverride: number | null;
        rateSnapshot: number | null;
        orderItemId: string;
        startedAt: Date | null;
        rateCardId: string | null;
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
        designTypeId: string | null;
        assignedEmployeeId: string | null;
        rateOverride: number | null;
        rateSnapshot: number | null;
        orderItemId: string;
        startedAt: Date | null;
        rateCardId: string | null;
    })[]>;
    findAllByEmployee(employeeId: string, branchId: string, userRole: string, requesterEmployeeId: string | null): Promise<({
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
        designTypeId: string | null;
        assignedEmployeeId: string | null;
        rateOverride: number | null;
        rateSnapshot: number | null;
        orderItemId: string;
        startedAt: Date | null;
        rateCardId: string | null;
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
        designTypeId: string | null;
        assignedEmployeeId: string | null;
        rateOverride: number | null;
        rateSnapshot: number | null;
        orderItemId: string;
        startedAt: Date | null;
        rateCardId: string | null;
    }>;
}

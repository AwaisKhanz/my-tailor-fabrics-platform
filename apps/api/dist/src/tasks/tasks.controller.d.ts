import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { TasksService } from './tasks.service';
import { TaskStatus } from '@tbms/shared-types';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    assignTask(id: string, employeeId: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    updateStatus(id: string, status: TaskStatus, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    updateRate(id: string, rateOverride: number, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    findByOrder(orderId: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: ({
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
        })[];
    }>;
    findByEmployee(employeeId: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: ({
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
        })[];
    }>;
}

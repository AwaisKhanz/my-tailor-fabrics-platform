import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { TasksService } from './tasks.service';
import { TaskStatus } from '@tbms/shared-types';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    assignTask(id: string, employeeId: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
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
        };
    }>;
    updateStatus(id: string, status: TaskStatus, req: AuthenticatedRequest): Promise<{
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
            orderItemId: string;
            assignedEmployeeId: string | null;
            startedAt: Date | null;
            rateCardId: string | null;
            rateOverride: number | null;
            rateSnapshot: number | null;
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
            orderItemId: string;
            assignedEmployeeId: string | null;
            startedAt: Date | null;
            rateCardId: string | null;
            rateOverride: number | null;
            rateSnapshot: number | null;
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
            orderItemId: string;
            assignedEmployeeId: string | null;
            startedAt: Date | null;
            rateCardId: string | null;
            rateOverride: number | null;
            rateSnapshot: number | null;
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
            orderItemId: string;
            assignedEmployeeId: string | null;
            startedAt: Date | null;
            rateCardId: string | null;
            rateOverride: number | null;
            rateSnapshot: number | null;
        })[];
    }>;
}

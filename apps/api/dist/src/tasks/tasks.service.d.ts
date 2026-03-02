import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '@tbms/shared-types';
export declare class TasksService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    assignTask(taskId: string, employeeId: string, branchId: string, assignedById: string, userRole: string): Promise<any>;
    updateTaskStatus(taskId: string, status: TaskStatus, branchId: string, updatedById: string): Promise<any>;
    findAllByOrder(orderId: string, branchId: string): Promise<any>;
    findAllByEmployee(employeeId: string, branchId: string): Promise<any>;
}

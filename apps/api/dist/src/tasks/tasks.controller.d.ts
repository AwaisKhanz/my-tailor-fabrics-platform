import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { TasksService } from './tasks.service';
import { TaskStatus } from '@tbms/shared-types';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    assignTask(id: string, employeeId: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: any;
    }>;
    updateStatus(id: string, status: TaskStatus, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: any;
    }>;
    findByOrder(orderId: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: any;
    }>;
    findByEmployee(employeeId: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: any;
    }>;
}

import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { ReportsService } from './reports.service';
import { ExportService } from './export.service';
export declare class ReportsController {
    private readonly reportsService;
    private readonly exportService;
    constructor(reportsService: ReportsService, exportService: ExportService);
    getDashboard(req: AuthenticatedRequest, targetBranchId?: string): Promise<{
        success: boolean;
        data: {
            revenue: number;
            expenses: number;
            outstandingBalances: number;
            overdueOrders: number;
        };
    }>;
    private resolveBranch;
    exportOrders(req: AuthenticatedRequest, res: import('express').Response, targetBranchId?: string, from?: string, to?: string): Promise<void>;
    exportPayments(req: AuthenticatedRequest, res: import('express').Response, targetBranchId?: string, from?: string, to?: string): Promise<void>;
    exportExpenses(req: AuthenticatedRequest, res: import('express').Response, targetBranchId?: string, from?: string, to?: string): Promise<void>;
    exportEmployees(req: AuthenticatedRequest, res: import('express').Response, targetBranchId?: string): Promise<void>;
}

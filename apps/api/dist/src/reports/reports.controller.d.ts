import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { ReportsService } from './reports.service';
import { ExportService } from './export.service';
import { PdfExportService } from './pdf-export.service';
export declare class ReportsController {
    private readonly reportsService;
    private readonly exportService;
    private readonly pdfExportService;
    constructor(reportsService: ReportsService, exportService: ExportService, pdfExportService: PdfExportService);
    getDashboard(req: AuthenticatedRequest, targetBranchId?: string): Promise<{
        success: boolean;
        data: {
            revenue: number;
            expenses: number;
            outstandingBalances: number;
            overdueOrders: number;
            overdueCount: number;
            totalOrders: number;
            newToday: number;
            totalOutstandingBalance: number;
            totalCustomers: number;
            activeEmployees: number;
            recentOrders: any;
        };
    }>;
    getDesigns(req: AuthenticatedRequest, targetBranchId?: string, from?: string, to?: string): Promise<{
        success: boolean;
        data: {
            name: string;
            count: number;
            revenue: number;
            payout: number;
        }[];
    }>;
    getAddons(req: AuthenticatedRequest, targetBranchId?: string, from?: string, to?: string): Promise<{
        success: boolean;
        data: {
            type: string;
            count: number;
            total: number;
        }[];
    }>;
    getSummary(req: AuthenticatedRequest, targetBranchId?: string, from?: string, to?: string): Promise<{
        success: boolean;
        data: {
            totalDesignRevenue: number;
            totalAddonRevenue: number;
            designs: {
                name: string;
                count: number;
                revenue: number;
                payout: number;
            }[];
            addons: {
                type: string;
                count: number;
                total: number;
            }[];
            revenue: number;
            expenses: number;
            outstandingBalances: number;
            overdueOrders: number;
            overdueCount: number;
            totalOrders: number;
            newToday: number;
            totalOutstandingBalance: number;
            totalCustomers: number;
            activeEmployees: number;
            recentOrders: any;
        };
    }>;
    getRevenueVsExpenses(req: AuthenticatedRequest, targetBranchId?: string, months?: number): Promise<{
        success: boolean;
        data: {
            revenue: {
                month: Date;
                total: number;
            }[];
            expenses: {
                month: Date;
                total: number;
            }[];
        };
    }>;
    getGarmentRevenue(req: AuthenticatedRequest, targetBranchId?: string): Promise<{
        success: boolean;
        data: {
            label: string;
            value: number;
        }[];
    }>;
    getEmployeeProductivity(req: AuthenticatedRequest, targetBranchId?: string): Promise<{
        success: boolean;
        data: {
            label: string;
            value: number;
        }[];
    }>;
    private resolveBranch;
    exportOrders(req: AuthenticatedRequest, res: import('express').Response, targetBranchId?: string, from?: string, to?: string, format?: string): Promise<void>;
    exportPayments(req: AuthenticatedRequest, res: import('express').Response, targetBranchId?: string, from?: string, to?: string, format?: string): Promise<void>;
    exportExpenses(req: AuthenticatedRequest, res: import('express').Response, targetBranchId?: string, from?: string, to?: string, format?: string): Promise<void>;
    exportEmployees(req: AuthenticatedRequest, res: import('express').Response, targetBranchId?: string): Promise<void>;
}

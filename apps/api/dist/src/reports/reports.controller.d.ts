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
            recentOrders: ({
                customer: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    address: string | null;
                    phone: string;
                    deletedAt: Date | null;
                    email: string | null;
                    branchId: string;
                    fullName: string;
                    city: string | null;
                    status: import(".prisma/client").$Enums.CustomerStatus;
                    notes: string | null;
                    sizeNumber: string;
                    whatsapp: string | null;
                    isVip: boolean;
                    lifetimeValue: number;
                };
                items: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    employeeId: string | null;
                    employeeRate: number;
                    description: string | null;
                    garmentTypeId: string;
                    status: import(".prisma/client").$Enums.ItemStatus;
                    dueDate: Date | null;
                    garmentTypeName: string;
                    quantity: number;
                    unitPrice: number;
                    completedAt: Date | null;
                    fabricSource: import(".prisma/client").$Enums.FabricSource;
                    pieceNo: number;
                    designTypeId: string | null;
                    orderId: string;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                branchId: string;
                createdById: string;
                status: import(".prisma/client").$Enums.OrderStatus;
                notes: string | null;
                orderNumber: string;
                shareToken: string | null;
                customerId: string;
                orderDate: Date;
                dueDate: Date;
                subtotal: number;
                discountType: import(".prisma/client").$Enums.DiscountType | null;
                discountValue: number;
                discountAmount: number;
                totalAmount: number;
                totalPaid: number;
                balanceDue: number;
                sharePin: string | null;
            })[];
        };
    }>;
    getDesigns(req: AuthenticatedRequest, targetBranchId?: string, from?: string, to?: string): Promise<{
        success: boolean;
        data: import("@tbms/shared-types").DesignAnalytics[];
    }>;
    getAddons(req: AuthenticatedRequest, targetBranchId?: string, from?: string, to?: string): Promise<{
        success: boolean;
        data: import("@tbms/shared-types").AddonAnalytics[];
    }>;
    getSummary(req: AuthenticatedRequest, targetBranchId?: string, from?: string, to?: string): Promise<{
        success: boolean;
        data: {
            totalDesignRevenue: number;
            totalAddonRevenue: number;
            designs: import("@tbms/shared-types").DesignAnalytics[];
            addons: import("@tbms/shared-types").AddonAnalytics[];
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
            recentOrders: ({
                customer: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    address: string | null;
                    phone: string;
                    deletedAt: Date | null;
                    email: string | null;
                    branchId: string;
                    fullName: string;
                    city: string | null;
                    status: import(".prisma/client").$Enums.CustomerStatus;
                    notes: string | null;
                    sizeNumber: string;
                    whatsapp: string | null;
                    isVip: boolean;
                    lifetimeValue: number;
                };
                items: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    employeeId: string | null;
                    employeeRate: number;
                    description: string | null;
                    garmentTypeId: string;
                    status: import(".prisma/client").$Enums.ItemStatus;
                    dueDate: Date | null;
                    garmentTypeName: string;
                    quantity: number;
                    unitPrice: number;
                    completedAt: Date | null;
                    fabricSource: import(".prisma/client").$Enums.FabricSource;
                    pieceNo: number;
                    designTypeId: string | null;
                    orderId: string;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                branchId: string;
                createdById: string;
                status: import(".prisma/client").$Enums.OrderStatus;
                notes: string | null;
                orderNumber: string;
                shareToken: string | null;
                customerId: string;
                orderDate: Date;
                dueDate: Date;
                subtotal: number;
                discountType: import(".prisma/client").$Enums.DiscountType | null;
                discountValue: number;
                discountAmount: number;
                totalAmount: number;
                totalPaid: number;
                balanceDue: number;
                sharePin: string | null;
            })[];
        };
    }>;
    getRevenueVsExpenses(req: AuthenticatedRequest, targetBranchId?: string, months?: number): Promise<{
        success: boolean;
        data: import("@tbms/shared-types").RevenueVsExpenses;
    }>;
    getGarmentRevenue(req: AuthenticatedRequest, targetBranchId?: string): Promise<{
        success: boolean;
        data: import("@tbms/shared-types").GarmentRevenue[];
    }>;
    getEmployeeProductivity(req: AuthenticatedRequest, targetBranchId?: string): Promise<{
        success: boolean;
        data: import("@tbms/shared-types").EmployeeProductivity[];
    }>;
    private resolveBranch;
    exportOrders(req: AuthenticatedRequest, res: import('express').Response, targetBranchId?: string, from?: string, to?: string, format?: string): Promise<void>;
    exportPayments(req: AuthenticatedRequest, res: import('express').Response, targetBranchId?: string, from?: string, to?: string, format?: string): Promise<void>;
    exportExpenses(req: AuthenticatedRequest, res: import('express').Response, targetBranchId?: string, from?: string, to?: string, format?: string): Promise<void>;
    exportEmployees(req: AuthenticatedRequest, res: import('express').Response, targetBranchId?: string): Promise<void>;
}

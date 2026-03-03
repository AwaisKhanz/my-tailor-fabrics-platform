import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { PaymentsService } from './payments.service';
import { DisbursePaymentDto } from './dto/payment.dto';
import { WeeklyPdfService } from './weekly-pdf.service';
export declare class PaymentsController {
    private readonly paymentsService;
    private readonly weeklyPdfService;
    constructor(paymentsService: PaymentsService, weeklyPdfService: WeeklyPdfService);
    getSummary(employeeId: string): Promise<{
        success: boolean;
        data: {
            totalEarned: number;
            totalPaid: number;
            currentBalance: number;
            weekly: {
                week_start: Date;
                earned: number;
                paid: number;
                closing_balance: number;
            }[];
        };
    }>;
    disbursePay(dto: DisbursePaymentDto, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            employeeId: string;
            amount: number;
            paidAt: Date;
            note: string | null;
            processedById: string;
        };
    }>;
    getHistory(employeeId: string, page: string, limit: string, from?: string, to?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            employeeId: string;
            amount: number;
            paidAt: Date;
            note: string | null;
            processedById: string;
        }[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
        success: boolean;
    }>;
    getWeeklyReport(): Promise<{
        success: boolean;
        data: unknown;
    }>;
    getWeeklyReportPdf(res: import('express').Response): Promise<void>;
}

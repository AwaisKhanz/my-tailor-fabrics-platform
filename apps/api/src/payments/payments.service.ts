import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { LedgerService } from '../ledger/ledger.service';
import { LedgerEntryType } from '@tbms/shared-types';

@Injectable()
export class PaymentsService {
    constructor(
      private readonly prisma: PrismaService,
      private readonly ledgerService: LedgerService,
    ) {}

    async getEmployeeBalanceSummary(employeeId: string) {
        // Use ledger as single source of truth for balance
        const balance = await this.ledgerService.getBalance(employeeId);
        const weekly = await this.getWeeklyBreakdown(employeeId);
        return {
            totalEarned: balance.totalEarned,
            totalPaid: balance.totalDeducted,
            currentBalance: balance.currentBalance,
            weekly,
        };
    }

    async getWeeklyBreakdown(employeeId: string, weeksBack = 8) {
        const earnings = await this.ledgerService.getEarningsByPeriod(employeeId, weeksBack);
        // Map Ledger earnings to the format expected by the legacy weekly breakdown if needed, 
        // or just return the ledger results.
        return earnings.map(item => ({
            week_start: item.period,
            earned: item.earned,
            paid: item.paid,
            closing_balance: item.closingBalance
        }));
    }

    async disbursePay(
        employeeId: string,
        amount: number,
        processedById: string,
        branchId: string,
        note?: string,
    ) {
        const summary = await this.getEmployeeBalanceSummary(employeeId);

        if (amount > summary.currentBalance) {
            throw new UnprocessableEntityException({
                code: 'PAYMENT_EXCEEDS_BALANCE',
                message: `Cannot disburse ${amount / 100}. Balance is ${summary.currentBalance / 100}`
            });
        }

        const payment = await this.prisma.payment.create({
            data: { employeeId, amount, processedById, note }
        });

        // Auto-create PAYOUT ledger entry (negative amount) linked to the payment
        await this.ledgerService.createEntry({
            employeeId,
            branchId,
            type: LedgerEntryType.PAYOUT,
            amount: -amount,
            paymentId: payment.id,
            createdById: processedById,
            note: note || 'Salary payment',
        });

        return payment;
    }

    async getHistory(employeeId: string, page = 1, limit = 20, sortBy?: string, sortOrder?: 'asc' | 'desc') {
        const skip = (page - 1) * limit;

        const orderBy: Prisma.PaymentOrderByWithRelationInput = {};
        if (sortBy) {
            (orderBy as Record<string, 'asc' | 'desc'>)[sortBy] = sortOrder || 'desc';
        } else {
            orderBy.paidAt = 'desc';
        }

        const [data, total] = await Promise.all([
            this.prisma.payment.findMany({
                where: { employeeId, deletedAt: null },
                skip,
                take: limit,
                orderBy
            }),
            this.prisma.payment.count({ where: { employeeId, deletedAt: null } })
        ]);
        
        return {
            data,
            meta: { total, page, lastPage: Math.ceil(total / limit) }
        };
    }

    async getWeeklyReport() {
        return this.prisma.$queryRaw`
            SELECT
                e.id as "employeeId",
                e."fullName" as "employeeName",
                e."employeeCode" as "employeeCode",
                SUM(p.amount) as "paidThisWeek"
            FROM "Payment" p
            JOIN "Employee" e ON e.id = p."employeeId"
            WHERE p."paidAt" >= date_trunc('week', NOW() AT TIME ZONE 'Asia/Karachi')
            GROUP BY e.id, e."fullName", e."employeeCode"
            ORDER BY "paidThisWeek" DESC
        `;
    }
}

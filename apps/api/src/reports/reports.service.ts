import { Injectable } from '@nestjs/common';
import { OrderStatus, ItemStatus } from '@tbms/shared-types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
    constructor(private readonly prisma: PrismaService) {}

    async getDashboardStats(branchId?: string) {
        // Build base filters if branch scoping is required
        const baseOrderWhere = branchId ? { branchId, deletedAt: null } : { deletedAt: null };
        const baseExpenseWhere = branchId ? { branchId, deletedAt: null } : { deletedAt: null };

        // 1. Revenue (Sum of all order payments)
        const revenue = await this.prisma.orderPayment.aggregate({
            _sum: { amount: true },
            where: { order: baseOrderWhere }
        });

        // 2. Expenses (Sum of all expenses)
        const expenses = await this.prisma.expense.aggregate({
            _sum: { amount: true },
            where: baseExpenseWhere
        });

        // 3. Outstanding Employee Balances
        // Total Earned (Items + Tasks)
        const earnedConditionItem = branchId ? `AND o."branchId" = '${branchId}'` : '';
        const earnedConditionTask = branchId ? `AND o."branchId" = '${branchId}'` : '';
        
        const totalEarnedQuery = await this.prisma.$queryRawUnsafe<[{ total: bigint }]> (`
            SELECT (
                (SELECT COALESCE(SUM(oi."employeeRate" * oi.quantity), 0) FROM "OrderItem" oi JOIN "Order" o ON o.id = oi."orderId" WHERE oi.status IN ('COMPLETED', 'DELIVERED') AND o."deletedAt" IS NULL ${earnedConditionItem})
                +
                (SELECT COALESCE(SUM(COALESCE(oit."rateOverride", oit."rateSnapshot", 0)), 0) FROM "OrderItemTask" oit JOIN "OrderItem" oi ON oi.id = oit."orderItemId" JOIN "Order" o ON o.id = oi."orderId" WHERE oit.status = 'DONE' AND o."deletedAt" IS NULL ${earnedConditionTask})
            ) AS total
        `);
        
        // Total Disbursed (Wait, payments aren't strictly scoped to branch unless restricted via employees. Since employees belong to a branch, we can scope it)
        const employeeCondition = branchId ? { employee: { branchId, deletedAt: null } } : { employee: { deletedAt: null } };
        const totalPaid = await this.prisma.payment.aggregate({
            _sum: { amount: true },
            where: employeeCondition
        });

        const totalEarned = Number(totalEarnedQuery[0]?.total ?? 0);
        const paidOut = totalPaid._sum.amount ?? 0;
        const outstandingBalances = totalEarned - paidOut;

        // 4. Overdue Orders count
        const overdueOrders = await this.prisma.order.count({
            where: {
                ...baseOrderWhere,
                status: OrderStatus.OVERDUE
            }
        });

        return {
            revenue: revenue._sum.amount ?? 0,
            expenses: expenses._sum.amount ?? 0,
            outstandingBalances,
            overdueOrders
        };
    }

    async getRevenueVsExpenses(branchId?: string, months: number = 6) {
        const branchConditionOrder = branchId ? `AND o."branchId" = '${branchId}'` : '';
        const branchConditionExpense = branchId ? `AND e."branchId" = '${branchId}'` : '';

        // Generate series of months (using Postgres generate_series or basic date_trunc)
        const revenueRaw = await this.prisma.$queryRawUnsafe<{ month: Date, total: bigint }[]>(`
            SELECT date_trunc('month', op."paidAt") as month, SUM(op.amount) as total
            FROM "OrderPayment" op
            JOIN "Order" o ON o.id = op."orderId"
            WHERE op."paidAt" >= NOW() - INTERVAL '${months} months'
            AND o."deletedAt" IS NULL
            ${branchConditionOrder}
            GROUP BY month
            ORDER BY month ASC
        `);

        const expenseRaw = await this.prisma.$queryRawUnsafe<{ month: Date, total: bigint }[]>(`
            SELECT date_trunc('month', e."expenseDate") as month, SUM(e.amount) as total
            FROM "Expense" e
            WHERE e."expenseDate" >= NOW() - INTERVAL '${months} months'
            AND e."deletedAt" IS NULL
            ${branchConditionExpense}
            GROUP BY month
            ORDER BY month ASC
        `);

        // Format to a clean combined array (Skipping exhaustive date padding for simplicity, typically done on frontend or via generate_series)
        return {
            revenue: revenueRaw.map(r => ({ month: r.month, total: Number(r.total) })),
            expenses: expenseRaw.map(e => ({ month: e.month, total: Number(e.total) })),
        };
    }

    async getGarmentTypesRevenue(branchId?: string) {
        const branchCondition = branchId ? `AND o."branchId" = '${branchId}'` : '';
        
        const result = await this.prisma.$queryRawUnsafe<{ label: string, value: bigint }[]>(`
            SELECT oi."garmentTypeName" as label, SUM(oi."unitPrice" * oi.quantity) as value
            FROM "OrderItem" oi
            JOIN "Order" o ON o.id = oi."orderId"
            WHERE oi.status NOT IN ('CANCELLED')
            AND o."deletedAt" IS NULL
            ${branchCondition}
            GROUP BY oi."garmentTypeName"
            ORDER BY value DESC
        `);

        return result.map(r => ({ label: r.label, value: Number(r.value) }));
    }

    async getEmployeeProductivity(branchId?: string) {
        const branchConditionItem = branchId ? `AND o."branchId" = '${branchId}'` : '';
        const branchConditionTask = branchId ? `AND o."branchId" = '${branchId}'` : '';
        
        const result = await this.prisma.$queryRawUnsafe<{ label: string, value: bigint }[]>(`
            WITH item_prod AS (
                SELECT emp.id, emp."fullName" as label, SUM(oi.quantity) as value
                FROM "OrderItem" oi
                JOIN "Order" o ON o.id = oi."orderId"
                JOIN "Employee" emp ON emp.id = oi."employeeId"
                WHERE oi.status IN ('COMPLETED', 'DELIVERED')
                AND o."deletedAt" IS NULL
                AND emp."deletedAt" IS NULL
                ${branchConditionItem}
                GROUP BY emp.id, emp."fullName"
            ),
            task_prod AS (
                SELECT emp.id, emp."fullName" as label, COUNT(oit.id) as value
                FROM "OrderItemTask" oit
                JOIN "OrderItem" oi ON oi.id = oit."orderItemId"
                JOIN "Order" o ON o.id = oi."orderId"
                JOIN "Employee" emp ON emp.id = oit."assignedEmployeeId"
                WHERE oit.status = 'DONE'
                AND o."deletedAt" IS NULL
                AND emp."deletedAt" IS NULL
                ${branchConditionTask}
                GROUP BY emp.id, emp."fullName"
            ),
            combined_prod AS (
                SELECT label, SUM(value) as value
                FROM (
                    SELECT label, value FROM item_prod
                    UNION ALL
                    SELECT label, value FROM task_prod
                ) s
                GROUP BY label
            )
            SELECT label, value
            FROM combined_prod
            ORDER BY value DESC
            LIMIT 10
        `);

        return result.map(r => ({ label: r.label, value: Number(r.value) }));
    }
}

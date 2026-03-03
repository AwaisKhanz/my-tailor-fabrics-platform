import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import * as stream from 'stream';

@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  // Utility for returning Excel
  private async exportToStream(
    workbook: ExcelJS.Workbook,
  ): Promise<stream.PassThrough> {
    const passThrough = new stream.PassThrough();
    await workbook.xlsx.write(passThrough);
    passThrough.end();
    return passThrough;
  }

  async exportOrders(branchId?: string, from?: string, to?: string) {
    const where: import('@prisma/client').Prisma.OrderWhereInput = branchId
      ? { branchId }
      : {};
    if (from && to) {
      where.orderDate = { gte: new Date(from), lte: new Date(to) };
    } else if (from) {
      where.orderDate = { gte: new Date(from) };
    } else if (to) {
      where.orderDate = { lte: new Date(to) };
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: { customer: true, items: true, branch: true },
      orderBy: { orderDate: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Orders');

    sheet.columns = [
      { header: 'Order Number', key: 'orderNumber', width: 20 },
      { header: 'Date', key: 'orderDate', width: 20 },
      { header: 'Customer', key: 'customer', width: 25 },
      { header: 'Branch', key: 'branch', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'SubTotal (Rs)', key: 'subtotal', width: 15 },
      { header: 'Discount (Rs)', key: 'discount', width: 15 },
      { header: 'Total (Rs)', key: 'total', width: 15 },
      { header: 'Paid (Rs)', key: 'paid', width: 15 },
      { header: 'Balance Due (Rs)', key: 'balanceDue', width: 15 },
      { header: 'Items Count', key: 'itemsCount', width: 15 },
    ];

    orders.forEach((o) => {
      sheet.addRow({
        orderNumber: o.orderNumber,
        orderDate: o.orderDate.toISOString().split('T')[0],
        customer: o.customer.fullName,
        branch: o.branch.name,
        status: o.status,
        subtotal: o.subtotal / 100,
        discount: o.discountAmount / 100,
        total: o.totalAmount / 100,
        paid: o.totalPaid / 100,
        balanceDue: o.balanceDue / 100,
        itemsCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
      });
    });

    return this.exportToStream(workbook);
  }

  async exportPayments(branchId?: string, from?: string, to?: string) {
    const where: import('@prisma/client').Prisma.PaymentWhereInput = {};
    if (branchId) where.employee = { branchId };

    let dateFilter: import('@prisma/client').Prisma.DateTimeFilter | undefined;
    if (from && to) dateFilter = { gte: new Date(from), lte: new Date(to) };
    else if (from) dateFilter = { gte: new Date(from) };
    else if (to) dateFilter = { lte: new Date(to) };

    if (dateFilter) where.paidAt = dateFilter;

    const payments = await this.prisma.payment.findMany({
      where,
      include: { employee: true, processedBy: true },
      orderBy: { paidAt: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Payments');

    sheet.columns = [
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Employee', key: 'employee', width: 25 },
      { header: 'Amount (Rs)', key: 'amount', width: 15 },
      { header: 'Processed By', key: 'processedBy', width: 25 },
      { header: 'Notes', key: 'note', width: 40 },
    ];

    payments.forEach((p) =>
      sheet.addRow({
        date: p.paidAt.toISOString().split('T')[0],
        employee: p.employee.fullName,
        amount: p.amount / 100,
        processedBy: p.processedBy.email,
        note: p.note,
      }),
    );

    return this.exportToStream(workbook);
  }

  async exportExpenses(branchId?: string, from?: string, to?: string) {
    const where: import('@prisma/client').Prisma.ExpenseWhereInput = branchId
      ? { branchId }
      : {};

    let dateFilter: import('@prisma/client').Prisma.DateTimeFilter | undefined;
    if (from && to) dateFilter = { gte: new Date(from), lte: new Date(to) };
    else if (from) dateFilter = { gte: new Date(from) };
    else if (to) dateFilter = { lte: new Date(to) };

    if (dateFilter) where.expenseDate = dateFilter;

    const expenses = await this.prisma.expense.findMany({
      where,
      orderBy: { expenseDate: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Expenses');

    sheet.columns = [
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Branch ID', key: 'branchId', width: 20 },
      { header: 'Category ID', key: 'categoryId', width: 20 },
      { header: 'Amount (Rs)', key: 'amount', width: 15 },
      { header: 'Description', key: 'description', width: 35 },
      { header: 'Added By (ID)', key: 'addedById', width: 25 },
    ];

    expenses.forEach((e) =>
      sheet.addRow({
        date: e.expenseDate.toISOString().split('T')[0],
        branchId: e.branchId,
        categoryId: e.categoryId,
        amount: e.amount / 100,
        description: e.description,
        addedById: e.addedById,
      }),
    );

    return this.exportToStream(workbook);
  }

  async exportEmployeeSummaries(branchId?: string) {
    // Let's use Prisma to pull all employees, and calculate totals in TS to prevent crazy string manipulation natively here
    const employees = await this.prisma.employee.findMany({
      where: branchId ? { branchId } : {},
      include: { branch: true },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Employee Summaries');

    sheet.columns = [
      { header: 'Code', key: 'code', width: 10 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Branch', key: 'branch', width: 20 },
      { header: 'Lifetime Earned (Rs)', key: 'earned', width: 20 },
      { header: 'Lifetime Paid (Rs)', key: 'paid', width: 20 },
      { header: 'Current Balance (Rs)', key: 'balance', width: 20 },
    ];

    for (const emp of employees) {
      const raw = await this.prisma.$queryRaw<[{ earned: bigint }]>`
        SELECT COALESCE(SUM("employeeRate" * quantity), 0) AS earned
        FROM "OrderItem"
        WHERE "employeeId" = ${emp.id} AND status IN ('COMPLETED', 'DELIVERED')
      `;

      const paid = await this.prisma.payment.aggregate({
        where: { employeeId: emp.id },
        _sum: { amount: true },
      });

      const earnedAmt = Number(raw[0]?.earned ?? 0);
      const paidAmt = paid._sum.amount ?? 0;

      sheet.addRow({
        code: emp.employeeCode,
        name: emp.fullName,
        branch: emp.branch.name,
        earned: earnedAmt / 100,
        paid: paidAmt / 100,
        balance: (earnedAmt - paidAmt) / 100,
      });
    }

    return this.exportToStream(workbook);
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Prisma } from '@prisma/client';
import {
  createPdfStream,
  drawPdfHeader,
  drawPdfTable,
  formatPdfCurrency,
  formatPdfDate,
  getPdfContentWidth,
  PdfDocument,
} from '../common/utils/pdf-render.util';

function getColumnWidths(totalWidth: number, ratios: number[]): number[] {
  const widths = ratios.map((ratio) => totalWidth * ratio);
  const usedWidth = widths.slice(0, -1).reduce((sum, width) => sum + width, 0);
  widths[widths.length - 1] = totalWidth - usedWidth;
  return widths;
}

function drawReportHeader(
  doc: PdfDocument,
  title: string,
  generatedOn: string,
): void {
  drawPdfHeader(doc, title, `Generated on ${generatedOn}`);
}

@Injectable()
export class PdfExportService {
  constructor(private readonly prisma: PrismaService) {}

  async exportOrdersPdf(
    branchId?: string,
    from?: string,
    to?: string,
  ): Promise<NodeJS.ReadableStream> {
    const where: Prisma.OrderWhereInput = {
      deletedAt: null,
      ...(branchId ? { branchId } : {}),
    };
    if (from && to) {
      where.orderDate = { gte: new Date(from), lte: new Date(to) };
    } else if (from) {
      where.orderDate = { gte: new Date(from) };
    } else if (to) {
      where.orderDate = { lte: new Date(to) };
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: { customer: true, branch: true },
      orderBy: { orderDate: 'desc' },
    });
    const generatedOn = formatPdfDate(new Date());

    return createPdfStream(
      (doc) => {
        const renderHeader = (currentDoc: PdfDocument) => {
          drawReportHeader(currentDoc, 'Order Report Ledger', generatedOn);
        };

        renderHeader(doc);

        const columnWidths = getColumnWidths(
          getPdfContentWidth(doc),
          [0.15, 0.15, 0.2, 0.15, 0.15, 0.2],
        );

        drawPdfTable(
          doc,
          [
            {
              header: 'Order #',
              width: columnWidths[0],
              value: (row) => row.orderNumber,
            },
            {
              header: 'Date',
              width: columnWidths[1],
              value: (row) => formatPdfDate(row.orderDate),
            },
            {
              header: 'Customer',
              width: columnWidths[2],
              value: (row) => row.customer?.fullName || 'N/A',
            },
            {
              header: 'Status',
              width: columnWidths[3],
              value: (row) => row.status,
            },
            {
              header: 'Total Paid',
              width: columnWidths[4],
              align: 'right',
              value: (row) =>
                formatPdfCurrency(row.totalPaid, { withPrefix: false }),
            },
            {
              header: 'Balance Due',
              width: columnWidths[5],
              align: 'right',
              value: (row) =>
                formatPdfCurrency(row.balanceDue, { withPrefix: false }),
            },
          ],
          orders,
          {
            pageHeader: renderHeader,
          },
        );
      },
      {
        layout: 'landscape',
      },
    );
  }

  async exportPaymentsPdf(
    branchId?: string,
    from?: string,
    to?: string,
  ): Promise<NodeJS.ReadableStream> {
    const where: Prisma.PaymentWhereInput = { deletedAt: null };
    if (branchId) {
      where.employee = { branchId };
    }

    let dateFilter: Prisma.DateTimeFilter | undefined;
    if (from && to) {
      dateFilter = { gte: new Date(from), lte: new Date(to) };
    } else if (from) {
      dateFilter = { gte: new Date(from) };
    } else if (to) {
      dateFilter = { lte: new Date(to) };
    }
    if (dateFilter) {
      where.paidAt = dateFilter;
    }

    const payments = await this.prisma.payment.findMany({
      where,
      include: { employee: true, processedBy: true },
      orderBy: { paidAt: 'desc' },
    });
    const generatedOn = formatPdfDate(new Date());

    return createPdfStream((doc) => {
      const renderHeader = (currentDoc: PdfDocument) => {
        drawReportHeader(currentDoc, 'Employee Payroll Report', generatedOn);
      };

      renderHeader(doc);

      const columnWidths = getColumnWidths(
        getPdfContentWidth(doc),
        [0.25, 0.35, 0.2, 0.2],
      );

      drawPdfTable(
        doc,
        [
          {
            header: 'Date',
            width: columnWidths[0],
            value: (row) => formatPdfDate(row.paidAt),
          },
          {
            header: 'Employee',
            width: columnWidths[1],
            value: (row) => row.employee?.fullName || 'N/A',
          },
          {
            header: 'Amount (Rs)',
            width: columnWidths[2],
            align: 'right',
            value: (row) =>
              formatPdfCurrency(row.amount, { withPrefix: false }),
          },
          {
            header: 'Ref/Note',
            width: columnWidths[3],
            value: (row) => row.note || '--',
          },
        ],
        payments,
        {
          pageHeader: renderHeader,
        },
      );
    });
  }

  async exportExpensesPdf(
    branchId?: string,
    from?: string,
    to?: string,
  ): Promise<NodeJS.ReadableStream> {
    const where: Prisma.ExpenseWhereInput = {
      deletedAt: null,
      ...(branchId ? { branchId } : {}),
    };

    let dateFilter: Prisma.DateTimeFilter | undefined;
    if (from && to) {
      dateFilter = { gte: new Date(from), lte: new Date(to) };
    } else if (from) {
      dateFilter = { gte: new Date(from) };
    } else if (to) {
      dateFilter = { lte: new Date(to) };
    }
    if (dateFilter) {
      where.expenseDate = dateFilter;
    }

    const expenses = await this.prisma.expense.findMany({
      where,
      orderBy: { expenseDate: 'desc' },
    });
    const generatedOn = formatPdfDate(new Date());

    return createPdfStream((doc) => {
      const renderHeader = (currentDoc: PdfDocument) => {
        drawReportHeader(currentDoc, 'Expense Audit Log', generatedOn);
      };

      renderHeader(doc);

      const columnWidths = getColumnWidths(
        getPdfContentWidth(doc),
        [0.2, 0.2, 0.6],
      );

      drawPdfTable(
        doc,
        [
          {
            header: 'Date',
            width: columnWidths[0],
            value: (row) => formatPdfDate(row.expenseDate),
          },
          {
            header: 'Amount (Rs)',
            width: columnWidths[1],
            align: 'right',
            value: (row) =>
              formatPdfCurrency(row.amount, { withPrefix: false }),
          },
          {
            header: 'Description',
            width: columnWidths[2],
            value: (row) => row.description || '--',
          },
        ],
        expenses,
        {
          pageHeader: renderHeader,
        },
      );
    });
  }
}

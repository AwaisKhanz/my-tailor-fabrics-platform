import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToStream } from '@react-pdf/renderer';
import type { Order, Customer, Branch, Payment, Employee, User, Expense } from '@prisma/client';

const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#FFFFFF', padding: 30 },
  header: { fontSize: 20, marginBottom: 5, textAlign: 'center', fontWeight: 'bold' },
  subHeader: { fontSize: 10, marginBottom: 20, textAlign: 'center', color: '#666' },
  section: { flexGrow: 1 },
  table: { display: 'flex', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { margin: 'auto', flexDirection: 'row' },
  tableColHeader: { width: '20%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#f4f4f5' },
  tableCol: { width: '20%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 },
  tableCellHeader: { margin: 5, fontSize: 10, fontWeight: 'bold' },
  tableCell: { margin: 5, fontSize: 9 },
});

// ----------------------------------------------------------------------
// Orders PDF Template
// ----------------------------------------------------------------------
const OrdersDocument = ({ orders, title }: { orders: any[], title: string }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <Text style={styles.header}>{title}</Text>
      <Text style={styles.subHeader}>Generated on {new Date().toLocaleDateString()}</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={{...styles.tableColHeader, width: '15%'}}><Text style={styles.tableCellHeader}>Order #</Text></View>
          <View style={{...styles.tableColHeader, width: '15%'}}><Text style={styles.tableCellHeader}>Date</Text></View>
          <View style={{...styles.tableColHeader, width: '20%'}}><Text style={styles.tableCellHeader}>Customer</Text></View>
          <View style={{...styles.tableColHeader, width: '15%'}}><Text style={styles.tableCellHeader}>Status</Text></View>
          <View style={{...styles.tableColHeader, width: '15%'}}><Text style={styles.tableCellHeader}>Total Paid</Text></View>
          <View style={{...styles.tableColHeader, width: '20%'}}><Text style={styles.tableCellHeader}>Balance Due</Text></View>
        </View>
        {orders.map((o) => (
          <View style={styles.tableRow} key={o.id}>
            <View style={{...styles.tableCol, width: '15%'}}><Text style={styles.tableCell}>{o.orderNumber}</Text></View>
            <View style={{...styles.tableCol, width: '15%'}}><Text style={styles.tableCell}>{new Date(o.orderDate).toLocaleDateString()}</Text></View>
            <View style={{...styles.tableCol, width: '20%'}}><Text style={styles.tableCell}>{o.customer?.fullName || 'N/A'}</Text></View>
            <View style={{...styles.tableCol, width: '15%'}}><Text style={styles.tableCell}>{o.status}</Text></View>
            <View style={{...styles.tableCol, width: '15%'}}><Text style={styles.tableCell}>{(o.totalPaid / 100).toFixed(2)}</Text></View>
            <View style={{...styles.tableCol, width: '20%'}}><Text style={styles.tableCell}>{(o.balanceDue / 100).toFixed(2)}</Text></View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

// ----------------------------------------------------------------------
// Payments PDF Template
// ----------------------------------------------------------------------
const PaymentsDocument = ({ payments, title }: { payments: any[], title: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>{title}</Text>
      <Text style={styles.subHeader}>Generated on {new Date().toLocaleDateString()}</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={{...styles.tableColHeader, width: '25%'}}><Text style={styles.tableCellHeader}>Date</Text></View>
          <View style={{...styles.tableColHeader, width: '35%'}}><Text style={styles.tableCellHeader}>Employee</Text></View>
          <View style={{...styles.tableColHeader, width: '20%'}}><Text style={styles.tableCellHeader}>Amount (Rs)</Text></View>
          <View style={{...styles.tableColHeader, width: '20%'}}><Text style={styles.tableCellHeader}>Ref/Note</Text></View>
        </View>
        {payments.map((p) => (
          <View style={styles.tableRow} key={p.id}>
            <View style={{...styles.tableCol, width: '25%'}}><Text style={styles.tableCell}>{new Date(p.paidAt).toLocaleDateString()}</Text></View>
            <View style={{...styles.tableCol, width: '35%'}}><Text style={styles.tableCell}>{p.employee?.fullName || 'N/A'}</Text></View>
            <View style={{...styles.tableCol, width: '20%'}}><Text style={styles.tableCell}>{(p.amount / 100).toFixed(2)}</Text></View>
            <View style={{...styles.tableCol, width: '20%'}}><Text style={styles.tableCell}>{p.note || '--'}</Text></View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

// ----------------------------------------------------------------------
// Expenses PDF Template
// ----------------------------------------------------------------------
const ExpensesDocument = ({ expenses, title }: { expenses: any[], title: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>{title}</Text>
      <Text style={styles.subHeader}>Generated on {new Date().toLocaleDateString()}</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={{...styles.tableColHeader, width: '20%'}}><Text style={styles.tableCellHeader}>Date</Text></View>
          <View style={{...styles.tableColHeader, width: '20%'}}><Text style={styles.tableCellHeader}>Amount (Rs)</Text></View>
          <View style={{...styles.tableColHeader, width: '60%'}}><Text style={styles.tableCellHeader}>Description</Text></View>
        </View>
        {expenses.map((e) => (
          <View style={styles.tableRow} key={e.id}>
            <View style={{...styles.tableCol, width: '20%'}}><Text style={styles.tableCell}>{new Date(e.expenseDate).toLocaleDateString()}</Text></View>
            <View style={{...styles.tableCol, width: '20%'}}><Text style={styles.tableCell}>{(e.amount / 100).toFixed(2)}</Text></View>
            <View style={{...styles.tableCol, width: '60%'}}><Text style={styles.tableCell}>{e.description || '--'}</Text></View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

@Injectable()
export class PdfExportService {
  constructor(private readonly prisma: PrismaService) {}

  async exportOrdersPdf(branchId?: string, from?: string, to?: string): Promise<NodeJS.ReadableStream> {
    const where: import('@prisma/client').Prisma.OrderWhereInput = branchId ? { branchId } : {};
    if (from && to) where.orderDate = { gte: new Date(from), lte: new Date(to) };
    else if (from) where.orderDate = { gte: new Date(from) };
    else if (to) where.orderDate = { lte: new Date(to) };

    const orders = await this.prisma.order.findMany({
      where,
      include: { customer: true, branch: true },
      orderBy: { orderDate: 'desc' },
    });

    const element = React.createElement(OrdersDocument, { orders: orders as any, title: 'Order Report Ledger' });
    return renderToStream(element as never);
  }

  async exportPaymentsPdf(branchId?: string, from?: string, to?: string): Promise<NodeJS.ReadableStream> {
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

    const element = React.createElement(PaymentsDocument, { payments: payments as any, title: 'Employee Payroll Report' });
    return renderToStream(element as never);
  }

  async exportExpensesPdf(branchId?: string, from?: string, to?: string): Promise<NodeJS.ReadableStream> {
    const where: import('@prisma/client').Prisma.ExpenseWhereInput = branchId ? { branchId } : {};

    let dateFilter: import('@prisma/client').Prisma.DateTimeFilter | undefined;
    if (from && to) dateFilter = { gte: new Date(from), lte: new Date(to) };
    else if (from) dateFilter = { gte: new Date(from) };
    else if (to) dateFilter = { lte: new Date(to) };
    if (dateFilter) where.expenseDate = dateFilter;

    const expenses = await this.prisma.expense.findMany({
      where,
      orderBy: { expenseDate: 'desc' },
    });

    const element = React.createElement(ExpensesDocument, { expenses: expenses as any, title: 'Expense Audit Log' });
    return renderToStream(element as never);
  }
}

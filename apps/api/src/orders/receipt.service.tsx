import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToStream } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#FFFFFF', padding: 30 },
  header: { fontSize: 24, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  section: { margin: 10, padding: 10, flexGrow: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { fontSize: 12, fontWeight: 'bold' },
  value: { fontSize: 12 },
  title: { fontSize: 16, marginTop: 20, marginBottom: 10, fontWeight: 'bold', textDecoration: 'underline' },
  itemRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EEEEEE', paddingVertical: 5 },
  itemColName: { width: '50%', fontSize: 10 },
  itemColQty: { width: '15%', fontSize: 10, textAlign: 'center' },
  itemColPrice: { width: '35%', fontSize: 10, textAlign: 'right' },
  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
});

interface ReceiptOrder {
  orderNumber: string;
  orderDate: Date | string;
  customer: { fullName: string; phone: string; };
  branch: { name: string; };
  items: { id: string; garmentTypeName: string; quantity: number; unitPrice: number; }[];
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  totalPaid: number;
  balanceDue: number;
}

const ReceiptDocument = ({ order }: { order: ReceiptOrder }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>My Tailor &amp; Fabrics - Receipt</Text>
      
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Order #:</Text>
          <Text style={styles.value}>{order.orderNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{new Date(order.orderDate).toLocaleDateString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Customer:</Text>
          <Text style={styles.value}>{order.customer.fullName} ({order.customer.phone})</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Branch:</Text>
          <Text style={styles.value}>{order.branch.name}</Text>
        </View>

        <Text style={styles.title}>Items</Text>
        <View style={styles.itemRow}>
          <Text style={[styles.itemColName, { fontWeight: 'bold' }]}>Item</Text>
          <Text style={[styles.itemColQty, { fontWeight: 'bold' }]}>Qty</Text>
          <Text style={[styles.itemColPrice, { fontWeight: 'bold' }]}>Price</Text>
        </View>
        
        {order.items.map((item) => (
          <View style={styles.itemRow} key={item.id}>
            <Text style={styles.itemColName}>{item.garmentTypeName}</Text>
            <Text style={styles.itemColQty}>{item.quantity}</Text>
            <Text style={styles.itemColPrice}>Rs {(item.unitPrice / 100).toFixed(2)}</Text>
          </View>
        ))}

        <Text style={styles.title}>Summary</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Subtotal:</Text>
          <Text style={styles.value}>Rs {(order.subtotal / 100).toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Discount:</Text>
          <Text style={styles.value}>- Rs {(order.discountAmount / 100).toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total Amount:</Text>
          <Text style={styles.value}>Rs {(order.totalAmount / 100).toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total Paid:</Text>
          <Text style={styles.value}>Rs {(order.totalPaid / 100).toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Balance Due:</Text>
          <Text style={styles.value}>Rs {(order.balanceDue / 100).toFixed(2)}</Text>
        </View>
      </View>
    </Page>
  </Document>
);

@Injectable()
export class ReceiptService {
  constructor(private readonly prisma: PrismaService) {}

  async generateOrderReceipt(orderId: string, branchId: string): Promise<NodeJS.ReadableStream> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId, branchId },
      include: {
        customer: true,
        branch: true,
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found or access denied');
    }

    // Workaround for React 18 / React PDF typings issue
    const element = React.createElement(ReceiptDocument, { order: order as unknown as ReceiptOrder });
    return renderToStream(element as never);
  }
}

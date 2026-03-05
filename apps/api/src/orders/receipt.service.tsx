import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { renderPdfStream } from '../common/utils/pdf-render.util';

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
  items: { 
    id: string; 
    garmentTypeName: string; 
    quantity: number; 
    unitPrice: number;
    designType?: { name: string; defaultPrice: number } | null;
    addons?: { id: string; name: string; price: number }[];
  }[];
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  totalPaid: number;
  balanceDue: number;
}

type ReceiptOrderRecord = Prisma.OrderGetPayload<{
  include: {
    customer: true;
    branch: true;
    items: {
      include: {
        designType: true;
        addons: true;
      };
    };
  };
}>;

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
          <Text style={[styles.itemColPrice, { fontWeight: 'bold' }]}>Total Price</Text>
        </View>
        
        {order.items.map((item) => {
          const designPrice = item.designType?.defaultPrice || 0;
          const addonsPrice = item.addons?.reduce((sum, a) => sum + a.price, 0) || 0;
          const itemTotal = (item.unitPrice * item.quantity) + (designPrice * item.quantity) + addonsPrice;

          return (
            <View key={item.id} style={{ borderBottomWidth: 1, borderBottomColor: '#EEEEEE', paddingVertical: 5 }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.itemColName, { fontWeight: 'bold' }]}>{item.garmentTypeName}</Text>
                <Text style={styles.itemColQty}>{item.quantity}</Text>
                <Text style={styles.itemColPrice}>Rs {(itemTotal / 100).toFixed(2)}</Text>
              </View>
              {/* Optional Design Type Sub-row */}
              {item.designType && (
                <View style={{ flexDirection: 'row', marginTop: 2 }}>
                  <Text style={[styles.itemColName, { color: '#666666', fontSize: 9, paddingLeft: 10 }]}>
                    └ Design: {item.designType.name}
                  </Text>
                  <Text style={styles.itemColQty}></Text>
                  <Text style={[styles.itemColPrice, { color: '#666666', fontSize: 9 }]}>
                    (+Rs {(item.designType.defaultPrice / 100).toFixed(2)})
                  </Text>
                </View>
              )}
              {/* Optional Addons Sub-rows */}
              {item.addons && item.addons.length > 0 && item.addons.map(addon => (
                <View key={addon.id} style={{ flexDirection: 'row', marginTop: 2 }}>
                  <Text style={[styles.itemColName, { color: '#666666', fontSize: 9, paddingLeft: 10 }]}>
                    └ Addon: {addon.name}
                  </Text>
                  <Text style={styles.itemColQty}></Text>
                  <Text style={[styles.itemColPrice, { color: '#666666', fontSize: 9 }]}>
                    (+Rs {(addon.price / 100).toFixed(2)})
                  </Text>
                </View>
              ))}
            </View>
          );
        })}

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

  private toReceiptOrder(order: ReceiptOrderRecord): ReceiptOrder {
    return {
      orderNumber: order.orderNumber,
      orderDate: order.orderDate,
      customer: {
        fullName: order.customer.fullName,
        phone: order.customer.phone,
      },
      branch: {
        name: order.branch.name,
      },
      items: order.items.map((item) => ({
        id: item.id,
        garmentTypeName: item.garmentTypeName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        designType: item.designType
          ? {
              name: item.designType.name,
              defaultPrice: item.designType.defaultPrice,
            }
          : null,
        addons: item.addons.map((addon) => ({
          id: addon.id,
          name: addon.name,
          price: addon.price,
        })),
      })),
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      totalAmount: order.totalAmount,
      totalPaid: order.totalPaid,
      balanceDue: order.balanceDue,
    };
  }

  async generateOrderReceipt(
    orderId: string,
    branchId: string | null,
  ): Promise<NodeJS.ReadableStream> {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, ...(branchId ? { branchId } : {}) },
      include: {
        customer: true,
        branch: true,
        items: {
          where: { deletedAt: null },
          orderBy: { pieceNo: 'asc' },
          include: {
            designType: true,
            addons: { where: { deletedAt: null } }
          }
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found or access denied');
    }

    const receiptOrder = this.toReceiptOrder(order);

    const element = React.createElement(ReceiptDocument, {
      order: receiptOrder,
    });
    return renderPdfStream(element);
  }
}

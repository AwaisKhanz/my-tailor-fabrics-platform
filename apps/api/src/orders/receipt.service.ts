import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  createPdfStream,
  drawPdfHeader,
  drawPdfSectionTitle,
  ensurePdfSpace,
  formatPdfCurrency,
  formatPdfDate,
  getPdfContentWidth,
  PdfDocument,
} from '../common/utils/pdf-render.util';

const RECEIPT_TITLE = 'My Tailor & Fabrics - Receipt';
const HEADER_FILL = '#F4F4F5';
const BORDER_COLOR = '#E5E7EB';

interface ReceiptOrder {
  orderNumber: string;
  orderDate: Date | string;
  customer: { fullName: string; phone: string };
  branch: { name: string };
  items: {
    id: string;
    pieceNo: number;
    garmentTypeName: string;
    quantity: number;
    unitPrice: number;
    fabricSource: string;
    shopFabricNameSnapshot?: string | null;
    shopFabricPriceSnapshot?: number | null;
    shopFabricTotalSnapshot?: number | null;
    customerFabricNote?: string | null;
    designType?: { name: string; defaultPrice: number } | null;
    addons: { id: string; name: string; price: number }[];
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
        shopFabric: true;
      };
    };
  };
}>;

function measureText(
  doc: PdfDocument,
  text: string,
  width: number,
  fontSize: number,
  fontName: string,
): number {
  doc.font(fontName).fontSize(fontSize);
  return doc.heightOfString(text || ' ', { width: Math.max(width, 1) });
}

function drawReceiptInfoRow(
  doc: PdfDocument,
  label: string,
  value: string,
): void {
  ensurePdfSpace(doc, 18);

  const rowY = doc.y;
  const labelWidth = 120;
  const contentWidth = getPdfContentWidth(doc);
  const valueWidth = contentWidth - labelWidth;
  const labelHeight = measureText(doc, label, labelWidth, 11, 'Helvetica-Bold');
  const valueHeight = measureText(doc, value, valueWidth, 11, 'Helvetica');

  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor('#111827')
    .text(label, doc.page.margins.left, rowY, {
      width: labelWidth,
    });
  doc.font('Helvetica').text(value, doc.page.margins.left + labelWidth, rowY, {
    width: valueWidth,
    align: 'right',
  });

  doc.y = rowY + Math.max(labelHeight, valueHeight) + 6;
}

function drawItemTableHeader(doc: PdfDocument): void {
  ensurePdfSpace(doc, 24);

  const startX = doc.page.margins.left;
  const startY = doc.y;
  const contentWidth = getPdfContentWidth(doc);
  const nameWidth = contentWidth * 0.58;
  const qtyWidth = contentWidth * 0.12;
  const priceWidth = contentWidth - nameWidth - qtyWidth;
  const height = 24;

  const drawHeaderCell = (
    x: number,
    width: number,
    label: string,
    align: 'left' | 'center' | 'right' = 'left',
  ) => {
    doc
      .lineWidth(0.5)
      .rect(x, startY, width, height)
      .fillAndStroke(HEADER_FILL, BORDER_COLOR);
    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor('#111827')
      .text(label, x + 6, startY + 7, {
        width: Math.max(width - 12, 1),
        align,
      });
  };

  drawHeaderCell(startX, nameWidth, 'Item');
  drawHeaderCell(startX + nameWidth, qtyWidth, 'Qty', 'center');
  drawHeaderCell(
    startX + nameWidth + qtyWidth,
    priceWidth,
    'Total Price',
    'right',
  );

  doc.y = startY + height + 4;
}

function drawReceiptItem(
  doc: PdfDocument,
  item: ReceiptOrder['items'][number],
): void {
  const contentWidth = getPdfContentWidth(doc);
  const startX = doc.page.margins.left;
  const nameWidth = contentWidth * 0.58;
  const qtyWidth = contentWidth * 0.12;
  const priceWidth = contentWidth - nameWidth - qtyWidth;
  const designPrice = item.designType?.defaultPrice || 0;
  const addonsPrice =
    item.addons?.reduce((sum, addon) => sum + addon.price, 0) || 0;
  const shopFabricTotal = item.shopFabricTotalSnapshot || 0;
  const itemTotal =
    item.unitPrice * item.quantity +
    designPrice * item.quantity +
    addonsPrice +
    shopFabricTotal;
  const subRows = [
    {
      label: `Tailoring (${formatPdfCurrency(item.unitPrice)} x ${item.quantity})`,
      amount: formatPdfCurrency(item.unitPrice * item.quantity),
    },
    ...(item.designType
      ? [
          {
            label: `Design: ${item.designType.name}`,
            amount: `(+${formatPdfCurrency(item.designType.defaultPrice * item.quantity)})`,
          },
        ]
      : []),
    ...item.addons.map((addon) => ({
      label: `Addon: ${addon.name}`,
      amount: `(+${formatPdfCurrency(addon.price)})`,
    })),
    ...(shopFabricTotal > 0
      ? [
          {
            label: `Shop Fabric: ${item.shopFabricNameSnapshot || 'Fabric'}`,
            amount: `(+${formatPdfCurrency(shopFabricTotal)})`,
          },
        ]
      : []),
    ...(item.fabricSource === 'CUSTOMER' && item.customerFabricNote
      ? [
          {
            label: `Customer Fabric Note: ${item.customerFabricNote}`,
            amount: '',
          },
        ]
      : []),
  ];

  const mainHeight =
    Math.max(
      measureText(doc, item.garmentTypeName, nameWidth, 10, 'Helvetica-Bold'),
      measureText(doc, String(item.quantity), qtyWidth, 10, 'Helvetica'),
      measureText(
        doc,
        formatPdfCurrency(itemTotal),
        priceWidth,
        10,
        'Helvetica',
      ),
    ) + 4;
  const subRowHeight = subRows.reduce(
    (height, row) =>
      height +
      Math.max(
        measureText(doc, row.label, nameWidth - 10, 9, 'Helvetica'),
        measureText(doc, row.amount, priceWidth, 9, 'Helvetica'),
      ) +
      2,
    0,
  );
  const totalHeight = mainHeight + subRowHeight + 10;

  ensurePdfSpace(doc, totalHeight, (currentDoc) => {
    drawPdfSectionTitle(currentDoc, 'Items');
    drawItemTableHeader(currentDoc);
  });
  const rowY = doc.y;

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('#111827')
    .text(`Piece ${item.pieceNo} - ${item.garmentTypeName}`, startX, rowY, {
      width: nameWidth,
    });
  doc.font('Helvetica').text(String(item.quantity), startX + nameWidth, rowY, {
    width: qtyWidth,
    align: 'center',
  });
  doc.text(formatPdfCurrency(itemTotal), startX + nameWidth + qtyWidth, rowY, {
    width: priceWidth,
    align: 'right',
  });

  let currentY = rowY + mainHeight;
  for (const row of subRows) {
    const rowHeight =
      Math.max(
        measureText(doc, row.label, nameWidth - 10, 9, 'Helvetica'),
        measureText(doc, row.amount, priceWidth, 9, 'Helvetica'),
      ) + 2;

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#6B7280')
      .text(`- ${row.label}`, startX + 10, currentY, {
        width: nameWidth - 10,
      });
    doc.text(row.amount, startX + nameWidth + qtyWidth, currentY, {
      width: priceWidth,
      align: 'right',
    });
    currentY += rowHeight;
  }

  doc
    .moveTo(startX, currentY + 2)
    .lineTo(startX + contentWidth, currentY + 2)
    .lineWidth(0.5)
    .strokeColor(BORDER_COLOR)
    .stroke();
  doc.y = currentY + 8;
}

function renderReceipt(doc: PdfDocument, order: ReceiptOrder): void {
  drawPdfHeader(doc, RECEIPT_TITLE);
  drawReceiptInfoRow(doc, 'Order #:', order.orderNumber);
  drawReceiptInfoRow(doc, 'Date:', formatPdfDate(order.orderDate));
  drawReceiptInfoRow(
    doc,
    'Customer:',
    `${order.customer.fullName} (${order.customer.phone})`,
  );
  drawReceiptInfoRow(doc, 'Branch:', order.branch.name);

  drawPdfSectionTitle(doc, 'Items');
  drawItemTableHeader(doc);
  order.items.forEach((item) => drawReceiptItem(doc, item));

  drawPdfSectionTitle(doc, 'Summary');
  drawReceiptInfoRow(doc, 'Subtotal:', formatPdfCurrency(order.subtotal));
  drawReceiptInfoRow(
    doc,
    'Discount:',
    `- ${formatPdfCurrency(order.discountAmount)}`,
  );
  drawReceiptInfoRow(
    doc,
    'Total Amount:',
    formatPdfCurrency(order.totalAmount),
  );
  drawReceiptInfoRow(doc, 'Total Paid:', formatPdfCurrency(order.totalPaid));
  drawReceiptInfoRow(doc, 'Balance Due:', formatPdfCurrency(order.balanceDue));
}

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
        pieceNo: item.pieceNo,
        garmentTypeName: item.garmentTypeName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        fabricSource: item.fabricSource,
        shopFabricNameSnapshot:
          item.shopFabricNameSnapshot ?? item.shopFabric?.name ?? null,
        shopFabricPriceSnapshot: item.shopFabricPriceSnapshot,
        shopFabricTotalSnapshot: item.shopFabricTotalSnapshot,
        customerFabricNote: item.customerFabricNote,
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
            addons: { where: { deletedAt: null } },
            shopFabric: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found or access denied');
    }

    const receiptOrder = this.toReceiptOrder(order);

    return createPdfStream((doc) => {
      renderReceipt(doc, receiptOrder);
    });
  }
}

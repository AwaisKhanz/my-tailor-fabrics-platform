import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';

export type PdfDocument = PDFKit.PDFDocument;

export interface PdfTableColumn<Row> {
  header: string;
  width: number;
  align?: PDFKit.Mixins.TextOptions['align'];
  value: (row: Row) => string;
}

interface PdfTableOptions {
  startY?: number;
  left?: number;
  minRowHeight?: number;
  cellPadding?: number;
  headerFontSize?: number;
  rowFontSize?: number;
  borderColor?: string;
  headerFillColor?: string;
  pageHeader?: (doc: PdfDocument) => void;
}

const DEFAULT_MARGIN = 40;
const DEFAULT_BORDER_COLOR = '#D4D4D8';
const DEFAULT_HEADER_FILL = '#F4F4F5';

export function createPdfStream(
  render: (doc: PdfDocument) => void,
  options: PDFKit.PDFDocumentOptions = {},
): PassThrough {
  const doc = new PDFDocument({
    size: 'A4',
    margin: DEFAULT_MARGIN,
    ...options,
  });
  const stream = new PassThrough();

  doc.pipe(stream);
  render(doc);
  doc.end();

  return stream;
}

export function getPdfContentWidth(doc: PdfDocument): number {
  return doc.page.width - doc.page.margins.left - doc.page.margins.right;
}

export function formatPdfDate(value: Date | string): string {
  return new Date(value).toLocaleDateString();
}

export function formatPdfCurrency(
  amount: number,
  options: { withPrefix?: boolean } = {},
): string {
  const formatted = (amount / 100).toFixed(2);
  return options.withPrefix === false ? formatted : `Rs ${formatted}`;
}

export function ensurePdfSpace(
  doc: PdfDocument,
  height: number,
  pageHeader?: (doc: PdfDocument) => void,
): void {
  const bottom = doc.page.height - doc.page.margins.bottom;

  if (doc.y + height <= bottom) {
    return;
  }

  doc.addPage();
  pageHeader?.(doc);
}

export function drawPdfHeader(
  doc: PdfDocument,
  title: string,
  subtitle?: string,
): void {
  ensurePdfSpace(doc, subtitle ? 48 : 32);

  doc.font('Helvetica-Bold').fontSize(20).fillColor('#111827').text(title, {
    align: 'center',
  });

  if (subtitle) {
    doc
      .moveDown(0.2)
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#6B7280')
      .text(subtitle, { align: 'center' });
  }

  doc.moveDown(0.8);
}

export function drawPdfSectionTitle(doc: PdfDocument, title: string): void {
  ensurePdfSpace(doc, 28);

  doc.font('Helvetica-Bold').fontSize(14).fillColor('#111827').text(title);

  const lineY = doc.y + 2;
  doc
    .moveTo(doc.page.margins.left, lineY)
    .lineTo(doc.page.width - doc.page.margins.right, lineY)
    .lineWidth(0.5)
    .strokeColor(DEFAULT_BORDER_COLOR)
    .stroke();

  doc.moveDown(0.6);
}

function measureCellHeight(
  doc: PdfDocument,
  text: string,
  width: number,
  padding: number,
  fontSize: number,
  fontName: string,
  align: PDFKit.Mixins.TextOptions['align'] = 'left',
): number {
  doc.font(fontName).fontSize(fontSize);
  return (
    doc.heightOfString(text || ' ', {
      width: Math.max(width - padding * 2, 1),
      align,
    }) +
    padding * 2
  );
}

function drawCell(
  doc: PdfDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  options: {
    padding: number;
    fontName: string;
    fontSize: number;
    align?: PDFKit.Mixins.TextOptions['align'];
    fillColor?: string;
    borderColor: string;
    textColor: string;
  },
): void {
  if (options.fillColor) {
    doc
      .lineWidth(0.5)
      .rect(x, y, width, height)
      .fillAndStroke(options.fillColor, options.borderColor);
  } else {
    doc.lineWidth(0.5).rect(x, y, width, height).stroke(options.borderColor);
  }

  doc
    .font(options.fontName)
    .fontSize(options.fontSize)
    .fillColor(options.textColor)
    .text(text || ' ', x + options.padding, y + options.padding, {
      width: Math.max(width - options.padding * 2, 1),
      align: options.align ?? 'left',
    });
}

export function drawPdfTable<Row>(
  doc: PdfDocument,
  columns: PdfTableColumn<Row>[],
  rows: Row[],
  options: PdfTableOptions = {},
): number {
  const left = options.left ?? doc.page.margins.left;
  const padding = options.cellPadding ?? 6;
  const minRowHeight = options.minRowHeight ?? 22;
  const headerFontSize = options.headerFontSize ?? 10;
  const rowFontSize = options.rowFontSize ?? 9;
  const borderColor = options.borderColor ?? DEFAULT_BORDER_COLOR;
  const headerFillColor = options.headerFillColor ?? DEFAULT_HEADER_FILL;
  const bottom = () => doc.page.height - doc.page.margins.bottom;

  let y = options.startY ?? doc.y;

  const renderHeader = () => {
    const headerHeight = Math.max(
      minRowHeight,
      ...columns.map((column) =>
        measureCellHeight(
          doc,
          column.header,
          column.width,
          padding,
          headerFontSize,
          'Helvetica-Bold',
          column.align,
        ),
      ),
    );

    ensurePdfSpace(doc, headerHeight, options.pageHeader);
    y = doc.y;

    let x = left;
    for (const column of columns) {
      drawCell(doc, x, y, column.width, headerHeight, column.header, {
        padding,
        fontName: 'Helvetica-Bold',
        fontSize: headerFontSize,
        align: column.align,
        fillColor: headerFillColor,
        borderColor,
        textColor: '#111827',
      });
      x += column.width;
    }

    y += headerHeight;
    doc.y = y;
  };

  renderHeader();

  for (const row of rows) {
    const values = columns.map((column) => column.value(row) || '');
    const rowHeight = Math.max(
      minRowHeight,
      ...values.map((value, index) =>
        measureCellHeight(
          doc,
          value,
          columns[index].width,
          padding,
          rowFontSize,
          'Helvetica',
          columns[index].align,
        ),
      ),
    );

    if (y + rowHeight > bottom()) {
      doc.addPage();
      options.pageHeader?.(doc);
      y = doc.y;
      renderHeader();
    }

    let x = left;
    columns.forEach((column, index) => {
      drawCell(doc, x, y, column.width, rowHeight, values[index], {
        padding,
        fontName: 'Helvetica',
        fontSize: rowFontSize,
        align: column.align,
        borderColor,
        textColor: '#111827',
      });
      x += column.width;
    });

    y += rowHeight;
    doc.y = y;
  }

  doc.moveDown(0.4);
  return doc.y;
}

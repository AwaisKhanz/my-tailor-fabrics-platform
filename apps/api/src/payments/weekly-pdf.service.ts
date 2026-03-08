import { Injectable, NotFoundException } from '@nestjs/common';
import { WeeklyPaymentReportRow } from '@tbms/shared-types';
import {
  createPdfStream,
  drawPdfHeader,
  drawPdfTable,
  formatPdfCurrency,
  formatPdfDate,
  getPdfContentWidth,
  PdfDocument,
} from '../common/utils/pdf-render.util';

const REPORT_TITLE = 'Weekly Payment Report';

@Injectable()
export class WeeklyPdfService {
  generatePdfStream(
    data: WeeklyPaymentReportRow[],
  ): Promise<NodeJS.ReadableStream> {
    if (!data || data.length === 0) {
      return Promise.reject(
        new NotFoundException(
          'No payments found for this week to generate report.',
        ),
      );
    }

    const totalPaid = data.reduce((sum, row) => sum + row.paidThisWeek, 0);
    const generatedOn = formatPdfDate(new Date());

    return Promise.resolve(
      createPdfStream((doc) => {
        const renderHeader = (currentDoc: PdfDocument) => {
          drawPdfHeader(
            currentDoc,
            REPORT_TITLE,
            `Generated on: ${generatedOn}`,
          );
        };

        renderHeader(doc);

        const contentWidth = getPdfContentWidth(doc);
        const columnWidths = [
          contentWidth * 0.2,
          contentWidth * 0.35,
          contentWidth * 0.2,
        ];
        const signatureWidth =
          contentWidth - columnWidths.reduce((sum, width) => sum + width, 0);

        drawPdfTable(
          doc,
          [
            {
              header: 'Employee Code',
              width: columnWidths[0],
              value: (row) => row.employeeCode,
            },
            {
              header: 'Employee Name',
              width: columnWidths[1],
              value: (row) => row.employeeName,
            },
            {
              header: 'Paid This Week (Rs)',
              width: columnWidths[2],
              align: 'right',
              value: (row) =>
                formatPdfCurrency(row.paidThisWeek, { withPrefix: false }),
            },
            {
              header: 'Signature',
              width: signatureWidth,
              value: () => '',
            },
          ],
          data,
          {
            minRowHeight: 24,
            rowFontSize: 10,
            pageHeader: renderHeader,
          },
        );

        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .fillColor('#111827')
          .text(`Grand Total Paid: ${formatPdfCurrency(totalPaid)}`, {
            align: 'right',
          });
        doc.moveDown(1);
        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor('#6B7280')
          .text(
            '*This is a computer-generated document tracking cash disbursements.',
            { align: 'center' },
          );
      }),
    );
  }
}

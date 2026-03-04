import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { WeeklyPaymentReportRow } from '@tbms/shared-types';

const styles = StyleSheet.create({
    page: { padding: 30, fontSize: 12, fontFamily: 'Helvetica' },
    header: { fontSize: 20, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
    subHeader: { fontSize: 12, marginBottom: 20, textAlign: 'center', color: '#555' },
    table: { display: 'flex', flexDirection: 'column', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#bfbfbf' },
    tableRow: { margin: 'auto', flexDirection: 'row' },
    tableColHeader: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderColor: '#bfbfbf', backgroundColor: '#f0f0f0', padding: 5 },
    tableCol: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderColor: '#bfbfbf', padding: 5 },
    tableCellHeader: { margin: 'auto', fontSize: 10, fontWeight: 'bold' },
    tableCell: { margin: 'auto', fontSize: 10 },
    footer: { marginTop: 30, fontSize: 10, textAlign: 'center', color: '#888' }
});

const WeeklyPaymentDocument = ({ data }: { data: WeeklyPaymentReportRow[] }) => {
    const totalPaid = data.reduce((sum, row) => sum + row.paidThisWeek, 0);
    const dateStr = new Date().toLocaleDateString();

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.header}>Weekly Payment Report</Text>
                <Text style={styles.subHeader}>Generated on: {dateStr}</Text>
                
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Employee Code</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Employee Name</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Paid This Week (Rs)</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Signature</Text></View>
                    </View>
                    
                    {data.map((row, i) => (
                        <View style={styles.tableRow} key={i}>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>{row.employeeCode}</Text></View>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>{row.employeeName}</Text></View>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>{(row.paidThisWeek / 100).toFixed(2)}</Text></View>
                            <View style={styles.tableCol}><Text style={styles.tableCell}></Text></View>  {/* Empty column for physical signature */}
                        </View>
                    ))}
                    
                    {/* Totals Row */}
                    <View style={styles.tableRow}>
                        <View style={styles.tableCol}><Text style={styles.tableCell}></Text></View>
                        <View style={styles.tableCol}><Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Grand Total</Text></View>
                        <View style={styles.tableCol}><Text style={[styles.tableCell, { fontWeight: 'bold' }]}>{(totalPaid / 100).toFixed(2)}</Text></View>
                        <View style={styles.tableCol}><Text style={styles.tableCell}></Text></View>
                    </View>
                </View>
                
                <Text style={styles.footer}>*This is a computer-generated document tracking cash disbursements.</Text>
            </Page>
        </Document>
    );
};

@Injectable()
export class WeeklyPdfService {
    constructor(private readonly prisma: PrismaService) {}

    async generatePdfStream(data: WeeklyPaymentReportRow[]): Promise<NodeJS.ReadableStream> {
        if (!data || data.length === 0) {
            throw new NotFoundException('No payments found for this week to generate report.');
        }

        const element = React.createElement(WeeklyPaymentDocument, { data });
        return renderToStream(element as never);
    }
}

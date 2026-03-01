import { PrismaService } from '../prisma/prisma.service';
import * as stream from 'stream';
export declare class ExportService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private exportToStream;
    exportOrders(branchId?: string, from?: string, to?: string): Promise<stream.PassThrough>;
    exportPayments(branchId?: string, from?: string, to?: string): Promise<stream.PassThrough>;
    exportExpenses(branchId?: string, from?: string, to?: string): Promise<stream.PassThrough>;
    exportEmployeeSummaries(branchId?: string): Promise<stream.PassThrough>;
}

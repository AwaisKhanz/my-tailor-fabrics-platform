import { PrismaService } from '../prisma/prisma.service';
export declare class WeeklyPdfService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    generatePdfStream(data: {
        employeeCode: string;
        employeeName: string;
        paidThisWeek: number | string;
    }[]): Promise<NodeJS.ReadableStream>;
}

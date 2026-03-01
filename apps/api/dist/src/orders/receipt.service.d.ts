import { PrismaService } from '../prisma/prisma.service';
export declare class ReceiptService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    generateOrderReceipt(orderId: string, branchId: string): Promise<NodeJS.ReadableStream>;
}

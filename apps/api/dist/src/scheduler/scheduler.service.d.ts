import { PrismaService } from '../prisma/prisma.service';
export declare class SchedulerService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleOverdueOrders(): Promise<void>;
}

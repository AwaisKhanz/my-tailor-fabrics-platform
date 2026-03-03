import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { Customer, Employee } from '@prisma/client';
export declare class SearchService {
    private readonly prisma;
    private readonly cache;
    constructor(prisma: PrismaService, cache: Cache);
    private normalizeLimit;
    private normalizeQuery;
    private buildTsQuery;
    private buildCacheKey;
    private setCache;
    searchCustomers(query: string, branchId: string | null, limit?: number): Promise<Customer[]>;
    searchEmployees(query: string, branchId: string | null, limit?: number): Promise<Employee[]>;
}

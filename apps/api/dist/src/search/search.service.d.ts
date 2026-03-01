import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { Customer, Employee } from '@prisma/client';
export declare class SearchService {
    private readonly prisma;
    private readonly cache;
    constructor(prisma: PrismaService, cache: Cache);
    searchCustomers(query: string, branchId: string, limit?: number): Promise<Customer[]>;
    searchEmployees(query: string, branchId: string, limit?: number): Promise<Employee[]>;
}

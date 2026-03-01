import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { Customer, Employee } from '@prisma/client';

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async searchCustomers(query: string, branchId: string, limit = 10): Promise<Customer[]> {
    if (!query || query.trim().length < 2) return [];
    
    const q = query.trim();
    const cacheKey = `search:cust:${branchId}:${q.toLowerCase()}`;
    
    // Attempt cache hit
    const hit = await this.cache.get<Customer[]>(cacheKey);
    if (hit) return hit;

    let result: Customer[] = [];

    // Fast path: Exact or Prefix lookup for Size Number
    if (/^c-/i.test(q)) {
      result = await this.prisma.$queryRaw<Customer[]>`
        SELECT id, "branchId", "sizeNumber", "fullName", phone, city, status
        FROM "Customer"
        WHERE ("branchId" = ${branchId} OR ${branchId} IS NULL)
          AND "deletedAt" IS NULL
          AND "sizeNumber" ILIKE ${q + '%'}
        LIMIT ${limit}
      `;
    } else {
      // Full-text search via GIN index + tsvector
      const tsQuery = `${q.split(/\s+/).join(' & ')}:*`; // basic prefixing

      result = await this.prisma.$queryRaw<Customer[]>`
        SELECT id, "branchId", "sizeNumber", "fullName", phone, city, status,
               ts_rank("searchVector", to_tsquery('simple', ${tsQuery})) AS rank
        FROM "Customer"
        WHERE ("branchId" = ${branchId} OR ${branchId} IS NULL)
          AND "deletedAt" IS NULL
          AND "searchVector" @@ to_tsquery('simple', ${tsQuery})
        ORDER BY rank DESC, "createdAt" DESC
        LIMIT ${limit}
      `;
    }

    // Set map in Redis with 30s TTL
    // @ts-ignore - The underlying store supports TTL in ms
    await this.cache.set(cacheKey, result, 30000); 

    return result;
  }

  async searchEmployees(query: string, branchId: string, limit = 10): Promise<Employee[]> {
    if (!query || query.trim().length < 2) return [];
    
    const q = query.trim();
    const cacheKey = `search:emp:${branchId}:${q.toLowerCase()}`;
    
    const hit = await this.cache.get<Employee[]>(cacheKey);
    if (hit) return hit;

    const tsQuery = `${q.split(/\s+/).join(' & ')}:*`;

    const result = await this.prisma.$queryRaw<Employee[]>`
      SELECT id, "branchId", "employeeCode", "fullName", designation, status
      FROM "Employee"
      WHERE ("branchId" = ${branchId} OR ${branchId} IS NULL)
        AND "deletedAt" IS NULL 
        AND status = 'ACTIVE'
        AND "searchVector" @@ to_tsquery('simple', ${tsQuery})
      ORDER BY ts_rank("searchVector", to_tsquery('simple', ${tsQuery})) DESC, "createdAt" DESC
      LIMIT ${limit}
    `;

    // @ts-ignore
    await this.cache.set(cacheKey, result, 30000);

    return result;
  }
}

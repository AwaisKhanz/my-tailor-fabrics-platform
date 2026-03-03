"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const prisma_service_1 = require("../prisma/prisma.service");
const MIN_QUERY_LENGTH = 2;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const CACHE_TTL_MS = 30_000;
let SearchService = class SearchService {
    prisma;
    cache;
    constructor(prisma, cache) {
        this.prisma = prisma;
        this.cache = cache;
    }
    normalizeLimit(limit = DEFAULT_LIMIT) {
        if (!Number.isFinite(limit) || limit <= 0) {
            return DEFAULT_LIMIT;
        }
        return Math.min(Math.trunc(limit), MAX_LIMIT);
    }
    normalizeQuery(query) {
        return query.trim();
    }
    buildTsQuery(query) {
        const tokens = query.toLowerCase().match(/[a-z0-9]+/g) ?? [];
        if (tokens.length === 0) {
            return null;
        }
        return tokens.map((token) => `${token}:*`).join(' & ');
    }
    buildCacheKey(kind, branchId, query, limit) {
        return `search:${kind}:${branchId ?? 'ALL'}:${query.toLowerCase()}:${limit}`;
    }
    async setCache(key, value) {
        await this.cache.set(key, value, CACHE_TTL_MS);
    }
    async searchCustomers(query, branchId, limit = 10) {
        const q = this.normalizeQuery(query);
        if (!q || q.length < MIN_QUERY_LENGTH)
            return [];
        const safeLimit = this.normalizeLimit(limit);
        const cacheKey = this.buildCacheKey('cust', branchId, q, safeLimit);
        const hit = await this.cache.get(cacheKey);
        if (hit)
            return hit;
        let result = [];
        if (/^c-/i.test(q)) {
            result = await this.prisma.$queryRaw `
        SELECT id, "branchId", "sizeNumber", "fullName", phone, city, status
        FROM "Customer"
        WHERE ("branchId" = ${branchId} OR ${branchId} IS NULL)
          AND "deletedAt" IS NULL
          AND "sizeNumber" ILIKE ${q + '%'}
        ORDER BY "createdAt" DESC
        LIMIT ${safeLimit}
      `;
        }
        else {
            const tsQuery = this.buildTsQuery(q);
            if (tsQuery) {
                result = await this.prisma.$queryRaw `
          SELECT id, "branchId", "sizeNumber", "fullName", phone, city, status,
                 ts_rank("searchVector", to_tsquery('simple', ${tsQuery})) AS rank
          FROM "Customer"
          WHERE ("branchId" = ${branchId} OR ${branchId} IS NULL)
            AND "deletedAt" IS NULL
            AND "searchVector" @@ to_tsquery('simple', ${tsQuery})
          ORDER BY rank DESC, "createdAt" DESC
          LIMIT ${safeLimit}
        `;
            }
            if (result.length === 0) {
                const likeQuery = `%${q}%`;
                result = await this.prisma.$queryRaw `
          SELECT id, "branchId", "sizeNumber", "fullName", phone, city, status
          FROM "Customer"
          WHERE ("branchId" = ${branchId} OR ${branchId} IS NULL)
            AND "deletedAt" IS NULL
            AND (
              "fullName" ILIKE ${likeQuery}
              OR "sizeNumber" ILIKE ${likeQuery}
              OR phone ILIKE ${likeQuery}
            )
          ORDER BY "createdAt" DESC
          LIMIT ${safeLimit}
        `;
            }
        }
        await this.setCache(cacheKey, result);
        return result;
    }
    async searchEmployees(query, branchId, limit = 10) {
        const q = this.normalizeQuery(query);
        if (!q || q.length < MIN_QUERY_LENGTH)
            return [];
        const safeLimit = this.normalizeLimit(limit);
        const cacheKey = this.buildCacheKey('emp', branchId, q, safeLimit);
        const hit = await this.cache.get(cacheKey);
        if (hit)
            return hit;
        const tsQuery = this.buildTsQuery(q);
        let result = [];
        if (tsQuery) {
            result = await this.prisma.$queryRaw `
        SELECT id, "branchId", "employeeCode", "fullName", designation, status
        FROM "Employee"
        WHERE ("branchId" = ${branchId} OR ${branchId} IS NULL)
          AND "deletedAt" IS NULL
          AND status = 'ACTIVE'
          AND "searchVector" @@ to_tsquery('simple', ${tsQuery})
        ORDER BY ts_rank("searchVector", to_tsquery('simple', ${tsQuery})) DESC, "createdAt" DESC
        LIMIT ${safeLimit}
      `;
        }
        if (result.length === 0) {
            const likeQuery = `%${q}%`;
            result = await this.prisma.$queryRaw `
        SELECT id, "branchId", "employeeCode", "fullName", designation, status
        FROM "Employee"
        WHERE ("branchId" = ${branchId} OR ${branchId} IS NULL)
          AND "deletedAt" IS NULL
          AND status = 'ACTIVE'
          AND (
            "fullName" ILIKE ${likeQuery}
            OR "employeeCode" ILIKE ${likeQuery}
            OR phone ILIKE ${likeQuery}
          )
        ORDER BY "createdAt" DESC
        LIMIT ${safeLimit}
      `;
        }
        await this.setCache(cacheKey, result);
        return result;
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], SearchService);
//# sourceMappingURL=search.service.js.map
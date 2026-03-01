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
let SearchService = class SearchService {
    prisma;
    cache;
    constructor(prisma, cache) {
        this.prisma = prisma;
        this.cache = cache;
    }
    async searchCustomers(query, branchId, limit = 10) {
        if (!query || query.trim().length < 2)
            return [];
        const q = query.trim();
        const cacheKey = `search:cust:${branchId}:${q.toLowerCase()}`;
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
        LIMIT ${limit}
      `;
        }
        else {
            const tsQuery = `${q.split(/\s+/).join(' & ')}:*`;
            result = await this.prisma.$queryRaw `
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
        await this.cache.set(cacheKey, result, 30000);
        return result;
    }
    async searchEmployees(query, branchId, limit = 10) {
        if (!query || query.trim().length < 2)
            return [];
        const q = query.trim();
        const cacheKey = `search:emp:${branchId}:${q.toLowerCase()}`;
        const hit = await this.cache.get(cacheKey);
        if (hit)
            return hit;
        const tsQuery = `${q.split(/\s+/).join(' & ')}:*`;
        const result = await this.prisma.$queryRaw `
      SELECT id, "branchId", "employeeCode", "fullName", designation, status
      FROM "Employee"
      WHERE ("branchId" = ${branchId} OR ${branchId} IS NULL)
        AND "deletedAt" IS NULL 
        AND status = 'ACTIVE'
        AND "searchVector" @@ to_tsquery('simple', ${tsQuery})
      ORDER BY ts_rank("searchVector", to_tsquery('simple', ${tsQuery})) DESC, "createdAt" DESC
      LIMIT ${limit}
    `;
        await this.cache.set(cacheKey, result, 30000);
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
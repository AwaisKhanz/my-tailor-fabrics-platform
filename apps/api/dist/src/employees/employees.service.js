"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const search_service_1 = require("../search/search.service");
const ledger_service_1 = require("../ledger/ledger.service");
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const MIN_SEARCH_QUERY_LENGTH = 2;
let EmployeesService = class EmployeesService {
    prisma;
    searchService;
    ledgerService;
    constructor(prisma, searchService, ledgerService) {
        this.prisma = prisma;
        this.searchService = searchService;
        this.ledgerService = ledgerService;
    }
    normalizePagination(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
        const safePage = Number.isFinite(page) && page > 0 ? Math.trunc(page) : DEFAULT_PAGE;
        const safeLimit = Number.isFinite(limit) && limit > 0
            ? Math.min(Math.trunc(limit), MAX_LIMIT)
            : DEFAULT_LIMIT;
        return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
    }
    parseOptionalDate(value) {
        if (value === undefined)
            return undefined;
        if (!value)
            return null;
        return new Date(value);
    }
    async generateEmployeeCode(branchId) {
        const branch = await this.prisma.branch.findUnique({
            where: { id: branchId },
        });
        if (!branch)
            throw new common_1.NotFoundException('Branch not found');
        const prefix = `EMP-${branch.code}-`;
        const lastEmployee = await this.prisma.employee.findFirst({
            where: { branchId, employeeCode: { startsWith: prefix } },
            orderBy: { employeeCode: 'desc' },
        });
        let nextNumber = 1;
        if (lastEmployee) {
            const parts = lastEmployee.employeeCode.split('-');
            if (parts.length === 3) {
                nextNumber = parseInt(parts[2], 10) + 1;
            }
        }
        const paddedNumber = String(nextNumber).padStart(4, '0');
        return `${prefix}${paddedNumber}`;
    }
    async create(createEmployeeDto, branchId) {
        const employeeCode = await this.generateEmployeeCode(branchId);
        return this.prisma.employee.create({
            data: {
                ...createEmployeeDto,
                dateOfBirth: this.parseOptionalDate(createEmployeeDto.dateOfBirth),
                dateOfJoining: this.parseOptionalDate(createEmployeeDto.dateOfJoining) ?? new Date(),
                employeeCode,
                branchId,
            },
        });
    }
    async findAll(branchId, page = 1, limit = 20, search) {
        const { page: safePage, limit: safeLimit, skip } = this.normalizePagination(page, limit);
        const query = search?.trim();
        if (query && query.length >= MIN_SEARCH_QUERY_LENGTH) {
            const results = await this.searchService.searchEmployees(query, branchId, safeLimit);
            return { data: results, total: results.length };
        }
        const [data, total] = await Promise.all([
            this.prisma.employee.findMany({
                where: {
                    deletedAt: null,
                    status: 'ACTIVE',
                    ...(branchId ? { branchId } : {}),
                },
                skip,
                take: safeLimit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.employee.count({
                where: {
                    deletedAt: null,
                    status: 'ACTIVE',
                    ...(branchId ? { branchId } : {}),
                },
            }),
        ]);
        return { data, total, page: safePage };
    }
    async findOne(id, branchId) {
        const employee = await this.prisma.employee.findFirst({
            where: {
                id,
                deletedAt: null,
                ...(branchId ? { branchId } : {}),
            },
            include: {
                userAccount: {
                    select: { id: true, email: true, isActive: true },
                },
                documents: true,
            },
        });
        if (!employee)
            throw new common_1.NotFoundException('Employee not found');
        return employee;
    }
    async update(id, branchId, updateEmployeeDto) {
        await this.findOne(id, branchId);
        const data = { ...updateEmployeeDto };
        if (updateEmployeeDto.dateOfBirth !== undefined) {
            data.dateOfBirth = this.parseOptionalDate(updateEmployeeDto.dateOfBirth);
        }
        if (updateEmployeeDto.dateOfJoining !== undefined) {
            data.dateOfJoining = new Date(updateEmployeeDto.dateOfJoining);
        }
        return this.prisma.employee.update({
            where: { id },
            data,
        });
    }
    async remove(id, branchId) {
        await this.findOne(id, branchId);
        return this.prisma.employee.update({
            where: { id },
            data: { deletedAt: new Date(), status: 'LEFT' },
        });
    }
    async createUserAccount(employeeId, branchId, email, rawPass) {
        const employee = await this.findOne(employeeId, branchId);
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing)
            throw new common_1.ConflictException('Email already in use');
        if (employee.userAccount)
            throw new common_1.ConflictException('Employee already has a user account linked');
        return this.prisma.$transaction(async (tx) => {
            const passwordHash = await bcrypt.hash(rawPass, 12);
            const user = await tx.user.create({
                data: {
                    name: employee.fullName,
                    email,
                    passwordHash,
                    role: client_1.Role.EMPLOYEE,
                    branchId: employee.branchId,
                    employeeId,
                },
            });
            return user;
        });
    }
    async getStats(id, branchId) {
        await this.findOne(id, branchId);
        const summary = await this.ledgerService.getBalance(id);
        return {
            totalEarned: summary.totalEarned,
            totalPaid: summary.totalDeducted,
            balance: summary.currentBalance,
            currentBalance: summary.currentBalance,
        };
    }
    async getItems(id, branchId, page = 1, limit = 20) {
        await this.findOne(id, branchId);
        const { limit: safeLimit, skip } = this.normalizePagination(page, limit);
        const [data, total] = await Promise.all([
            this.prisma.orderItem.findMany({
                where: { employeeId: id, deletedAt: null },
                select: {
                    id: true,
                    orderId: true,
                    garmentTypeName: true,
                    quantity: true,
                    employeeRate: true,
                    status: true,
                    completedAt: true,
                    order: { select: { orderNumber: true, status: true, dueDate: true } },
                },
                skip,
                take: safeLimit,
                orderBy: { completedAt: 'desc' },
            }),
            this.prisma.orderItem.count({ where: { employeeId: id, deletedAt: null } }),
        ]);
        return { data, total };
    }
    async addDocument(id, branchId, label, fileUrl, fileType, uploadedById) {
        await this.findOne(id, branchId);
        return this.prisma.employeeDocument.create({
            data: { employeeId: id, label, fileUrl, fileType, uploadedById },
        });
    }
    async getMyProfile(employeeId, branchId) {
        return this.findOne(employeeId, branchId);
    }
    async getMyStats(employeeId, branchId) {
        return this.getStats(employeeId, branchId);
    }
    async getMyItems(employeeId, branchId, page = 1, limit = 20) {
        return this.getItems(employeeId, branchId, page, limit);
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        search_service_1.SearchService,
        ledger_service_1.LedgerService])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map
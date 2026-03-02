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
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
let EmployeesService = class EmployeesService {
    prisma;
    searchService;
    constructor(prisma, searchService) {
        this.prisma = prisma;
        this.searchService = searchService;
    }
    async generateEmployeeCode(branchId) {
        const branch = await this.prisma.branch.findUnique({ where: { id: branchId } });
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
                dateOfBirth: createEmployeeDto.dateOfBirth ? new Date(createEmployeeDto.dateOfBirth) : null,
                dateOfJoining: createEmployeeDto.dateOfJoining ? new Date(createEmployeeDto.dateOfJoining) : new Date(),
                employeeCode,
                branchId,
            },
        });
    }
    async findAll(branchId, page = 1, limit = 20, search) {
        if (search && search.trim().length >= 2) {
            const results = await this.searchService.searchEmployees(search, branchId, limit);
            return { data: results, meta: { total: results.length, page: 1, lastPage: 1 } };
        }
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.employee.findMany({
                where: {
                    deletedAt: null,
                    status: 'ACTIVE',
                    ...(branchId ? { branchId } : {})
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.employee.count({
                where: {
                    deletedAt: null,
                    status: 'ACTIVE',
                    ...(branchId ? { branchId } : {})
                }
            })
        ]);
        return { data, total };
    }
    async findOne(id, branchId) {
        const employee = await this.prisma.employee.findFirst({
            where: {
                id,
                deletedAt: null,
                ...(branchId ? { branchId } : {})
            },
            include: {
                userAccount: {
                    select: { id: true, email: true, isActive: true }
                },
                documents: true
            }
        });
        if (!employee)
            throw new common_1.NotFoundException('Employee not found');
        return employee;
    }
    async update(id, branchId, updateEmployeeDto) {
        await this.findOne(id, branchId);
        const data = { ...updateEmployeeDto };
        if (data.dateOfBirth)
            data.dateOfBirth = new Date(data.dateOfBirth);
        if (data.dateOfJoining)
            data.dateOfJoining = new Date(data.dateOfJoining);
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
                    employeeId
                }
            });
            return user;
        });
    }
    async getStats(id, branchId) {
        await this.findOne(id, branchId);
        const completedItems = await this.prisma.orderItem.aggregate({
            where: { employeeId: id, status: 'COMPLETED' },
            _sum: { employeeRate: true }
        });
        const totalPaidRes = await this.prisma.payment.aggregate({
            where: { employeeId: id },
            _sum: { amount: true }
        });
        const totalEarned = completedItems._sum.employeeRate || 0;
        const totalPaid = totalPaidRes._sum.amount || 0;
        const balance = totalEarned - totalPaid;
        return { totalEarned, totalPaid, balance };
    }
    async getItems(id, branchId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.orderItem.findMany({
                where: { employeeId: id },
                select: {
                    id: true,
                    orderId: true,
                    garmentTypeName: true,
                    quantity: true,
                    employeeRate: true,
                    status: true,
                    completedAt: true,
                    order: { select: { orderNumber: true, status: true, dueDate: true } }
                },
                skip,
                take: limit,
                orderBy: { completedAt: 'desc' },
            }),
            this.prisma.orderItem.count({ where: { employeeId: id } })
        ]);
        return { data, total };
    }
    async addDocument(id, branchId, label, fileUrl, fileType, uploadedById) {
        await this.findOne(id, branchId);
        return this.prisma.employeeDocument.create({
            data: { employeeId: id, label, fileUrl, fileType, uploadedById }
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, search_service_1.SearchService])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map
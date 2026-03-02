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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const shared_types_1 = require("@tbms/shared-types");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByEmail(email) {
        return this.prisma.user.findFirst({
            where: { email, deletedAt: null },
            include: { branch: true },
        });
    }
    async findById(id) {
        return this.prisma.user.findFirst({
            where: { id, deletedAt: null },
            include: { branch: true },
        });
    }
    async updateRefreshToken(userId, refreshToken) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken },
        });
    }
    async findAll(branchId) {
        const where = {
            deletedAt: null,
            ...(branchId ? { branchId } : {}),
        };
        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                    branchId: true,
                    lastLoginAt: true,
                    createdAt: true,
                    branch: { select: { name: true, code: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);
        return { data, total };
    }
    async setupInitialSuperAdmin(data) {
        const existing = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existing) {
            if (existing.deletedAt) {
                throw new common_1.ConflictException('A user with this email existed and was deleted. Contact support.');
            }
            throw new common_1.ConflictException('A user with this email already exists');
        }
        const tempPassword = data.password || Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        return this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash: hashedPassword,
                role: data.role,
                branchId: data.branchId,
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                branchId: true,
                createdAt: true,
            },
        });
    }
    async create(data) {
        const existing = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existing) {
            if (existing.deletedAt) {
                throw new common_1.ConflictException('A user with this email existed and was deleted. Contact support.');
            }
            throw new common_1.ConflictException('A user with this email already exists');
        }
        const tempPassword = data.password || Math.random().toString(36).slice(-8);
        const passwordHash = await bcrypt.hash(tempPassword, 12);
        return this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash,
                role: data.role,
                branchId: data.branchId ?? null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                branchId: true,
                createdAt: true,
            },
        });
    }
    async setActive(id, isActive) {
        const user = await this.findById(id);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return this.prisma.user.update({ where: { id }, data: { isActive } });
    }
    async remove(id) {
        await this.findById(id);
        return this.prisma.user.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
        });
    }
    async update(id, dataParams) {
        const user = await this.findById(id);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const data = {
            name: dataParams.name,
            email: dataParams.email,
            role: dataParams.role,
            branchId: dataParams.branchId === undefined
                ? undefined
                : (dataParams.branchId ?? null),
        };
        if (dataParams.password) {
            data.passwordHash = await bcrypt.hash(dataParams.password, 12);
        }
        return this.prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                branchId: true,
                createdAt: true,
            },
        });
    }
    async getStats() {
        const [total, active, privileged] = await Promise.all([
            this.prisma.user.count({ where: { deletedAt: null } }),
            this.prisma.user.count({ where: { deletedAt: null, isActive: true } }),
            this.prisma.user.count({
                where: {
                    deletedAt: null,
                    role: { in: [shared_types_1.Role.ADMIN, shared_types_1.Role.SUPER_ADMIN] },
                },
            }),
        ]);
        return { total, active, privileged };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map
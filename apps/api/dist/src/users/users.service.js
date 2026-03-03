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
const shared_constants_1 = require("@tbms/shared-constants");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const PASSWORD_HASH_ROUNDS = 12;
const USER_SELECT = {
    id: true,
    name: true,
    email: true,
    role: true,
    isActive: true,
    branchId: true,
    lastLoginAt: true,
    createdAt: true,
    branch: { select: { name: true, code: true } },
};
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    normalizeEmail(email) {
        return email.trim().toLowerCase();
    }
    resolveBranchId(value) {
        if (value === undefined)
            return undefined;
        return value || null;
    }
    generateTempPassword() {
        return (0, crypto_1.randomBytes)(12).toString('base64url').slice(0, 16);
    }
    async ensureEmailAvailable(email, excludingUserId) {
        const existing = await this.prisma.user.findFirst({
            where: {
                email: { equals: email, mode: 'insensitive' },
                ...(excludingUserId ? { id: { not: excludingUserId } } : {}),
            },
        });
        if (!existing) {
            return;
        }
        if (existing.deletedAt) {
            throw new common_1.ConflictException('A user with this email existed and was deleted. Contact support.');
        }
        throw new common_1.ConflictException('A user with this email already exists');
    }
    async findByEmail(email) {
        return this.prisma.user.findFirst({
            where: {
                email: { equals: this.normalizeEmail(email), mode: 'insensitive' },
                deletedAt: null,
            },
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
                select: USER_SELECT,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);
        return { data, total };
    }
    async setupInitialSuperAdmin(data) {
        const normalizedEmail = this.normalizeEmail(data.email);
        await this.ensureEmailAvailable(normalizedEmail);
        const tempPassword = data.password || this.generateTempPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, PASSWORD_HASH_ROUNDS);
        return this.prisma.user.create({
            data: {
                name: data.name,
                email: normalizedEmail,
                passwordHash: hashedPassword,
                role: data.role,
                branchId: this.resolveBranchId(data.branchId),
                isActive: true,
            },
            select: USER_SELECT,
        });
    }
    async create(data) {
        const normalizedEmail = this.normalizeEmail(data.email);
        await this.ensureEmailAvailable(normalizedEmail);
        const tempPassword = data.password || this.generateTempPassword();
        const passwordHash = await bcrypt.hash(tempPassword, PASSWORD_HASH_ROUNDS);
        return this.prisma.user.create({
            data: {
                name: data.name,
                email: normalizedEmail,
                passwordHash,
                role: data.role,
                branchId: this.resolveBranchId(data.branchId),
            },
            select: USER_SELECT,
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
        const normalizedEmail = dataParams.email !== undefined
            ? this.normalizeEmail(dataParams.email)
            : undefined;
        if (normalizedEmail) {
            await this.ensureEmailAvailable(normalizedEmail, id);
        }
        const data = {
            name: dataParams.name,
            email: normalizedEmail,
            role: dataParams.role,
            branchId: this.resolveBranchId(dataParams.branchId),
        };
        if (dataParams.password) {
            data.passwordHash = await bcrypt.hash(dataParams.password, PASSWORD_HASH_ROUNDS);
        }
        return this.prisma.user.update({
            where: { id },
            data,
            select: USER_SELECT,
        });
    }
    async getStats() {
        const [total, active, privileged] = await Promise.all([
            this.prisma.user.count({ where: { deletedAt: null } }),
            this.prisma.user.count({ where: { deletedAt: null, isActive: true } }),
            this.prisma.user.count({
                where: {
                    deletedAt: null,
                    role: { in: [...shared_constants_1.ADMIN_ROLES] },
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
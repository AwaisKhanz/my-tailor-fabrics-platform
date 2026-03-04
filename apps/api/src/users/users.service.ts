import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Role as PrismaRole } from '@prisma/client';
import {
  Role,
  CreateUserInput,
  UpdateUserInput,
  UserAccountsQueryInput,
} from '@tbms/shared-types';
import { ADMIN_ROLES } from '@tbms/shared-constants';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { normalizeEmailAddress } from '../common/utils/email.util';

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
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeEmail(email: string): string {
    return normalizeEmailAddress(email);
  }

  private resolveBranchId(value?: string): string | null | undefined {
    if (value === undefined) return undefined;
    return value || null;
  }

  private generateTempPassword(): string {
    return randomBytes(12).toString('base64url').slice(0, 16);
  }

  private async ensureEmailAvailable(email: string, excludingUserId?: string) {
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
      throw new ConflictException(
        'A user with this email existed and was deleted. Contact support.',
      );
    }

    throw new ConflictException('A user with this email already exists');
  }

  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: {
        email: { equals: this.normalizeEmail(email), mode: 'insensitive' },
        deletedAt: null,
      },
      include: { branch: true },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { branch: true },
    });
  }

  async updateRefreshToken(userId: string, refreshToken: string | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

  async findAll(options: UserAccountsQueryInput = {}) {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit =
      options.limit && options.limit > 0 ? Math.min(options.limit, 100) : 10;
    const search = options.search?.trim();

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(options.branchId ? { branchId: options.branchId } : {}),
      ...(options.role ? { role: options.role as unknown as PrismaRole } : {}),
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        {
          branch: {
            is: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: USER_SELECT,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async setupInitialSuperAdmin(data: CreateUserInput) {
    const normalizedEmail = this.normalizeEmail(data.email);
    await this.ensureEmailAvailable(normalizedEmail);

    const tempPassword = data.password || this.generateTempPassword();
    const hashedPassword = await bcrypt.hash(
      tempPassword,
      PASSWORD_HASH_ROUNDS,
    );

    return this.prisma.user.create({
      data: {
        name: data.name,
        email: normalizedEmail,
        passwordHash: hashedPassword,
        role: data.role as Role,
        branchId: this.resolveBranchId(data.branchId),
        isActive: true,
      },
      select: USER_SELECT,
    });
  }

  async create(data: CreateUserInput) {
    const normalizedEmail = this.normalizeEmail(data.email);
    await this.ensureEmailAvailable(normalizedEmail);

    const tempPassword = data.password || this.generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, PASSWORD_HASH_ROUNDS);
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: normalizedEmail,
        passwordHash,
        role: data.role as Role,
        branchId: this.resolveBranchId(data.branchId),
      },
      select: USER_SELECT,
    });
  }

  async setActive(id: string, isActive: boolean) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({ where: { id }, data: { isActive } });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async update(id: string, dataParams: UpdateUserInput) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const normalizedEmail =
      dataParams.email !== undefined
        ? this.normalizeEmail(dataParams.email)
        : undefined;
    if (normalizedEmail) {
      await this.ensureEmailAvailable(normalizedEmail, id);
    }

    const data: Prisma.UserUncheckedUpdateInput = {
      name: dataParams.name,
      email: normalizedEmail,
      role: dataParams.role as Role | undefined,
      branchId: this.resolveBranchId(dataParams.branchId),
    };

    if (dataParams.password) {
      data.passwordHash = await bcrypt.hash(
        dataParams.password,
        PASSWORD_HASH_ROUNDS,
      );
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
          role: { in: [...ADMIN_ROLES] },
        },
      }),
    ]);

    return { total, active, privileged };
  }
}

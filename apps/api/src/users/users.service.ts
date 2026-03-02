import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Role, CreateUserInput, UpdateUserInput } from '@tbms/shared-types';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: { email, deletedAt: null },
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

  async findAll(branchId?: string) {
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

  async setupInitialSuperAdmin(data: CreateUserInput) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      if (existing.deletedAt) {
        throw new ConflictException(
          'A user with this email existed and was deleted. Contact support.',
        );
      }
      throw new ConflictException('A user with this email already exists');
    }
    // Generate a temporary password if none provided
    const tempPassword = data.password || Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: hashedPassword, // Changed from 'password' to 'passwordHash'
        role: data.role as Role,
        branchId: data.branchId,
        isActive: true,
      },
      select: {
        // Added select block to match other create/update methods
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

  async create(data: CreateUserInput) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      if (existing.deletedAt) {
        throw new ConflictException(
          'A user with this email existed and was deleted. Contact support.',
        );
      }
      throw new ConflictException('A user with this email already exists');
    }

    const tempPassword = data.password || Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 12);
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role as Role,
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

    const data: Prisma.UserUncheckedUpdateInput = {
      name: dataParams.name,
      email: dataParams.email,
      role: dataParams.role as Role | undefined,
      branchId:
        dataParams.branchId === undefined
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
          role: { in: [Role.ADMIN, Role.SUPER_ADMIN] },
        },
      }),
    ]);

    return { total, active, privileged };
  }
}

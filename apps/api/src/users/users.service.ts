import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Prisma,
  Role as PrismaRole,
  EmployeeStatus as PrismaEmployeeStatus,
} from '@prisma/client';
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
import {
  normalizePagination,
  toPaginatedResponse,
} from '../common/utils/pagination.util';

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

const AUTH_USER_INCLUDE = {
  branch: true,
  employee: {
    select: {
      id: true,
      status: true,
      deletedAt: true,
    },
  },
} satisfies Prisma.UserInclude;

type AuthUserRecord = Prisma.UserGetPayload<{
  include: typeof AUTH_USER_INCLUDE;
}>;

const ROLE_TO_PRISMA_ROLE: Record<Role, PrismaRole> = {
  [Role.SUPER_ADMIN]: PrismaRole.SUPER_ADMIN,
  [Role.ADMIN]: PrismaRole.ADMIN,
  [Role.ENTRY_OPERATOR]: PrismaRole.ENTRY_OPERATOR,
  [Role.VIEWER]: PrismaRole.VIEWER,
  [Role.EMPLOYEE]: PrismaRole.EMPLOYEE,
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private toPrismaRole(role: Role): PrismaRole {
    return ROLE_TO_PRISMA_ROLE[role];
  }

  async markLastLogin(userId: string, at: Date = new Date()) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: at },
      select: { id: true, lastLoginAt: true },
    });
  }

  async recordLoginState(
    userId: string,
    state: {
      currentTokenHash: string;
      previousTokenHash?: string | null;
      previousTokenExpiresAt?: Date | null;
    },
    at: Date = new Date(),
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: state.currentTokenHash,
        previousRefreshToken: state.previousTokenHash ?? null,
        previousRefreshTokenExpiresAt: state.previousTokenExpiresAt ?? null,
        pendingLoginChallengeId: null,
        pendingLoginOtpHash: null,
        pendingLoginOtpExpiresAt: null,
        pendingLoginOtpAttempts: 0,
        lastLoginAt: at,
      },
      select: {
        id: true,
        lastLoginAt: true,
        refreshToken: true,
        previousRefreshToken: true,
        previousRefreshTokenExpiresAt: true,
      },
    });
  }

  private normalizeEmail(email: string): string {
    return normalizeEmailAddress(email);
  }

  private resolveBranchId(value?: string | null): string | null | undefined {
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

  async findAuthUserByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: {
        email: { equals: this.normalizeEmail(email), mode: 'insensitive' },
        deletedAt: null,
      },
      include: AUTH_USER_INCLUDE,
    });
  }

  async findAuthUserById(id: string) {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: AUTH_USER_INCLUDE,
    });
  }

  isAuthEligible(user: AuthUserRecord | null): user is AuthUserRecord {
    if (!user || !user.isActive) {
      return false;
    }

    if (!user.employee) {
      return true;
    }

    return (
      user.employee.deletedAt === null &&
      user.employee.status === PrismaEmployeeStatus.ACTIVE
    );
  }

  async setRefreshTokenState(
    userId: string,
    state: {
      currentTokenHash: string | null;
      previousTokenHash?: string | null;
      previousTokenExpiresAt?: Date | null;
    },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: state.currentTokenHash,
        previousRefreshToken: state.previousTokenHash ?? null,
        previousRefreshTokenExpiresAt: state.previousTokenExpiresAt ?? null,
      },
    });
  }

  async updateRefreshToken(userId: string, refreshToken: string | null) {
    return this.setRefreshTokenState(userId, {
      currentTokenHash: refreshToken,
      previousTokenHash: null,
      previousTokenExpiresAt: null,
    });
  }

  async clearRefreshTokenState(userId: string) {
    return this.setRefreshTokenState(userId, {
      currentTokenHash: null,
      previousTokenHash: null,
      previousTokenExpiresAt: null,
    });
  }

  async clearRefreshTokenStateIfCurrent(
    userId: string,
    expectedCurrentTokenHash: string | null,
  ) {
    const result = await this.prisma.user.updateMany({
      where: {
        id: userId,
        deletedAt: null,
        refreshToken: expectedCurrentTokenHash,
      },
      data: {
        refreshToken: null,
        previousRefreshToken: null,
        previousRefreshTokenExpiresAt: null,
      },
    });

    return result.count === 1;
  }

  async rotateRefreshTokenStateIfCurrent(
    userId: string,
    expectedCurrentTokenHash: string,
    state: {
      currentTokenHash: string;
      previousTokenHash?: string | null;
      previousTokenExpiresAt?: Date | null;
    },
  ) {
    const result = await this.prisma.user.updateMany({
      where: {
        id: userId,
        deletedAt: null,
        refreshToken: expectedCurrentTokenHash,
      },
      data: {
        refreshToken: state.currentTokenHash,
        previousRefreshToken: state.previousTokenHash ?? null,
        previousRefreshTokenExpiresAt: state.previousTokenExpiresAt ?? null,
      },
    });

    return result.count === 1;
  }

  async setPendingLoginOtpState(
    userId: string,
    state: {
      challengeId: string;
      otpHash: string;
      expiresAt: Date;
      attempts?: number;
    },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        pendingLoginChallengeId: state.challengeId,
        pendingLoginOtpHash: state.otpHash,
        pendingLoginOtpExpiresAt: state.expiresAt,
        pendingLoginOtpAttempts: state.attempts ?? 0,
      },
      select: {
        id: true,
        pendingLoginChallengeId: true,
        pendingLoginOtpExpiresAt: true,
        pendingLoginOtpAttempts: true,
      },
    });
  }

  async findAuthUserByLoginChallenge(challengeId: string) {
    return this.prisma.user.findFirst({
      where: {
        pendingLoginChallengeId: challengeId,
        deletedAt: null,
      },
      include: AUTH_USER_INCLUDE,
    });
  }

  async incrementPendingLoginOtpAttempts(
    userId: string,
    challengeId: string,
  ) {
    const updated = await this.prisma.user.updateMany({
      where: {
        id: userId,
        deletedAt: null,
        pendingLoginChallengeId: challengeId,
      },
      data: {
        pendingLoginOtpAttempts: {
          increment: 1,
        },
      },
    });

    return updated.count === 1;
  }

  async clearPendingLoginOtpState(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        pendingLoginChallengeId: null,
        pendingLoginOtpHash: null,
        pendingLoginOtpExpiresAt: null,
        pendingLoginOtpAttempts: 0,
      },
      select: {
        id: true,
      },
    });
  }

  async findAll(options: UserAccountsQueryInput = {}) {
    const pagination = normalizePagination({
      page: options.page,
      limit: options.limit,
      defaultLimit: 10,
      maxLimit: 100,
    });
    const search = options.search?.trim();

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(options.branchId ? { branchId: options.branchId } : {}),
      ...(options.role ? { role: this.toPrismaRole(options.role) } : {}),
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

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: USER_SELECT,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return toPaginatedResponse(data, total, pagination);
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
        role: this.toPrismaRole(data.role),
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
        role: this.toPrismaRole(data.role),
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
      role: dataParams.role ? this.toPrismaRole(dataParams.role) : undefined,
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

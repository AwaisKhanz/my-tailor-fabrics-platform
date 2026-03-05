import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AUDIT_ACTIONS, AUDIT_ENTITIES } from '@tbms/shared-constants';
import {
  normalizePagination,
  toPaginatedResponse,
} from '../common/utils/pagination.util';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const AUDIT_ACTION_VALUES = new Set<string>(AUDIT_ACTIONS);
const AUDIT_ENTITY_VALUES = new Set<string>(AUDIT_ENTITIES);

interface AuditLogsFilters {
  branchId: string | null;
  page?: number;
  limit?: number;
  action?: string;
  entity?: string;
  userId?: string;
  search?: string;
  from?: string;
  to?: string;
}

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeAction(action?: string): string | undefined {
    if (!action) {
      return undefined;
    }

    const normalized = action.trim().toUpperCase();
    return AUDIT_ACTION_VALUES.has(normalized) ? normalized : undefined;
  }

  private normalizeEntity(entity?: string): string | undefined {
    if (!entity) {
      return undefined;
    }

    const normalized = entity.trim().toLowerCase();
    const matched = AUDIT_ENTITIES.find(
      (candidate) => candidate.toLowerCase() === normalized,
    );
    return matched && AUDIT_ENTITY_VALUES.has(matched) ? matched : undefined;
  }

  private normalizeUserId(userId?: string): string | undefined {
    const normalized = userId?.trim();
    return normalized ? normalized : undefined;
  }

  private normalizePagination(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
    return normalizePagination({
      page,
      limit,
      defaultPage: DEFAULT_PAGE,
      defaultLimit: DEFAULT_LIMIT,
      maxLimit: MAX_LIMIT,
    });
  }

  private parseDateBoundary(
    value?: string,
    endOfDay = false,
  ): Date | undefined {
    if (!value) {
      return undefined;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return undefined;
    }

    if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      date.setUTCHours(23, 59, 59, 999);
    }

    return date;
  }

  private buildWhere(filters: AuditLogsFilters): Prisma.AuditLogWhereInput {
    const normalizedSearch = filters.search?.trim();
    const fromDate = this.parseDateBoundary(filters.from);
    const toDate = this.parseDateBoundary(filters.to, true);
    const normalizedAction = this.normalizeAction(filters.action);
    const normalizedEntity = this.normalizeEntity(filters.entity);
    const normalizedUserId = this.normalizeUserId(filters.userId);

    const where: Prisma.AuditLogWhereInput = {
      deletedAt: null,
      ...(filters.branchId ? { branchId: filters.branchId } : {}),
      ...(normalizedAction ? { action: normalizedAction } : {}),
      ...(normalizedEntity ? { entity: normalizedEntity } : {}),
      ...(normalizedUserId ? { userId: normalizedUserId } : {}),
      ...(fromDate || toDate
        ? {
            createdAt: {
              ...(fromDate ? { gte: fromDate } : {}),
              ...(toDate ? { lte: toDate } : {}),
            },
          }
        : {}),
    };

    if (normalizedSearch) {
      where.OR = [
        { entity: { contains: normalizedSearch, mode: 'insensitive' } },
        { entityId: { contains: normalizedSearch, mode: 'insensitive' } },
        { action: { contains: normalizedSearch, mode: 'insensitive' } },
        { user: { name: { contains: normalizedSearch, mode: 'insensitive' } } },
        {
          user: { email: { contains: normalizedSearch, mode: 'insensitive' } },
        },
      ];
    }

    return where;
  }

  async findAll(filters: AuditLogsFilters) {
    const pagination = this.normalizePagination(filters.page, filters.limit);
    const where = this.buildWhere(filters);

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return toPaginatedResponse(data, total, pagination);
  }

  async getStats(filters: Omit<AuditLogsFilters, 'page' | 'limit'>) {
    const where = this.buildWhere(filters);

    const [total, createCount, updateCount, deleteCount, loginCount, users] =
      await Promise.all([
        this.prisma.auditLog.count({ where }),
        this.prisma.auditLog.count({ where: { ...where, action: 'CREATE' } }),
        this.prisma.auditLog.count({ where: { ...where, action: 'UPDATE' } }),
        this.prisma.auditLog.count({ where: { ...where, action: 'DELETE' } }),
        this.prisma.auditLog.count({ where: { ...where, action: 'LOGIN' } }),
        this.prisma.auditLog.findMany({
          where: { ...where, userId: { not: null } },
          distinct: ['userId'],
          select: { userId: true },
        }),
      ]);

    return {
      total,
      createCount,
      updateCount,
      deleteCount,
      loginCount,
      uniqueUsers: users.length,
    };
  }
}

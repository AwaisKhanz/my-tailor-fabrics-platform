import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateShopFabricInput } from '@tbms/shared-types';
import { PrismaService } from '../prisma/prisma.service';
import {
  normalizePagination,
  toPaginatedResponse,
} from '../common/utils/pagination.util';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;

type FabricListOptions = {
  branchId: string;
  page?: number;
  limit?: number;
  search?: string;
  activeOnly?: boolean;
  includeArchived?: boolean;
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const FABRIC_SELECT = {
  id: true,
  branchId: true,
  name: true,
  brand: true,
  code: true,
  sellingRate: true,
  isActive: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.ShopFabricSelect;

@Injectable()
export class FabricsService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeText(value?: string | null): string | undefined {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  }

  private buildWhere(options: FabricListOptions): Prisma.ShopFabricWhereInput {
    const search = this.normalizeText(options.search);

    return {
      branchId: options.branchId,
      ...(options.includeArchived ? {} : { deletedAt: null }),
      ...(options.activeOnly ? { isActive: true } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { brand: { contains: search, mode: 'insensitive' } },
              { code: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
  }

  private async ensureCodeAvailable(
    branchId: string,
    code?: string,
    excludingId?: string,
    client: PrismaClientLike = this.prisma,
  ) {
    const normalizedCode = this.normalizeText(code);
    if (!normalizedCode) {
      return;
    }

    const existing = await client.shopFabric.findFirst({
      where: {
        branchId,
        code: normalizedCode,
        deletedAt: null,
        ...(excludingId ? { id: { not: excludingId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('A fabric with this code already exists in the branch');
    }
  }

  private async getScopedFabric(
    id: string,
    branchId: string,
    client: PrismaClientLike = this.prisma,
  ) {
    const fabric = await client.shopFabric.findFirst({
      where: {
        id,
        branchId,
        deletedAt: null,
      },
      select: FABRIC_SELECT,
    });

    if (!fabric) {
      throw new NotFoundException('Shop fabric not found');
    }

    return fabric;
  }

  async findAll(options: FabricListOptions) {
    const pagination = normalizePagination({
      page: options.page,
      limit: options.limit,
      defaultPage: DEFAULT_PAGE,
      defaultLimit: DEFAULT_LIMIT,
      maxLimit: MAX_LIMIT,
    });
    const where = this.buildWhere(options);

    const [total, data] = await Promise.all([
      this.prisma.shopFabric.count({ where }),
      this.prisma.shopFabric.findMany({
        where,
        select: FABRIC_SELECT,
        orderBy: [{ name: 'asc' }, { createdAt: 'desc' }],
        skip: pagination.skip,
        take: pagination.limit,
      }),
    ]);

    return toPaginatedResponse(data, total, pagination);
  }

  async getStats(branchId: string, search?: string) {
    const baseWhere = this.buildWhere({ branchId, search, includeArchived: false });
    const [totalItems, activeItems, inactiveItems] = await Promise.all([
      this.prisma.shopFabric.count({ where: baseWhere }),
      this.prisma.shopFabric.count({
        where: {
          ...baseWhere,
          isActive: true,
        },
      }),
      this.prisma.shopFabric.count({
        where: {
          ...baseWhere,
          isActive: false,
        },
      }),
    ]);

    return {
      totalItems,
      activeItems,
      inactiveItems,
    };
  }

  async findOne(id: string, branchId: string) {
    return this.getScopedFabric(id, branchId);
  }

  async create(branchId: string, dto: CreateShopFabricInput) {
    const name = this.normalizeText(dto.name);
    if (!name) {
      throw new BadRequestException('Fabric name is required');
    }

    await this.ensureCodeAvailable(branchId, dto.code);

    return this.prisma.shopFabric.create({
      data: {
        branchId,
        name,
        brand: this.normalizeText(dto.brand) ?? null,
        code: this.normalizeText(dto.code) ?? null,
        sellingRate: dto.sellingRate,
        isActive: dto.isActive ?? true,
        notes: this.normalizeText(dto.notes) ?? null,
      },
      select: FABRIC_SELECT,
    });
  }

  async update(
    id: string,
    currentBranchId: string,
    dto: Partial<CreateShopFabricInput>,
  ) {
    const existing = await this.getScopedFabric(id, currentBranchId);
    const nextBranchId = this.normalizeText(dto.branchId) ?? existing.branchId;
    const nextName = dto.name !== undefined ? this.normalizeText(dto.name) : existing.name;

    if (!nextName) {
      throw new BadRequestException('Fabric name is required');
    }

    await this.ensureCodeAvailable(nextBranchId, dto.code ?? existing.code ?? undefined, id);

    return this.prisma.shopFabric.update({
      where: { id },
      data: {
        branchId: nextBranchId,
        name: nextName,
        brand: dto.brand !== undefined ? this.normalizeText(dto.brand) ?? null : undefined,
        code: dto.code !== undefined ? this.normalizeText(dto.code) ?? null : undefined,
        sellingRate: dto.sellingRate,
        isActive: dto.isActive,
        notes: dto.notes !== undefined ? this.normalizeText(dto.notes) ?? null : undefined,
      },
      select: FABRIC_SELECT,
    });
  }

  async resolveFabricForOrderItem(
    branchId: string,
    fabricId: string,
    client: PrismaClientLike = this.prisma,
  ) {
    const fabric = await client.shopFabric.findFirst({
      where: {
        id: fabricId,
        branchId,
        deletedAt: null,
        isActive: true,
      },
      select: FABRIC_SELECT,
    });

    if (!fabric) {
      throw new BadRequestException('Selected shop fabric is not available in this branch');
    }

    return fabric;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateDesignTypeDto,
  UpdateDesignTypeDto,
} from './dto/design-type.dto';

@Injectable()
export class DesignTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDesignTypeDto) {
    return this.prisma.designType.create({
      data: dto,
    });
  }

  async findAll(branchId?: string, garmentTypeId?: string, search?: string) {
    const searchTerm = search?.trim();

    return this.prisma.designType.findMany({
      where: {
        AND: [
          { deletedAt: null },
          branchId ? { OR: [{ branchId }, { branchId: null }] } : {},
          garmentTypeId
            ? { OR: [{ garmentTypeId }, { garmentTypeId: null }] }
            : {},
          searchTerm
            ? {
                OR: [
                  { name: { contains: searchTerm, mode: 'insensitive' } },
                  {
                    garmentType: {
                      name: { contains: searchTerm, mode: 'insensitive' },
                    },
                  },
                ],
              }
            : {},
        ],
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string, scopeBranchId?: string) {
    const dt = await this.prisma.designType.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(scopeBranchId
          ? {
              OR: [{ branchId: scopeBranchId }, { branchId: null }],
            }
          : {}),
      },
    });
    if (!dt) throw new NotFoundException('Design Type not found');
    return dt;
  }

  async update(id: string, dto: UpdateDesignTypeDto, scopeBranchId?: string) {
    const existing = await this.prisma.designType.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(scopeBranchId ? { branchId: scopeBranchId } : {}),
      },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Design Type not found');
    }

    return this.prisma.designType.update({
      where: { id: existing.id },
      data: dto,
    });
  }

  async remove(id: string, scopeBranchId?: string) {
    const existing = await this.prisma.designType.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(scopeBranchId ? { branchId: scopeBranchId } : {}),
      },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Design Type not found');
    }

    return this.prisma.designType.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });
  }
}

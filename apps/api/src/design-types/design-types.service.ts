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

  async findOne(id: string) {
    const dt = await this.prisma.designType.findUnique({
      where: { id, deletedAt: null },
    });
    if (!dt) throw new NotFoundException('Design Type not found');
    return dt;
  }

  async update(id: string, dto: UpdateDesignTypeDto) {
    return this.prisma.designType.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.designType.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async seedDefaults() {
    const defaults = [
      { name: 'Simple', defaultPrice: 20000, defaultRate: 10000, sortOrder: 1 },
      { name: 'Heavy', defaultPrice: 50000, defaultRate: 25000, sortOrder: 2 },
      { name: 'Custom', defaultPrice: 0, defaultRate: 0, sortOrder: 3 },
    ];

    for (const d of defaults) {
      const exists = await this.prisma.designType.findFirst({
        where: { name: d.name, deletedAt: null },
      });
      if (!exists) {
        await this.prisma.designType.create({ data: d });
      }
    }
  }
}

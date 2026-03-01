import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateGarmentTypeDto, UpdateGarmentTypeDto, SetBranchPriceDto } from './dto/garment-type.dto';
import { CreateMeasurementCategoryDto, UpdateMeasurementCategoryDto, CreateMeasurementFieldDto, UpdateMeasurementFieldDto } from './dto/measurement-category.dto';

@Injectable()
export class ConfigService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Branches ---
  async getBranches() {
      return this.prisma.branch.findMany({
          orderBy: { createdAt: 'desc' },
          where: { isActive: true }
      });
  }
  async resolvePrices(garmentTypeId: string, branchId: string) {
    const [global, override] = await Promise.all([
      this.prisma.garmentType.findUniqueOrThrow({ where: { id: garmentTypeId } }),
      this.prisma.branchGarmentPrice.findUnique({
        where: { branchId_garmentTypeId: { branchId, garmentTypeId } }
      }),
    ]);
    
    return {
      customerPrice: override?.customerPrice ?? global.customerPrice,
      employeeRate: override?.employeeRate ?? global.employeeRate,
      garmentTypeName: global.name
    };
  }

  // --- Garment Types ---
  async getGarmentTypes(options: { 
    branchId?: string, 
    search?: string, 
    page?: number, 
    limit?: number 
  } = {}) {
      const { branchId, search, page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      const where: Prisma.GarmentTypeWhereInput = { isActive: true, deletedAt: null };
      if (search) {
          where.OR = [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } }
          ];
      }

      const [total, types] = await Promise.all([
          this.prisma.garmentType.count({ where }),
          this.prisma.garmentType.findMany({
              where,
              orderBy: { createdAt: 'desc' },
              skip,
              take: limit,
              include: { 
                measurementCategories: true,
                branchOverrides: branchId ? { where: { branchId } } : true 
              }
          })
      ]);

      const data = types.map((t) => {
          const overrides = (t as Prisma.GarmentTypeGetPayload<{ include: { branchOverrides: true } }>).branchOverrides || [];
          const override = branchId ? overrides[0] : null;
          const resolvedCustomerPrice = override?.customerPrice ?? t.customerPrice;
          const resolvedEmployeeRate = override?.employeeRate ?? t.employeeRate;
          
          return {
              ...t,
              resolvedCustomerPrice,
              resolvedEmployeeRate,
              isOverridden: !!override,
              overridesCount: overrides.length,
              marginAmount: resolvedCustomerPrice - resolvedEmployeeRate,
              marginPercentage: resolvedCustomerPrice > 0 ? Math.round(((resolvedCustomerPrice - resolvedEmployeeRate) / resolvedCustomerPrice) * 100) : 0,
              // Offset from global price (for the design's "Margin Offset")
              priceOffset: resolvedCustomerPrice - t.customerPrice
          };
      });

      return { data, total };
  }

  async getGarmentType(id: string, branchId?: string) {
      const garment = await this.prisma.garmentType.findUniqueOrThrow({
          where: { id, deletedAt: null },
          include: { 
            measurementCategories: {
              include: { fields: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } } }
            },
            branchOverrides: branchId ? { where: { branchId } } : true 
          }
      });

      const overrides = (garment as Prisma.GarmentTypeGetPayload<{ include: { branchOverrides: true } }>).branchOverrides || [];
      const override = branchId ? overrides[0] : null;
      const resolvedCustomerPrice = override?.customerPrice ?? garment.customerPrice;
      const resolvedEmployeeRate = override?.employeeRate ?? garment.employeeRate;

      return {
          ...garment,
          resolvedCustomerPrice,
          resolvedEmployeeRate,
          isOverridden: !!override,
          overridesCount: overrides.length,
          marginAmount: resolvedCustomerPrice - resolvedEmployeeRate,
          marginPercentage: resolvedCustomerPrice > 0 ? Math.round(((resolvedCustomerPrice - resolvedEmployeeRate) / resolvedCustomerPrice) * 100) : 0,
          priceOffset: resolvedCustomerPrice - garment.customerPrice
      };
  }

  async createGarmentType(dto: CreateGarmentTypeDto) {
      const { measurementCategoryIds, ...data } = dto;
      return this.prisma.garmentType.create({ 
        data: {
          ...data,
          measurementCategories: measurementCategoryIds ? {
            connect: measurementCategoryIds.map(id => ({ id }))
          } : undefined
        } 
      });
  }

  async updateGarmentType(id: string, dto: UpdateGarmentTypeDto) {
      await this.prisma.garmentType.findUniqueOrThrow({ where: { id }});
      const { measurementCategoryIds, ...data } = dto;
      return this.prisma.garmentType.update({ 
        where: { id }, 
        data: {
          ...data,
          measurementCategories: measurementCategoryIds ? {
            set: measurementCategoryIds.map(id => ({ id }))
          } : undefined
        } 
      });
  }

  async deleteGarmentType(id: string) {
      await this.prisma.garmentType.findUniqueOrThrow({ where: { id, deletedAt: null }});
      return this.prisma.garmentType.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  }

  async getGarmentStats() {
      const [totalCount, activeProduction, prices] = await Promise.all([
          this.prisma.garmentType.count({ where: { deletedAt: null } }),
          this.prisma.garmentType.count({ where: { deletedAt: null, isActive: true } }),
          this.prisma.garmentType.findMany({ 
              where: { deletedAt: null }, 
              select: { customerPrice: true } 
          })
      ]);

      const avgRetailPrice = prices.length > 0 
          ? prices.reduce((sum, p) => sum + p.customerPrice, 0) / prices.length 
          : 0;

      return {
          totalCount,
          avgRetailPrice,
          activeProduction
      };
  }

  // --- Branch Garment Price Overrides ---
  async getBranchPrices(garmentTypeId: string) {
      return this.prisma.branchGarmentPrice.findMany({
          where: { garmentTypeId },
          include: { branch: true }
      });
  }

  async setBranchPrice(garmentTypeId: string, branchId: string, dto: SetBranchPriceDto, userId: string) {
      // Get current price for logging
      const current = await this.prisma.branchGarmentPrice.findUnique({
          where: { branchId_garmentTypeId: { branchId, garmentTypeId } }
      });

      // Upsert override
      const result = await this.prisma.branchGarmentPrice.upsert({
          where: { branchId_garmentTypeId: { branchId, garmentTypeId } },
          create: {
              branchId,
              garmentTypeId,
              customerPrice: dto.customerPrice,
              employeeRate: dto.employeeRate
          },
          update: {
              customerPrice: dto.customerPrice,
              employeeRate: dto.employeeRate
          }
      });

      // Create log
      await this.prisma.branchPriceLog.create({
          data: {
              branch: { connect: { id: branchId } },
              garmentType: { connect: { id: garmentTypeId } },
              changedBy: { connect: { id: userId } },
              oldCustomerPrice: current?.customerPrice ?? null,
              oldEmployeeRate: current?.employeeRate ?? null,
              newCustomerPrice: dto.customerPrice,
              newEmployeeRate: dto.employeeRate,
              action: 'UPDATE'
          }
      });

      return result;
  }

  async deleteBranchPrice(garmentTypeId: string, branchId: string, userId: string) {
      const current = await this.prisma.branchGarmentPrice.findUnique({
          where: { branchId_garmentTypeId: { branchId, garmentTypeId } }
      });

      if (!current) return;

      const result = await this.prisma.branchGarmentPrice.delete({
          where: { branchId_garmentTypeId: { branchId, garmentTypeId } }
      });

      // Create log
      await this.prisma.branchPriceLog.create({
          data: {
              branch: { connect: { id: branchId } },
              garmentType: { connect: { id: garmentTypeId } },
              changedBy: { connect: { id: userId } },
              oldCustomerPrice: current.customerPrice,
              oldEmployeeRate: current.employeeRate,
              newCustomerPrice: null,
              newEmployeeRate: null,
              action: 'RESET'
          }
      });

      return result;
  }

  async getBranchPriceHistory(garmentTypeId: string, branchId: string) {
      return this.prisma.branchPriceLog.findMany({
          where: { garmentTypeId, branchId },
          orderBy: { createdAt: 'desc' },
          include: { 
              changedBy: { select: { name: true, email: true } },
              garmentType: { select: { name: true } }
          }
      });
  }

  // --- Measurement Categories & Fields ---
  async getMeasurementCategories(options: { search?: string; page?: number; limit?: number } = {}) {
      const { search, page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      const where: Prisma.MeasurementCategoryWhereInput = { isActive: true, deletedAt: null };
      if (search) {
          where.name = { contains: search, mode: 'insensitive' };
      }

      const [total, data] = await Promise.all([
          this.prisma.measurementCategory.count({ where }),
          this.prisma.measurementCategory.findMany({
              where,
              orderBy: { createdAt: 'desc' },
              skip,
              take: limit,
              include: { fields: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } } }
          })
      ]);

      return { data, total };
  }

  async createMeasurementCategory(dto: CreateMeasurementCategoryDto) {
      const { fields, ...data } = dto;
      
      const createData: Prisma.MeasurementCategoryCreateInput = {
          ...data,
          name: data.name,
          fields: fields ? {
              create: fields.map(f => ({
                  label: f.label,
                  fieldType: f.fieldType,
                  unit: f.unit,
                  isRequired: f.isRequired,
                  sortOrder: f.sortOrder,
                  dropdownOptions: f.dropdownOptions
              }))
          } : undefined
      };

      return this.prisma.measurementCategory.create({ 
          data: createData
      });
  }

  async updateMeasurementCategory(id: string, dto: UpdateMeasurementCategoryDto) {
    await this.prisma.measurementCategory.findUniqueOrThrow({ where: { id }});
    // For now, we only update the category details. 
    // MeasurementCategoryDialog specifically handles CATEGORY edit, 
    // and MeasurementCategoryDetail handles FIELD edits separately.
    // However, the user wants "Save Category" to work when fields are present.
    return this.prisma.measurementCategory.update({ 
        where: { id }, 
        data: dto 
    });
  }

  async addMeasurementField(categoryId: string, dto: CreateMeasurementFieldDto) {
      const label = dto.label;
      const category = await this.prisma.measurementCategory.findUniqueOrThrow({ 
        where: { id: categoryId },
        include: { fields: { where: { deletedAt: null } } }
      });

      const isDuplicate = category.fields.some(f => f.label.toLowerCase() === label.toLowerCase());
      if (isDuplicate) {
          throw new ConflictException(`A field with label "${label}" already exists in this category.`);
      }

      return this.prisma.measurementField.create({
          data: { ...dto, categoryId }
      });
  }

  async updateMeasurementField(id: string, dto: UpdateMeasurementFieldDto) {
      const field = await this.prisma.measurementField.findUniqueOrThrow({ where: { id }});
      
      if (dto.label) {
          const label = dto.label;
          const category = await this.prisma.measurementCategory.findUniqueOrThrow({ 
            where: { id: field.categoryId },
            include: { fields: { where: { deletedAt: null, NOT: { id } } } }
          });

          const isDuplicate = category.fields.some(f => f.label.toLowerCase() === label.toLowerCase());
          if (isDuplicate) {
              throw new ConflictException(`A field with label "${label}" already exists in this category.`);
          }
      }

      return this.prisma.measurementField.update({
          where: { id },
          data: dto
      });
  }

  async deleteMeasurementField(id: string) {
      await this.prisma.measurementField.findUniqueOrThrow({ where: { id, deletedAt: null }});
      return this.prisma.measurementField.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async deleteMeasurementCategory(id: string) {
      await this.prisma.measurementCategory.findUniqueOrThrow({ where: { id, deletedAt: null }});
      return this.prisma.measurementCategory.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  }
}

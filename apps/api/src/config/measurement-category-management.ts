import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CreateMeasurementCategoryDto,
  UpdateMeasurementCategoryDto,
} from './dto/measurement-category.dto';
import { normalizeMeasurementFieldLabel } from './measurement-field-management';
import { PrismaService } from '../prisma/prisma.service';

export function normalizeMeasurementCategoryName(name: string): string {
  const normalizedName = name.trim();

  if (!normalizedName) {
    throw new BadRequestException('Category name is required.');
  }

  return normalizedName;
}

export function toMeasurementCategoryCreateInput(
  dto: CreateMeasurementCategoryDto,
): Prisma.MeasurementCategoryCreateInput {
  const { fields, ...data } = dto;

  return {
    ...data,
    name: normalizeMeasurementCategoryName(data.name),
    fields: fields?.length
      ? {
          create: fields.map((field) => ({
            label: normalizeMeasurementFieldLabel(field.label),
            fieldType: field.fieldType,
            unit: field.unit,
            isRequired: field.isRequired,
            sortOrder: field.sortOrder,
            dropdownOptions: field.dropdownOptions,
          })),
        }
      : undefined,
  };
}

export function toMeasurementCategoryUpdateInput(
  dto: UpdateMeasurementCategoryDto,
): Prisma.MeasurementCategoryUpdateInput {
  return {
    ...(dto.name !== undefined
      ? { name: normalizeMeasurementCategoryName(dto.name) }
      : {}),
    ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
    ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
  };
}

export async function resolveMeasurementCategoryArchivePlan(
  prisma: PrismaService,
  id: string,
): Promise<{
  category: {
    id: string;
    garmentTypes: Array<{ id: string }>;
    fields: Array<{ id: string }>;
    sections: Array<{ id: string }>;
  };
  historicalMeasurementCount: number;
}> {
  const category = await prisma.measurementCategory.findFirst({
    where: { id, deletedAt: null },
    include: {
      garmentTypes: {
        where: { deletedAt: null },
        select: { id: true },
      },
      fields: {
        where: { deletedAt: null },
        select: { id: true },
      },
      sections: {
        where: { deletedAt: null },
        select: { id: true },
      },
    },
  });

  if (!category) {
    throw new NotFoundException('Measurement category not found.');
  }

  const historicalMeasurementCount = await prisma.customerMeasurement.count({
    where: { categoryId: id },
  });

  return {
    category: {
      id: category.id,
      garmentTypes: category.garmentTypes,
      fields: category.fields,
      sections: category.sections,
    },
    historicalMeasurementCount,
  };
}

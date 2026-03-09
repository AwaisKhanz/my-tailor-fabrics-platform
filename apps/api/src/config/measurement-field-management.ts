import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CreateMeasurementFieldDto,
  UpdateMeasurementFieldDto,
} from './dto/measurement-category.dto';
import { PrismaService } from '../prisma/prisma.service';

type MeasurementFieldDbClient = PrismaService | Prisma.TransactionClient;

export function normalizeMeasurementFieldLabel(label: string): string {
  const normalizedLabel = label.trim();
  if (!normalizedLabel) {
    throw new BadRequestException('Field label is required.');
  }

  return normalizedLabel;
}

export function toMeasurementFieldCreateInput(params: {
  dto: CreateMeasurementFieldDto;
  categoryId: string;
  sectionId: string;
}): Prisma.MeasurementFieldUncheckedCreateInput {
  const { dto, categoryId, sectionId } = params;

  return {
    label: normalizeMeasurementFieldLabel(dto.label),
    ...(dto.fieldType !== undefined ? { fieldType: dto.fieldType } : {}),
    ...(dto.isRequired !== undefined ? { isRequired: dto.isRequired } : {}),
    ...(dto.dropdownOptions !== undefined
      ? { dropdownOptions: dto.dropdownOptions }
      : {}),
    ...(dto.unit !== undefined ? { unit: dto.unit } : {}),
    ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
    categoryId,
    sectionId,
  };
}

export function toMeasurementFieldUpdateInput(params: {
  dto: UpdateMeasurementFieldDto;
  sectionId?: string;
}): Prisma.MeasurementFieldUncheckedUpdateInput {
  const { dto, sectionId } = params;

  return {
    ...(dto.fieldType !== undefined ? { fieldType: dto.fieldType } : {}),
    ...(dto.isRequired !== undefined ? { isRequired: dto.isRequired } : {}),
    ...(dto.dropdownOptions !== undefined
      ? { dropdownOptions: dto.dropdownOptions }
      : {}),
    ...(dto.unit !== undefined ? { unit: dto.unit } : {}),
    ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
    ...(dto.label !== undefined
      ? { label: normalizeMeasurementFieldLabel(dto.label) }
      : {}),
    ...(sectionId ? { sectionId } : {}),
  };
}

export async function assertUniqueMeasurementFieldLabel(
  db: MeasurementFieldDbClient,
  params: {
    categoryId: string;
    label: string;
    excludeFieldId?: string;
  },
): Promise<void> {
  const category = await db.measurementCategory.findUniqueOrThrow({
    where: { id: params.categoryId },
    include: {
      fields: {
        where: {
          deletedAt: null,
          ...(params.excludeFieldId ? { NOT: { id: params.excludeFieldId } } : {}),
        },
      },
    },
  });

  const isDuplicate = category.fields.some(
    (field) => field.label.toLowerCase() === params.label.toLowerCase(),
  );

  if (isDuplicate) {
    throw new ConflictException(
      `A field with label "${params.label}" already exists in this category.`,
    );
  }
}

export async function resolveMeasurementFieldArchivePlan(
  prisma: PrismaService,
  id: string,
): Promise<{
  field: {
    id: string;
    categoryId: string;
  };
  customerMeasurementCount: number;
}> {
  const field = await prisma.measurementField.findFirstOrThrow({
    where: { id, deletedAt: null },
    select: { id: true, categoryId: true },
  });

  if (!field) {
    throw new NotFoundException('Measurement field not found.');
  }

  const customerMeasurementCount = await prisma.customerMeasurement.count({
    where: { categoryId: field.categoryId },
  });

  return {
    field,
    customerMeasurementCount,
  };
}

export function buildMeasurementFieldArchiveResponse(params: {
  archivedFieldId: string;
  customerMeasurementCount: number;
}) {
  return {
    action: 'ARCHIVE' as const,
    blocked: false,
    blockedReasons: [],
    affected: {
      fields: 1,
      historicalCustomerMeasurements: params.customerMeasurementCount,
    },
    archivedFieldId: params.archivedFieldId,
  };
}

import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type MeasurementFieldDbClient = PrismaService | Prisma.TransactionClient;

export function normalizeMeasurementFieldLabel(label: string): string {
  const normalizedLabel = label.trim();
  if (!normalizedLabel) {
    throw new BadRequestException('Field label is required.');
  }

  return normalizedLabel;
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

import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type MeasurementSectionClient = PrismaService | Prisma.TransactionClient;

export async function getNextSectionSortOrder(
  categoryId: string,
  client: MeasurementSectionClient,
) {
  const aggregate = await client.measurementSection.aggregate({
    where: { categoryId, deletedAt: null },
    _max: { sortOrder: true },
  });

  return (aggregate._max.sortOrder ?? -1) + 1;
}

export async function ensureDefaultMeasurementSection(
  categoryId: string,
  client: MeasurementSectionClient,
) {
  const existingDefault = await client.measurementSection.findFirst({
    where: {
      categoryId,
      deletedAt: null,
      name: { equals: 'General', mode: 'insensitive' },
    },
  });

  if (existingDefault) {
    return existingDefault;
  }

  const nextSortOrder = await getNextSectionSortOrder(categoryId, client);
  return client.measurementSection.create({
    data: {
      categoryId,
      name: 'General',
      sortOrder: nextSortOrder,
    },
  });
}

export async function resolveMeasurementSection(
  categoryId: string,
  client: MeasurementSectionClient,
  sectionId?: string,
  sectionName?: string,
) {
  const normalizedSectionId = sectionId?.trim();
  if (normalizedSectionId) {
    const section = await client.measurementSection.findFirst({
      where: { id: normalizedSectionId, deletedAt: null },
    });

    if (!section || section.categoryId !== categoryId) {
      throw new NotFoundException('Measurement section not found.');
    }

    return section;
  }

  const normalizedSectionName = sectionName?.trim();
  if (normalizedSectionName) {
    const existing = await client.measurementSection.findFirst({
      where: {
        categoryId,
        deletedAt: null,
        name: { equals: normalizedSectionName, mode: 'insensitive' },
      },
    });

    if (existing) {
      return existing;
    }

    const nextSortOrder = await getNextSectionSortOrder(categoryId, client);
    return client.measurementSection.create({
      data: {
        categoryId,
        name: normalizedSectionName,
        sortOrder: nextSortOrder,
      },
    });
  }

  return ensureDefaultMeasurementSection(categoryId, client);
}

import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type MeasurementSectionDbClient = PrismaService | Prisma.TransactionClient;

type ArchiveBlockedReason = {
  code: string;
  message: string;
};

type ArchiveTargetSection = {
  id: string;
  categoryId: string;
} | null;

type MeasurementSectionArchivePlan = {
  section: {
    id: string;
    categoryId: string;
  };
  activeFieldCount: number;
  blockedReasons: ArchiveBlockedReason[];
  targetSection: ArchiveTargetSection;
};

export function normalizeMeasurementSectionName(name: string): string {
  const normalizedName = name.trim();
  if (!normalizedName) {
    throw new BadRequestException('Section name is required.');
  }

  return normalizedName;
}

export async function assertUniqueMeasurementSectionName(
  db: MeasurementSectionDbClient,
  params: {
    categoryId: string;
    name: string;
    excludeSectionId?: string;
  },
): Promise<void> {
  const duplicate = await db.measurementSection.findFirst({
    where: {
      categoryId: params.categoryId,
      deletedAt: null,
      ...(params.excludeSectionId
        ? { id: { not: params.excludeSectionId } }
        : {}),
      name: { equals: params.name, mode: 'insensitive' },
    },
  });

  if (duplicate) {
    throw new ConflictException(
      `Section "${params.name}" already exists in this category.`,
    );
  }
}

export async function resolveMeasurementSectionArchivePlan(
  prisma: PrismaService,
  sectionId: string,
  targetSectionIdRaw?: string,
): Promise<MeasurementSectionArchivePlan> {
  const section = await prisma.measurementSection.findUnique({
    where: { id: sectionId },
    include: {
      category: {
        select: {
          id: true,
          deletedAt: true,
        },
      },
    },
  });

  if (!section || section.deletedAt || section.category.deletedAt) {
    throw new NotFoundException('Measurement section not found.');
  }

  const activeFieldCount = await prisma.measurementField.count({
    where: { sectionId, deletedAt: null },
  });

  const targetSectionId = targetSectionIdRaw?.trim();
  const blockedReasons: ArchiveBlockedReason[] = [];
  let targetSection: ArchiveTargetSection = null;

  if (activeFieldCount > 0) {
    if (!targetSectionId) {
      blockedReasons.push({
        code: 'TARGET_SECTION_REQUIRED',
        message:
          'Target section is required to move fields before archiving this section.',
      });
    }

    if (targetSectionId && targetSectionId === sectionId) {
      blockedReasons.push({
        code: 'TARGET_SECTION_INVALID',
        message:
          'Target section must be different from the section being archived.',
      });
    }

    if (targetSectionId && targetSectionId !== sectionId) {
      targetSection = await prisma.measurementSection.findFirst({
        where: { id: targetSectionId, deletedAt: null },
        select: { id: true, categoryId: true },
      });

      if (!targetSection || targetSection.categoryId !== section.categoryId) {
        blockedReasons.push({
          code: 'TARGET_SECTION_NOT_FOUND',
          message:
            'Target measurement section was not found in this category.',
        });
      }
    }
  }

  return {
    section: {
      id: section.id,
      categoryId: section.category.id,
    },
    activeFieldCount,
    blockedReasons,
    targetSection,
  };
}

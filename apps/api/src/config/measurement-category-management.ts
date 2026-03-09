import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

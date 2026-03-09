import type { Prisma } from '@prisma/client';
import type {
  CreateGarmentTypeDto,
  UpdateGarmentTypeDto,
} from './dto/garment-type.dto';

function toMeasurementCategoryConnect(
  measurementCategoryIds: readonly string[],
): { id: string }[] {
  return measurementCategoryIds.map((id) => ({ id }));
}

export function buildGarmentTypeCreateData(
  dto: CreateGarmentTypeDto,
): Prisma.GarmentTypeCreateArgs['data'] {
  const { measurementCategoryIds, ...data } = dto;

  return {
    ...data,
    measurementCategories: measurementCategoryIds
      ? {
          connect: toMeasurementCategoryConnect(measurementCategoryIds),
        }
      : undefined,
  };
}

export function buildGarmentTypeUpdateData(
  dto: UpdateGarmentTypeDto,
): Prisma.GarmentTypeUpdateArgs['data'] {
  const { measurementCategoryIds, ...data } = dto;

  return {
    ...data,
    measurementCategories: measurementCategoryIds
      ? {
          set: toMeasurementCategoryConnect(measurementCategoryIds),
        }
      : undefined,
  };
}

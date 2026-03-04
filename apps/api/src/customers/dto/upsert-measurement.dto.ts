import { IsString, IsObject } from 'class-validator';
import { type MeasurementValues } from '@tbms/shared-types';

export class UpsertMeasurementDto {
  @IsString()
  categoryId!: string;

  @IsObject()
  values!: MeasurementValues;
}

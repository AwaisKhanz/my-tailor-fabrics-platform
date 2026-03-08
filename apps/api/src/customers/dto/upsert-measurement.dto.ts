import { IsString, IsObject } from 'class-validator';
import { type MeasurementValues } from '@tbms/shared-types';
import { IsCuidString } from '../../common/validators/is-cuid-string';

export class UpsertMeasurementDto {
  @IsString()
  @IsCuidString()
  categoryId!: string;

  @IsObject()
  values!: MeasurementValues;
}

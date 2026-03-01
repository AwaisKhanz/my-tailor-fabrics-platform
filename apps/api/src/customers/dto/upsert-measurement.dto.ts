import { IsString, IsObject } from 'class-validator';

export class UpsertMeasurementDto {
  @IsString()
  categoryId!: string;

  @IsObject()
  values!: Record<string, unknown>;
}

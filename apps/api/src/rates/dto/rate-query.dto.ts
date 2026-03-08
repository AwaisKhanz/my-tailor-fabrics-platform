import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { transformOptionalString } from '../../common/dto/query-transformers';

export class SearchRatesQueryDto {
  @IsOptional()
  @Transform(transformOptionalString)
  @IsString()
  search?: string;
}

export class RateHistoryQueryDto {
  @Transform(transformOptionalString)
  @IsString()
  garmentTypeId!: string;

  @Transform(transformOptionalString)
  @IsString()
  stepKey!: string;

  @IsOptional()
  @Transform(transformOptionalString)
  @IsString()
  branchId?: string;
}

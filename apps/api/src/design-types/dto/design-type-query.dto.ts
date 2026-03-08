import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { transformOptionalString } from '../../common/dto/query-transformers';

export class ListDesignTypesQueryDto {
  @IsOptional()
  @Transform(transformOptionalString)
  @IsString()
  branchId?: string;

  @IsOptional()
  @Transform(transformOptionalString)
  @IsString()
  garmentTypeId?: string;

  @IsOptional()
  @Transform(transformOptionalString)
  @IsString()
  search?: string;
}

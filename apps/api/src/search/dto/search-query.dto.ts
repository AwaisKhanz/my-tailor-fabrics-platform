import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import {
  transformOptionalPositiveInt,
  transformOptionalString,
} from '../../common/dto/query-transformers';

export class SearchLookupQueryDto {
  @IsOptional()
  @Transform(transformOptionalString)
  @IsString()
  q?: string;

  @IsOptional()
  @Transform(transformOptionalPositiveInt)
  @IsInt()
  @Min(1)
  limit?: number;
}

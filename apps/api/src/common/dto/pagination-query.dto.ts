import { Transform, type TransformFnParams } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { parseOptionalPositiveInt } from '../utils/query-parsing.util';

function transformOptionalPositiveInt({
  value,
}: TransformFnParams): number | undefined {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value > 0 ? value : undefined;
  }

  if (typeof value === 'string') {
    return parseOptionalPositiveInt(value);
  }

  return undefined;
}

export class PaginationQueryDto {
  @IsOptional()
  @Transform(transformOptionalPositiveInt)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(transformOptionalPositiveInt)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  isVip?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  q?: string;
}

import { Transform } from 'class-transformer';
import { IsDateString, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { transformOptionalString } from '../../common/dto/query-transformers';
import { IsCuidString } from '../../common/validators/is-cuid-string';

class AuditLogFiltersQueryDto {
  @IsOptional()
  @Transform(transformOptionalString)
  @IsString()
  action?: string;

  @IsOptional()
  @Transform(transformOptionalString)
  @IsString()
  entity?: string;

  @IsOptional()
  @Transform(transformOptionalString)
  @IsString()
  @IsCuidString()
  userId?: string;

  @IsOptional()
  @Transform(transformOptionalString)
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(transformOptionalString)
  @IsDateString()
  from?: string;

  @IsOptional()
  @Transform(transformOptionalString)
  @IsDateString()
  to?: string;

  @IsOptional()
  @Transform(transformOptionalString)
  @IsString()
  @IsCuidString()
  branchId?: string;
}

export class AuditLogsListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(transformOptionalString)
  @IsString()
  declare action?: string;

  @IsOptional()
  @Transform(transformOptionalString)
  @IsString()
  declare entity?: string;

  @IsOptional()
  @Transform(transformOptionalString)
  @IsString()
  @IsCuidString()
  declare userId?: string;

  @IsOptional()
  @Transform(transformOptionalString)
  @IsString()
  declare search?: string;

  @IsOptional()
  @Transform(transformOptionalString)
  @IsDateString()
  declare from?: string;

  @IsOptional()
  @Transform(transformOptionalString)
  @IsDateString()
  declare to?: string;

  @IsOptional()
  @Transform(transformOptionalString)
  @IsString()
  @IsCuidString()
  branchId?: string;
}

export class AuditLogsStatsQueryDto extends AuditLogFiltersQueryDto {}

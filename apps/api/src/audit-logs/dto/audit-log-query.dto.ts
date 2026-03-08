import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

class AuditLogFiltersQueryDto {
  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  entity?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsString()
  branchId?: string;
}

export class AuditLogsListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  declare action?: string;

  @IsOptional()
  @IsString()
  declare entity?: string;

  @IsOptional()
  @IsString()
  declare userId?: string;

  @IsOptional()
  @IsString()
  declare search?: string;

  @IsOptional()
  @IsString()
  declare from?: string;

  @IsOptional()
  @IsString()
  declare to?: string;

  @IsOptional()
  @IsString()
  branchId?: string;
}

export class AuditLogsStatsQueryDto extends AuditLogFiltersQueryDto {}

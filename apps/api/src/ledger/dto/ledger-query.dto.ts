import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { LedgerEntryType } from '@tbms/shared-types';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import {
  transformOptionalPositiveInt,
  transformOptionalString,
} from '../../common/dto/query-transformers';

export class LedgerStatementQueryDto extends PaginationQueryDto {
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
  @IsEnum(LedgerEntryType)
  type?: LedgerEntryType;
}

export class LedgerEarningsQueryDto {
  @IsOptional()
  @Transform(transformOptionalPositiveInt)
  @IsInt()
  @Min(1)
  weeksBack?: number;
}

import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  transformOptionalPositiveInt,
  transformOptionalString,
} from '../../common/dto/query-transformers';
import { IsCuidString } from '../../common/validators/is-cuid-string';

export class BranchScopedReportQueryDto {
  @IsOptional()
  @Transform(transformOptionalString)
  @IsString()
  @IsCuidString()
  branchId?: string;
}

export class DateRangeReportQueryDto extends BranchScopedReportQueryDto {
  @IsOptional()
  @Transform(transformOptionalString)
  @IsDateString()
  from?: string;

  @IsOptional()
  @Transform(transformOptionalString)
  @IsDateString()
  to?: string;
}

export class FinancialTrendQueryDto extends DateRangeReportQueryDto {
  @IsOptional()
  @Transform(transformOptionalString)
  @IsIn(['day', 'week', 'month'])
  granularity?: 'day' | 'week' | 'month';
}

export class RevenueVsExpensesQueryDto extends BranchScopedReportQueryDto {
  @IsOptional()
  @Transform(transformOptionalPositiveInt)
  @IsInt()
  @Min(1)
  months?: number;
}

export class ProductivityQueryDto extends DateRangeReportQueryDto {
  @IsOptional()
  @Transform(transformOptionalPositiveInt)
  @IsInt()
  @Min(1)
  limit?: number;
}

export class ExportReportQueryDto extends DateRangeReportQueryDto {
  @IsOptional()
  @Transform(transformOptionalString)
  @IsIn(['pdf', 'xlsx'])
  format?: 'pdf' | 'xlsx';
}

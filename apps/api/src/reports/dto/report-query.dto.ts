import { Transform, type TransformFnParams } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { parseOptionalPositiveInt } from '../../common/utils/query-parsing.util';

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

export class BranchScopedReportQueryDto {
  @IsOptional()
  @IsString()
  branchId?: string;
}

export class DateRangeReportQueryDto extends BranchScopedReportQueryDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;
}

export class FinancialTrendQueryDto extends DateRangeReportQueryDto {
  @IsOptional()
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
  @IsIn(['pdf', 'xlsx'])
  format?: 'pdf' | 'xlsx';
}

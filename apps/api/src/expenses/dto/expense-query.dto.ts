import { Transform } from 'class-transformer';
import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { transformOptionalString } from '../../common/dto/query-transformers';
import { IsCuidString } from '../../common/validators/is-cuid-string';

const EXPENSE_SORT_FIELDS = ['expenseDate', 'amount', 'createdAt'] as const;

export class ListExpensesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(transformOptionalString)
  @IsString()
  @IsCuidString()
  categoryId?: string;

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
  @IsIn(EXPENSE_SORT_FIELDS)
  sortBy?: (typeof EXPENSE_SORT_FIELDS)[number];

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

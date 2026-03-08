import { Transform } from 'class-transformer';
import { IsDateString, IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { transformOptionalString } from '../../common/dto/query-transformers';

const PAYMENT_HISTORY_SORT_FIELDS = ['paidAt', 'createdAt', 'amount'] as const;

export class PaymentsHistoryQueryDto extends PaginationQueryDto {
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
  @IsIn(PAYMENT_HISTORY_SORT_FIELDS)
  sortBy?: (typeof PAYMENT_HISTORY_SORT_FIELDS)[number];

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

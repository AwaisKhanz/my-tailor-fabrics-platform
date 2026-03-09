import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';
import { OrderStatus } from '@tbms/shared-types';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { transformOptionalString } from '../../common/dto/query-transformers';
import { IsCuidString } from '../../common/validators/is-cuid-string';

const ORDER_SORT_FIELDS = [
  'orderNumber',
  'orderDate',
  'dueDate',
  'totalAmount',
  'status',
  'customer',
] as const;

export class OrdersListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(transformOptionalString)
  @IsEnum(OrderStatus)
  declare status?: OrderStatus;

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
  declare employeeId?: string;

  @IsOptional()
  @Transform(transformOptionalString)
  @IsString()
  declare search?: string;

  @IsOptional()
  @Transform(transformOptionalString)
  @IsIn(ORDER_SORT_FIELDS)
  declare sortBy?: (typeof ORDER_SORT_FIELDS)[number];

  @IsOptional()
  @Transform(transformOptionalString)
  @IsIn(['asc', 'desc'])
  declare sortOrder?: 'asc' | 'desc';
}

export class OrdersSummaryQueryDto {
  @IsOptional()
  @Transform(transformOptionalString)
  @IsEnum(OrderStatus)
  status?: OrderStatus;

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
  employeeId?: string;

  @IsOptional()
  @Transform(transformOptionalString)
  @IsString()
  search?: string;
}

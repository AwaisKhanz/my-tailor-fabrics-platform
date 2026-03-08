import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '@tbms/shared-types';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

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
  @IsEnum(OrderStatus)
  declare status?: OrderStatus;

  @IsOptional()
  @IsString()
  declare from?: string;

  @IsOptional()
  @IsString()
  declare to?: string;

  @IsOptional()
  @IsString()
  declare employeeId?: string;

  @IsOptional()
  @IsString()
  declare search?: string;

  @IsOptional()
  @IsIn(ORDER_SORT_FIELDS)
  declare sortBy?: (typeof ORDER_SORT_FIELDS)[number];

  @IsOptional()
  @IsIn(['asc', 'desc'])
  declare sortOrder?: 'asc' | 'desc';
}

export class OrdersSummaryQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}

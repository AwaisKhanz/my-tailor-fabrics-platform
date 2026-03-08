import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { CustomerStatus } from '@tbms/shared-types';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import {
  transformOptionalBoolean,
  transformOptionalString,
} from '../../common/dto/query-transformers';

export class CustomersListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(transformOptionalBoolean)
  @IsBoolean()
  isVip?: boolean;

  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;
}

export class CustomersSummaryQueryDto {
  @IsOptional()
  @Transform(transformOptionalString)
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(transformOptionalBoolean)
  @IsBoolean()
  isVip?: boolean;

  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;
}

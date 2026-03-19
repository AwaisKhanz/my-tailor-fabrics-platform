import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  transformOptionalBoolean,
  transformOptionalString,
} from '../../common/dto/query-transformers';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class CreateShopFabricDto {
  @IsOptional()
  @IsString()
  branchId?: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sellingRate!: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateShopFabricDto {
  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sellingRate?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ListShopFabricsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(transformOptionalBoolean)
  @IsBoolean()
  activeOnly?: boolean;

  @IsOptional()
  @Transform(transformOptionalBoolean)
  @IsBoolean()
  includeArchived?: boolean;
}

export class ShopFabricSelectQueryDto {
  @IsOptional()
  @Transform(transformOptionalString)
  @IsString()
  search?: string;
}

import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  AddonType,
  DiscountType,
  FabricSource,
  ItemStatus,
} from '@tbms/shared-types';

export class UpdateOrderItemAddonDto {
  @IsEnum(AddonType)
  type!: AddonType;

  @IsString()
  name!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @IsOptional()
  cost?: number;
}

export class UpdateOrderItemDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  garmentTypeId?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(FabricSource)
  @IsOptional()
  fabricSource?: FabricSource;

  @IsString()
  @IsOptional()
  employeeId?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  designTypeId?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemAddonDto)
  addons?: UpdateOrderItemAddonDto[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  unitPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  employeeRate?: number;
}

export class UpdateOrderItemAssignmentDto {
  @IsEnum(ItemStatus)
  @IsOptional()
  status?: ItemStatus;

  @IsString()
  @IsOptional()
  employeeId?: string;
}

export class UpdateOrderDto {
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(DiscountType)
  @IsOptional()
  discountType?: DiscountType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discountValue?: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderItemDto)
  items?: UpdateOrderItemDto[];
}

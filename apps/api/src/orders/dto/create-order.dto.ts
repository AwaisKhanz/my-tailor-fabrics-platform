import {
  IsString,
  IsNotEmpty,
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
} from '@tbms/shared-types';
import { IsCuidString } from '../../common/validators/is-cuid-string';

export class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  garmentTypeId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsString()
  @IsOptional()
  description?: string; // fabric color, embroidery etc.

  @IsEnum(FabricSource)
  @IsOptional()
  fabricSource?: FabricSource;

  @IsString()
  @IsOptional()
  shopFabricId?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  shopFabricPrice?: number;

  @IsString()
  @IsOptional()
  customerFabricNote?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string; // Optional item-specific due date

  @IsString()
  @IsOptional()
  designTypeId?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OrderItemAddonDto)
  addons?: OrderItemAddonDto[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  unitPrice?: number;
}

export class OrderItemAddonDto {
  @IsEnum(AddonType)
  @IsNotEmpty()
  type!: AddonType;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @IsOptional()
  cost?: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @IsCuidString()
  customerId!: string;

  @IsDateString()
  @IsNotEmpty()
  dueDate!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @IsEnum(DiscountType)
  @IsOptional()
  discountType?: DiscountType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discountValue?: number; // Paisas if FIXED, basis points if PERCENTAGE

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  advancePayment?: number; // Optional initial payment in paisas
}

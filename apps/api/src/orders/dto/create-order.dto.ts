import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsArray, ValidateNested, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DiscountType, FabricSource } from '@tbms/shared-types';

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
  employeeId?: string; // Optional tailor assignment at creation

  @IsDateString()
  @IsOptional()
  dueDate?: string; // Optional item-specific due date
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
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

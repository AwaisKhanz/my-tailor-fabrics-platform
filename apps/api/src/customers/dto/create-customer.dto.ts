import { IsString, IsOptional, IsEnum, IsNotEmpty, ValidateNested, IsArray } from 'class-validator';
import { CustomerStatus } from '@tbms/shared-types';
import { Type } from 'class-transformer';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsOptional()
  whatsapp?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateCustomerDto extends CreateCustomerDto {
  @IsEnum(CustomerStatus)
  @IsOptional()
  status?: CustomerStatus;
}

import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { IsCuidString } from '../../common/validators/is-cuid-string';

export class CreateDesignTypeDto {
  @IsString()
  name: string;

  @IsNumber()
  defaultPrice: number;

  @IsNumber()
  defaultRate: number;

  @IsOptional()
  @IsString()
  @IsCuidString()
  branchId?: string;

  @IsOptional()
  @IsString()
  @IsCuidString()
  garmentTypeId?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateDesignTypeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  defaultPrice?: number;

  @IsOptional()
  @IsNumber()
  defaultRate?: number;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

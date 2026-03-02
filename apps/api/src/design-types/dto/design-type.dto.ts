import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateDesignTypeDto {
  @IsString()
  name: string;

  @IsNumber()
  defaultPrice: number;

  @IsNumber()
  defaultRate: number;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsString()
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

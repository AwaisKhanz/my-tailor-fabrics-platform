import { IsString, IsInt, IsOptional, IsBoolean } from 'class-validator';

export class CreateGarmentTypeDto {
  @IsString()
  name!: string;

  @IsInt()
  customerPrice!: number;

  @IsInt()
  employeeRate!: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @IsString({ each: true })
  @IsOptional()
  measurementCategoryIds?: string[];
}

export class UpdateGarmentTypeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  customerPrice?: number;

  @IsInt()
  @IsOptional()
  employeeRate?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @IsString({ each: true })
  @IsOptional()
  measurementCategoryIds?: string[];
}

export class SetBranchPriceDto {
  @IsInt()
  @IsOptional()
  customerPrice?: number;

  @IsInt()
  @IsOptional()
  employeeRate?: number;
}

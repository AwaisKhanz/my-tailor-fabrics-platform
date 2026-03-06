import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateGarmentTypeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(0)
  customerPrice!: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @IsOptional()
  @Min(0)
  sortOrder?: number;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  measurementCategoryIds?: string[];
}

export class UpdateGarmentTypeDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  customerPrice?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @IsOptional()
  @Min(0)
  sortOrder?: number;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  measurementCategoryIds?: string[];
}

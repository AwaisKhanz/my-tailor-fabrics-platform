import { IsString, IsBoolean, IsOptional, IsInt, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FieldType } from '@tbms/shared-types';

export class CreateMeasurementCategoryDto {
  @IsString()
  name!: string;

  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateMeasurementFieldDto)
  fields?: CreateMeasurementFieldDto[];
}

export class UpdateMeasurementCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateMeasurementFieldDto {
  @IsString()
  label!: string;

  @IsEnum(FieldType)
  @IsOptional()
  fieldType?: FieldType;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  dropdownOptions?: string[];
}

export class UpdateMeasurementFieldDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsEnum(FieldType)
  @IsOptional()
  fieldType?: FieldType;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  dropdownOptions?: string[];
}

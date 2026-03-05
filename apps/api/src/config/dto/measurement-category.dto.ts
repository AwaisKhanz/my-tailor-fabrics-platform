import {
  IsString,
  IsBoolean,
  IsOptional,
  IsInt,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
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

export class CreateMeasurementSectionDto {
  @IsString()
  name!: string;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class UpdateMeasurementSectionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class DeleteMeasurementSectionDto {
  @IsString()
  @IsOptional()
  targetSectionId?: string;
}

export class CreateMeasurementFieldDto {
  @IsString()
  label!: string;

  @IsString()
  @IsOptional()
  sectionId?: string;

  @IsString()
  @IsOptional()
  sectionName?: string;

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

  @IsString()
  @IsOptional()
  sectionId?: string;

  @IsString()
  @IsOptional()
  sectionName?: string;

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

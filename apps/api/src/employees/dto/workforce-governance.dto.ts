import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsDateString,
  IsEnum,
  Min,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PaymentType } from '@tbms/shared-types';
import {
  transformOptionalBoolean,
  transformOptionalString,
} from '../../common/dto/query-transformers';
import { IsCuidString } from '../../common/validators/is-cuid-string';

export class EmployeeCapabilityWindowInputDto {
  @IsString()
  @IsOptional()
  @IsCuidString()
  garmentTypeId?: string;

  @IsString()
  @IsOptional()
  stepKey?: string;

  @IsString()
  @IsOptional()
  note?: string;
}

export class UpdateEmployeeCapabilitiesDto {
  @IsDateString()
  effectiveFrom!: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmployeeCapabilityWindowInputDto)
  capabilities!: EmployeeCapabilityWindowInputDto[];
}

export class EmployeeCapabilitiesQueryDto {
  @IsOptional()
  @Transform(transformOptionalBoolean)
  @IsBoolean()
  activeOnly?: boolean;

  @Transform(transformOptionalString)
  @IsDateString()
  @IsOptional()
  asOf?: string;
}

export class CompensationChangeDto {
  @IsEnum(PaymentType)
  paymentType!: PaymentType;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  monthlySalary?: number;

  @IsDateString()
  @IsNotEmpty()
  effectiveFrom!: string;

  @IsString()
  @IsOptional()
  note?: string;
}

export class EligibleEmployeesQueryDto {
  @Transform(transformOptionalString)
  @IsString()
  @IsNotEmpty()
  @IsCuidString()
  garmentTypeId!: string;

  @Transform(transformOptionalString)
  @IsString()
  @IsOptional()
  stepKey?: string;

  @Transform(transformOptionalString)
  @IsDateString()
  @IsOptional()
  asOf?: string;
}

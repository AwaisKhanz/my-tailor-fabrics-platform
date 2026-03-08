import { Transform, Type } from 'class-transformer';
import {
  IsArray,
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
  @Transform(({ value }) => value === 'true' || value === true)
  activeOnly?: boolean;

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
  @IsString()
  @IsNotEmpty()
  @IsCuidString()
  garmentTypeId!: string;

  @IsString()
  @IsOptional()
  stepKey?: string;

  @IsDateString()
  @IsOptional()
  asOf?: string;
}

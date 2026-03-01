import { IsString, IsOptional, IsEnum, IsNotEmpty, IsDateString } from 'class-validator';
import { EmployeeStatus, PaymentType } from '@tbms/shared-types';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsOptional()
  fatherName?: string;

  @IsString()
  @IsOptional()
  phone2?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  cnic?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsDateString()
  @IsOptional()
  dateOfJoining?: string;

  @IsString()
  @IsOptional()
  designation?: string;

  @IsEnum(PaymentType)
  @IsOptional()
  paymentType?: PaymentType;

  @IsString()
  @IsOptional()
  accountNumber?: string;

  @IsString()
  @IsOptional()
  emergencyName?: string;

  @IsString()
  @IsOptional()
  emergencyPhone?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateEmployeeDto extends CreateEmployeeDto {
  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;
}

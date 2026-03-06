import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
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

  @IsInt()
  @Min(1)
  @IsOptional()
  monthlySalary?: number;

  @IsDateString()
  @IsOptional()
  employmentEndDate?: string;

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

export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

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

  @IsInt()
  @Min(1)
  @IsOptional()
  monthlySalary?: number;

  @IsDateString()
  @IsOptional()
  compensationEffectiveFrom?: string;

  @IsDateString()
  @IsOptional()
  employmentEndDate?: string;

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

  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: EmployeeStatus;
}

export class CreateEmployeeUserAccountDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class AddEmployeeDocumentDto {
  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsString()
  @IsNotEmpty()
  fileUrl!: string;

  @IsString()
  @IsNotEmpty()
  fileType!: string;
}

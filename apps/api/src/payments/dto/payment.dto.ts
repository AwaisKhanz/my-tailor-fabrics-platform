import { IsString, IsInt, IsOptional, Matches, Min } from 'class-validator';
import { IsCuidString } from '../../common/validators/is-cuid-string';

export class DisbursePaymentDto {
  @IsString()
  @IsCuidString()
  employeeId!: string;

  @IsInt()
  @Min(1)
  amount!: number;

  @IsString()
  @IsOptional()
  note?: string;
}

export class GenerateSalaryAccrualsDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/)
  month?: string;

  @IsOptional()
  @IsString()
  @IsCuidString()
  employeeId?: string;
}

export class ReversePaymentDto {
  @IsOptional()
  @IsString()
  note?: string;
}

import { IsString, IsInt, IsOptional, Matches, Min } from 'class-validator';

export class DisbursePaymentDto {
  @IsString()
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
  employeeId?: string;
}

export class ReversePaymentDto {
  @IsOptional()
  @IsString()
  note?: string;
}

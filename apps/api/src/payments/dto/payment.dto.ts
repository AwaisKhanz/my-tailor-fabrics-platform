import { IsString, IsInt, IsOptional, Min } from 'class-validator';

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

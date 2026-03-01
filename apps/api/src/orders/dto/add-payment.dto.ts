import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class AddPaymentDto {
  @IsNumber()
  @Min(1)
  amount!: number; // Paisas

  @IsString()
  @IsOptional()
  note?: string;
}

import {
  IsString,
  IsInt,
  IsOptional,
  Min,
  IsDateString,
} from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  categoryId!: string;

  @IsInt()
  @Min(1)
  amount!: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  receiptUrl?: string;

  @IsDateString()
  expenseDate!: string;
}

export class UpdateExpenseDto {
  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  receiptUrl?: string;

  @IsDateString()
  @IsOptional()
  expenseDate?: string;
}

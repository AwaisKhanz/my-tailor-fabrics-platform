import {
  IsString,
  IsInt,
  IsOptional,
  Min,
  IsDateString,
  IsBoolean,
  IsNotEmpty,
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

export class CreateExpenseCategoryDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateExpenseCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

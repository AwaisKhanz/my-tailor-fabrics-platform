import {
  IsDateString,
  IsInt,
  Matches,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateRateDto {
  @IsOptional()
  @IsString()
  branchId?: string | null;

  @IsString()
  garmentTypeId!: string;

  @IsOptional()
  @IsString()
  stepTemplateId?: string | null;

  @IsString()
  @Matches(/^[A-Z0-9_]+$/)
  stepKey!: string;

  @IsInt()
  @Min(0)
  amount!: number;

  @IsDateString()
  effectiveFrom!: string;
}

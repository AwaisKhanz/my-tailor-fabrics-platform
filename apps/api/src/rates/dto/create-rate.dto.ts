import {
  IsDateString,
  IsInt,
  Matches,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { IsCuidString } from '../../common/validators/is-cuid-string';

export class CreateRateDto {
  @IsOptional()
  @IsString()
  @IsCuidString()
  branchId?: string | null;

  @IsString()
  @IsCuidString()
  garmentTypeId!: string;

  @IsOptional()
  @IsString()
  @IsCuidString()
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

import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { STEP_KEYS } from '@tbms/shared-constants';

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
  @IsIn(Object.values(STEP_KEYS))
  stepKey!: string;

  @IsInt()
  @Min(0)
  amount!: number;

  @IsDateString()
  effectiveFrom!: string;
}

import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  NotEquals,
} from 'class-validator';
import { LedgerEntryType } from '@tbms/shared-types';

export class CreateLedgerEntryDto {
  @IsString()
  employeeId!: string;

  @IsString()
  @IsOptional()
  branchId?: string;

  @IsEnum(LedgerEntryType)
  type!: LedgerEntryType;

  @IsInt()
  @NotEquals(0)
  amount!: number;

  @IsOptional()
  @IsString()
  orderItemTaskId?: string | null;

  @IsOptional()
  @IsString()
  paymentId?: string | null;

  @IsOptional()
  @IsString()
  createdById?: string | null;

  @IsOptional()
  @IsString()
  note?: string | null;
}

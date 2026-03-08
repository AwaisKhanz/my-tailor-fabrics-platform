import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  NotEquals,
} from 'class-validator';
import { LedgerEntryType } from '@tbms/shared-types';
import { IsCuidString } from '../../common/validators/is-cuid-string';

export class CreateLedgerEntryDto {
  @IsString()
  @IsCuidString()
  employeeId!: string;

  @IsString()
  @IsOptional()
  @IsCuidString()
  branchId?: string;

  @IsEnum(LedgerEntryType)
  type!: LedgerEntryType;

  @IsInt()
  @NotEquals(0)
  amount!: number;

  @IsOptional()
  @IsString()
  @IsCuidString()
  orderItemTaskId?: string | null;

  @IsOptional()
  @IsString()
  @IsCuidString()
  paymentId?: string | null;

  @IsOptional()
  @IsString()
  @IsCuidString()
  createdById?: string | null;

  @IsOptional()
  @IsString()
  note?: string | null;
}

export class ReverseLedgerEntryDto {
  @IsOptional()
  @IsString()
  note?: string;
}

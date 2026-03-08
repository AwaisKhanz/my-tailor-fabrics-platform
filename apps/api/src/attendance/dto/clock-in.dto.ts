import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsCuidString } from '../../common/validators/is-cuid-string';

export class ClockInDto {
  @IsString()
  @IsNotEmpty()
  @IsCuidString()
  employeeId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ClockInDto {
  @IsString()
  @IsNotEmpty()
  employeeId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

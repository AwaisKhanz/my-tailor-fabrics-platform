import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ClockInSelfDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeRequiredString(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

export class CreateContactInquiryDto {
  @Transform(({ value }) => normalizeRequiredString(value))
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @Transform(({ value }) => normalizeRequiredString(value))
  @IsString()
  @MinLength(7)
  @MaxLength(40)
  phone!: string;

  @Transform(({ value }) => normalizeOptionalString(value))
  @IsOptional()
  @IsEmail()
  @MaxLength(160)
  email?: string;

  @Transform(({ value }) => normalizeOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(120)
  service?: string;

  @Transform(({ value }) => normalizeRequiredString(value))
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  message!: string;
}

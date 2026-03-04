import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @Length(1, 120)
  name!: string;

  @IsString()
  @Length(2, 20)
  code!: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  address?: string;

  @IsOptional()
  @IsString()
  @Length(1, 30)
  phone?: string;
}

export class UpdateBranchDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  address?: string;

  @IsOptional()
  @IsString()
  @Length(1, 30)
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

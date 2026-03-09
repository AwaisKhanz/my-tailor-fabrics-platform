import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { Role } from '@tbms/shared-types';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { transformOptionalString } from '../../common/dto/query-transformers';
import { IsCuidString } from '../../common/validators/is-cuid-string';

export class CreateUserDto {
  @IsString()
  @Length(1, 120)
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsEnum(Role)
  role!: Role;

  @IsOptional()
  @IsString()
  @IsCuidString()
  branchId?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(1, 120)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsString()
  @IsCuidString()
  branchId?: string;
}

export class SetUserActiveDto {
  @IsBoolean()
  isActive!: boolean;
}

export class ListUsersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(transformOptionalString)
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @Transform(transformOptionalString)
  @IsString()
  @IsCuidString()
  branchId?: string;
}

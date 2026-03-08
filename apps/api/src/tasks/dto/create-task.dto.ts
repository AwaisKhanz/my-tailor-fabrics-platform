import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsCuidString } from '../../common/validators/is-cuid-string';

export class AssignTaskDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @IsCuidString()
  employeeId?: string;
}

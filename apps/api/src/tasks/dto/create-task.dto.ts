import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AssignTaskDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  employeeId?: string;
}

import { Type } from 'class-transformer';
import { IsEnum, IsNumber, Min } from 'class-validator';
import { TaskStatus } from '@tbms/shared-types';

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus)
  status!: TaskStatus;
}

export class UpdateTaskRateDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rateOverride!: number;
}

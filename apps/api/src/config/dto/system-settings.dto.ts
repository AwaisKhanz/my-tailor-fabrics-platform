import { IsBoolean, IsOptional } from 'class-validator';
import { UpdateSystemSettingsInput } from '@tbms/shared-types';

export class UpdateSystemSettingsDto implements UpdateSystemSettingsInput {
  @IsOptional()
  @IsBoolean()
  useTaskWorkflow?: boolean;
}

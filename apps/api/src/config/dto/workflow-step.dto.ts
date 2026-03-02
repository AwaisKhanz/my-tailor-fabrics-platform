import { IsString, IsInt, IsBoolean, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class WorkflowStepTemplateDto {
  @IsString()
  @IsOptional()
  id?: string; // Optional for creates, required for updates (though handled via full list replacement usually)

  @IsString()
  stepKey!: string;

  @IsString()
  stepName!: string;

  @IsInt()
  sortOrder!: number;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateGarmentWorkflowStepsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowStepTemplateDto)
  steps!: WorkflowStepTemplateDto[];
}

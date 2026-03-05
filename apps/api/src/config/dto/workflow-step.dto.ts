import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class WorkflowStepTemplateDto {
  @IsString()
  @IsOptional()
  id?: string; // Optional for creates, required for updates (though handled via full list replacement usually)

  @IsString()
  @Matches(/^[A-Z0-9_]+$/)
  stepKey!: string;

  @IsString()
  stepName!: string;

  @IsInt()
  @Min(1)
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

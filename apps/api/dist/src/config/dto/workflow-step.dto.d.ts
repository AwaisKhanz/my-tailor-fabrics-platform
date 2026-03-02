export declare class WorkflowStepTemplateDto {
    id?: string;
    stepKey: string;
    stepName: string;
    sortOrder: number;
    isRequired?: boolean;
    isActive?: boolean;
}
export declare class UpdateGarmentWorkflowStepsDto {
    steps: WorkflowStepTemplateDto[];
}

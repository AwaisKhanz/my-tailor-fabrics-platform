import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TaskStatus } from '@tbms/shared-types';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateGarmentWorkflowStepsDto } from './dto/workflow-step.dto';

type WorkflowStepInput = UpdateGarmentWorkflowStepsDto['steps'][number];
type NormalizedWorkflowStep = ReturnType<typeof normalizeWorkflowSteps>[number];

export function normalizeWorkflowSteps(steps: WorkflowStepInput[]) {
  const normalizedSteps = steps.map((step, index) => {
    const stepKey = step.stepKey.trim().toUpperCase();
    const stepName = step.stepName.trim();

    if (!/^[A-Z0-9_]+$/.test(stepKey)) {
      throw new BadRequestException(
        `Invalid stepKey at position ${index + 1}. Use only A-Z, 0-9, and _.`,
      );
    }

    if (!stepName) {
      throw new BadRequestException(
        `stepName is required at position ${index + 1}.`,
      );
    }

    if (!Number.isInteger(step.sortOrder) || step.sortOrder < 1) {
      throw new BadRequestException(
        `sortOrder must be a positive integer at position ${index + 1}.`,
      );
    }

    return {
      ...step,
      stepKey,
      stepName,
    };
  });

  const seenStepKeys = new Set<string>();
  for (const step of normalizedSteps) {
    if (seenStepKeys.has(step.stepKey)) {
      throw new BadRequestException(
        `Duplicate stepKey "${step.stepKey}" is not allowed.`,
      );
    }
    seenStepKeys.add(step.stepKey);
  }

  return normalizedSteps;
}

export function getRemovedWorkflowStepKeys(
  existingSteps: Array<{ stepKey: string }>,
  normalizedSteps: Array<{ stepKey: string }>,
) {
  const incomingStepKeys = new Set(normalizedSteps.map((step) => step.stepKey));
  return existingSteps
    .map((step) => step.stepKey)
    .filter((stepKey) => !incomingStepKeys.has(stepKey));
}

export function buildWorkflowStepTemplateUpsertArgs(params: {
  garmentTypeId: string;
  step: NormalizedWorkflowStep;
}): Prisma.WorkflowStepTemplateUpsertArgs {
  const { garmentTypeId, step } = params;

  return {
    where: {
      garmentTypeId_stepKey: { garmentTypeId, stepKey: step.stepKey },
    },
    update: {
      stepName: step.stepName,
      sortOrder: step.sortOrder,
      isRequired: step.isRequired ?? true,
      isActive: step.isActive ?? true,
      deletedAt: null,
    },
    create: {
      garmentTypeId,
      stepKey: step.stepKey,
      stepName: step.stepName,
      sortOrder: step.sortOrder,
      isRequired: step.isRequired ?? true,
      isActive: step.isActive ?? true,
    },
  };
}

export async function assertNoOpenTasksForRemovedWorkflowSteps(
  prisma: PrismaService,
  garmentTypeId: string,
  removedStepKeys: string[],
) {
  if (removedStepKeys.length === 0) {
    return;
  }

  const openTasksCount = await prisma.orderItemTask.count({
    where: {
      stepKey: { in: removedStepKeys },
      status: { in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS] },
      deletedAt: null,
      orderItem: {
        garmentTypeId,
        deletedAt: null,
        order: {
          deletedAt: null,
        },
      },
    },
  });

  if (openTasksCount > 0) {
    throw new BadRequestException(
      `Cannot remove workflow steps with ${openTasksCount} open task(s). Complete or cancel those tasks first.`,
    );
  }
}

export async function archiveRemovedWorkflowStepDependents(
  tx: Prisma.TransactionClient,
  garmentTypeId: string,
  removedStepKeys: string[],
  now: Date,
) {
  if (removedStepKeys.length === 0) {
    return;
  }

  await tx.rateCard.updateMany({
    where: {
      garmentTypeId,
      stepKey: { in: removedStepKeys },
      deletedAt: null,
      effectiveTo: null,
    },
    data: {
      effectiveTo: now,
    },
  });

  await tx.employeeCapability.updateMany({
    where: {
      garmentTypeId,
      stepKey: { in: removedStepKeys },
      deletedAt: null,
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
    },
    data: {
      effectiveTo: now,
      note: 'Auto-closed because the workflow step was archived.',
    },
  });
}

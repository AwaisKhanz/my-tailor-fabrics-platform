import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type {
  EligibleEmployeeResult,
  EmployeeCapabilityWindowInput,
} from '@tbms/shared-types';
import { PrismaService } from '../prisma/prisma.service';

const CAPABILITY_MATCH_SCORES = {
  EXACT: 1,
  GARMENT: 2,
  STEP: 3,
} as const;

type CapabilityMatchType = EligibleEmployeeResult['matchType'];

export function normalizeStepKey(stepKey?: string | null): string | null {
  if (!stepKey) {
    return null;
  }

  const normalized = stepKey.trim().toUpperCase();
  return normalized.length > 0 ? normalized : null;
}

export function capabilityIdentity(capability: {
  garmentTypeId?: string | null;
  stepKey?: string | null;
}): string {
  return `${capability.garmentTypeId ?? '*'}::${capability.stepKey ?? '*'}`;
}

export function normalizeCapabilityInput(
  capability: EmployeeCapabilityWindowInput,
): {
  garmentTypeId: string | null;
  stepKey: string | null;
  note?: string;
} {
  const garmentTypeId = capability.garmentTypeId?.trim() || null;
  const stepKey = normalizeStepKey(capability.stepKey);
  const note = capability.note?.trim() || undefined;

  if (!garmentTypeId && !stepKey) {
    throw new BadRequestException(
      'Each capability must define at least garmentTypeId or stepKey',
    );
  }

  return {
    garmentTypeId,
    stepKey,
    note,
  };
}

export async function validateCapabilityStepKeys(
  prisma: PrismaService,
  capabilities: Array<{
    garmentTypeId: string | null;
    stepKey: string | null;
  }>,
): Promise<void> {
  const scopedStepCapabilities = capabilities.filter(
    (capability): capability is { garmentTypeId: string; stepKey: string } =>
      Boolean(capability.garmentTypeId) && Boolean(capability.stepKey),
  );

  if (scopedStepCapabilities.length > 0) {
    const uniqueScopedPairs = new Map<
      string,
      { garmentTypeId: string; stepKey: string }
    >();

    for (const capability of scopedStepCapabilities) {
      uniqueScopedPairs.set(
        `${capability.garmentTypeId}::${capability.stepKey}`,
        capability,
      );
    }

    const scopedPairs = Array.from(uniqueScopedPairs.values());
    const matchedWorkflowSteps = await prisma.workflowStepTemplate.findMany({
      where: {
        deletedAt: null,
        OR: scopedPairs.map((pair) => ({
          garmentTypeId: pair.garmentTypeId,
          stepKey: pair.stepKey,
        })),
      },
      select: {
        garmentTypeId: true,
        stepKey: true,
      },
    });

    const matchedScopedSet = new Set(
      matchedWorkflowSteps.map(
        (workflowStep) =>
          `${workflowStep.garmentTypeId}::${workflowStep.stepKey}`,
      ),
    );

    for (const pair of scopedPairs) {
      if (!matchedScopedSet.has(`${pair.garmentTypeId}::${pair.stepKey}`)) {
        throw new BadRequestException(
          `Invalid stepKey "${pair.stepKey}" for garmentTypeId "${pair.garmentTypeId}"`,
        );
      }
    }
  }

  const stepOnlyKeys = Array.from(
    new Set(
      capabilities
        .filter(
          (
            capability,
          ): capability is { garmentTypeId: null; stepKey: string } =>
            !capability.garmentTypeId && Boolean(capability.stepKey),
        )
        .map((capability) => capability.stepKey),
    ),
  );

  if (stepOnlyKeys.length === 0) {
    return;
  }

  const matchedStepOnlyKeys = await prisma.workflowStepTemplate.findMany({
    where: {
      deletedAt: null,
      stepKey: { in: stepOnlyKeys },
    },
    select: { stepKey: true },
    distinct: ['stepKey'],
  });

  const matchedStepOnlySet = new Set(
    matchedStepOnlyKeys.map((workflowStep) => workflowStep.stepKey),
  );

  for (const stepKey of stepOnlyKeys) {
    if (!matchedStepOnlySet.has(stepKey)) {
      throw new BadRequestException(
        `Invalid stepKey "${stepKey}". It does not exist in workflow templates.`,
      );
    }
  }
}

function resolveCapabilityMatchType(
  capability: { garmentTypeId: string | null; stepKey: string | null },
  garmentTypeId: string,
  stepKey: string | null,
): CapabilityMatchType | null {
  if (stepKey) {
    if (
      capability.garmentTypeId === garmentTypeId &&
      capability.stepKey === stepKey
    ) {
      return 'EXACT';
    }
    if (
      capability.garmentTypeId === garmentTypeId &&
      capability.stepKey === null
    ) {
      return 'GARMENT';
    }
    if (capability.garmentTypeId === null && capability.stepKey === stepKey) {
      return 'STEP';
    }
    return null;
  }

  if (capability.garmentTypeId === garmentTypeId) {
    return 'GARMENT';
  }

  return null;
}

export function pickBestCapabilityMatch(
  capabilities: Array<{
    garmentTypeId: string | null;
    stepKey: string | null;
  }>,
  garmentTypeId: string,
  stepKey: string | null,
): CapabilityMatchType | null {
  let bestMatch: CapabilityMatchType | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const capability of capabilities) {
    const matchType = resolveCapabilityMatchType(
      capability,
      garmentTypeId,
      stepKey,
    );
    if (!matchType) {
      continue;
    }

    const score = CAPABILITY_MATCH_SCORES[matchType];
    if (score < bestScore) {
      bestScore = score;
      bestMatch = matchType;
    }
  }

  return bestMatch;
}

export function getCapabilityMatchScore(
  matchType: CapabilityMatchType,
): number {
  return CAPABILITY_MATCH_SCORES[matchType];
}

export function buildCapabilityWhere(
  garmentTypeId: string,
  stepKey: string | null,
  asOf: Date,
): Prisma.EmployeeCapabilityWhereInput {
  const activeWindowWhere: Prisma.EmployeeCapabilityWhereInput = {
    deletedAt: null,
    effectiveFrom: { lte: asOf },
    OR: [{ effectiveTo: null }, { effectiveTo: { gte: asOf } }],
  };

  if (stepKey) {
    return {
      deletedAt: null,
      effectiveFrom: { lte: asOf },
      AND: [
        {
          OR: [{ effectiveTo: null }, { effectiveTo: { gte: asOf } }],
        },
        {
          OR: [
            { garmentTypeId, stepKey },
            { garmentTypeId, stepKey: null },
            { garmentTypeId: null, stepKey },
          ],
        },
      ],
    };
  }

  return {
    ...activeWindowWhere,
    garmentTypeId,
  };
}

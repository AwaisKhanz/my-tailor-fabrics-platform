import { BadRequestException } from '@nestjs/common';
import type { AuthenticatedRequest } from '../interfaces/request.interface';

export const BRANCH_SCOPE_REQUIRED_MESSAGE =
  'x-branch-id header is required for branch-scoped actions';

export function requireBranchId(branchId?: string | null): string {
  if (!branchId) {
    throw new BadRequestException(BRANCH_SCOPE_REQUIRED_MESSAGE);
  }

  return branchId;
}

export function requireBranchScope(req: AuthenticatedRequest): string {
  return requireBranchId(req.branchId);
}

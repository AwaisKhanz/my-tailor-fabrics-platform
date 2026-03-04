import { BadRequestException } from '@nestjs/common';
import type { AuthenticatedRequest } from '../interfaces/request.interface';

export const BRANCH_SCOPE_REQUIRED_MESSAGE =
  'x-branch-id header is required for branch-scoped actions';

export function requireBranchScope(req: AuthenticatedRequest): string {
  if (!req.branchId) {
    throw new BadRequestException(BRANCH_SCOPE_REQUIRED_MESSAGE);
  }

  return req.branchId;
}

import { Role } from '@tbms/shared-types';
import type { AuthenticatedRequest } from '../interfaces/request.interface';

const ALL_BRANCHES_TOKEN = 'all';

type ResolveBranchScopeOptions = {
  allowAllForSuperAdmin?: boolean;
};

function normalizeBranchId(value?: string | null): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export function resolveBranchScopeForRead(
  req: AuthenticatedRequest,
  requestedBranchId?: string,
  options: ResolveBranchScopeOptions = {},
): string | undefined {
  const activeBranchId = normalizeBranchId(req.branchId);

  if (req.user.role !== Role.SUPER_ADMIN) {
    return activeBranchId;
  }

  const requested = normalizeBranchId(requestedBranchId);
  if (!requested) {
    return activeBranchId;
  }

  if (
    options.allowAllForSuperAdmin &&
    requested.toLowerCase() === ALL_BRANCHES_TOKEN
  ) {
    return undefined;
  }

  return requested;
}

export function resolveBranchScopeForReadOrNull(
  req: AuthenticatedRequest,
  requestedBranchId?: string,
  options: ResolveBranchScopeOptions = {},
): string | null {
  return resolveBranchScopeForRead(req, requestedBranchId, options) ?? null;
}

export function resolveBranchScopeForMutation(
  req: AuthenticatedRequest,
  requestedBranchId?: string | null,
): string | undefined {
  if (req.user.role !== Role.SUPER_ADMIN) {
    return normalizeBranchId(req.branchId);
  }

  const requested = normalizeBranchId(requestedBranchId);
  if (requested) {
    return requested;
  }

  return normalizeBranchId(req.branchId);
}

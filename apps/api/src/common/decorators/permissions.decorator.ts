import { SetMetadata } from '@nestjs/common';
import { Permission } from '@tbms/shared-types';

export const PERMISSIONS_ALL_KEY = 'permissionsAll';
export const PERMISSIONS_ANY_KEY = 'permissionsAny';

export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_ALL_KEY, permissions);

export const RequireAnyPermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_ANY_KEY, permissions);

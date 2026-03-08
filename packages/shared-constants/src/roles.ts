import { Role, BadgeVariant } from '@tbms/shared-types';

export const ROLES: { value: Role; label: string }[] = [
  { value: Role.SUPER_ADMIN, label: 'Super Admin' },
  { value: Role.ADMIN, label: 'Admin' },
  { value: Role.ENTRY_OPERATOR, label: 'Entry Operator' },
  { value: Role.VIEWER, label: 'Viewer' },
  { value: Role.EMPLOYEE, label: 'Employee' },
];

export const ROLE_LABELS: Record<Role, string> = Object.fromEntries(
  ROLES.map((role) => [role.value, role.label]),
) as Record<Role, string>;

export const ROLE_BADGE: Record<Role, BadgeVariant> = {
  [Role.SUPER_ADMIN]: 'default',
  [Role.ADMIN]: 'secondary',
  [Role.ENTRY_OPERATOR]: 'warning',
  [Role.VIEWER]: 'outline',
  [Role.EMPLOYEE]: 'success',
};

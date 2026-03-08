import { Role, BadgeVariant } from '@tbms/shared-types';

export const ROLE_LABELS: Record<Role, string> = {
  [Role.SUPER_ADMIN]: 'Super Admin',
  [Role.ADMIN]: 'Admin',
  [Role.ENTRY_OPERATOR]: 'Entry Operator',
  [Role.VIEWER]: 'Viewer',
  [Role.EMPLOYEE]: 'Employee',
};

export const ROLES: { value: Role; label: string }[] = [
  { value: Role.SUPER_ADMIN, label: ROLE_LABELS[Role.SUPER_ADMIN] },
  { value: Role.ADMIN, label: ROLE_LABELS[Role.ADMIN] },
  { value: Role.ENTRY_OPERATOR, label: ROLE_LABELS[Role.ENTRY_OPERATOR] },
  { value: Role.VIEWER, label: ROLE_LABELS[Role.VIEWER] },
  { value: Role.EMPLOYEE, label: ROLE_LABELS[Role.EMPLOYEE] },
];

export const ROLE_BADGE: Record<Role, BadgeVariant> = {
  [Role.SUPER_ADMIN]: 'default',
  [Role.ADMIN]: 'secondary',
  [Role.ENTRY_OPERATOR]: 'warning',
  [Role.VIEWER]: 'outline',
  [Role.EMPLOYEE]: 'success',
};

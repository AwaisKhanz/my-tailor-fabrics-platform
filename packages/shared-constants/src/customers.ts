import { CustomerStatus, BadgeVariant } from '@tbms/shared-types';

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  [CustomerStatus.ACTIVE]: 'Active',
  [CustomerStatus.INACTIVE]: 'Inactive',
  [CustomerStatus.BLACKLISTED]: 'Blacklisted',
};

export const CUSTOMER_STATUS_BADGE: Record<CustomerStatus, BadgeVariant> = {
  [CustomerStatus.ACTIVE]: 'success',
  [CustomerStatus.INACTIVE]: 'outline',
  [CustomerStatus.BLACKLISTED]: 'destructive',
};

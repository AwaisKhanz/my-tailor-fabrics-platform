import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PERMISSION, hasAllPermissions, isRole } from '@tbms/shared-constants';
import { Role } from '@tbms/shared-types';
import {
  calculateOrderTotals,
  discountExceedsSubtotal,
  paymentExceedsTotal,
} from './money';

export function assertOrderFinancialManagePermission(
  userRole: Role,
  message: string,
): void {
  if (
    !isRole(userRole) ||
    !hasAllPermissions(userRole, [PERMISSION['orders.financial.manage']])
  ) {
    throw new ForbiddenException(message);
  }
}

export function resolveValidatedOrderTotals(params: {
  subtotal: number;
  totalPaid: number;
  discountType?: Parameters<typeof calculateOrderTotals>[2];
  discountValue?: number | null;
  paymentErrorMessage: string;
}) {
  const discountValue = params.discountValue ?? 0;

  if (
    discountExceedsSubtotal(params.subtotal, params.discountType, discountValue)
  ) {
    throw new BadRequestException('Discount cannot exceed subtotal');
  }

  const totals = calculateOrderTotals(
    params.subtotal,
    params.totalPaid,
    params.discountType,
    discountValue,
  );

  if (paymentExceedsTotal(params.totalPaid, totals.totalAmount)) {
    throw new BadRequestException(params.paymentErrorMessage);
  }

  return totals;
}

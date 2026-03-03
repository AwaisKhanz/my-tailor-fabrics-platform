import { DiscountType as PrismaDiscountType } from '@prisma/client';
import { DiscountType as SharedDiscountType } from '@tbms/shared-types';

type DiscountTypeLike =
  | SharedDiscountType
  | PrismaDiscountType
  | null
  | undefined;

export function calculateDiscountAmount(
  subtotal: number,
  discountType?: DiscountTypeLike,
  discountValue = 0,
): number {
  if (!discountType || discountValue <= 0) {
    return 0;
  }

  if (discountType === SharedDiscountType.FIXED) {
    return Math.min(discountValue, subtotal);
  }

  if (discountType === SharedDiscountType.PERCENTAGE) {
    // Basis points: 1000 = 10%
    return Math.min(Math.floor(subtotal * (discountValue / 10000)), subtotal);
  }

  return 0;
}

export function calculateOrderTotals(
  subtotal: number,
  totalPaid: number,
  discountType?: DiscountTypeLike,
  discountValue = 0,
) {
  const discountAmount = calculateDiscountAmount(
    subtotal,
    discountType,
    discountValue,
  );
  const totalAmount = Math.max(0, subtotal - discountAmount);
  const balanceDue = Math.max(0, totalAmount - totalPaid);

  return {
    discountAmount,
    totalAmount,
    balanceDue,
  };
}

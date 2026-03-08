import { DiscountType as PrismaDiscountType } from '@prisma/client';
import { DiscountType as SharedDiscountType } from '@tbms/shared-types';

type DiscountTypeLike =
  | SharedDiscountType
  | PrismaDiscountType
  | null
  | undefined;

export type OrderSubtotalLine = {
  unitPrice: number;
  quantity?: number;
  designPrice?: number | null;
  addonsTotal?: number;
};

export function calculateOrderSubtotal(
  lines: readonly OrderSubtotalLine[],
): number {
  return lines.reduce((sum, line) => {
    const quantity = line.quantity ?? 1;
    const designPrice = line.designPrice ?? 0;
    const addonsTotal = line.addonsTotal ?? 0;

    return (
      sum + line.unitPrice * quantity + designPrice * quantity + addonsTotal
    );
  }, 0);
}

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

export function discountExceedsSubtotal(
  subtotal: number,
  discountType?: DiscountTypeLike,
  discountValue = 0,
): boolean {
  if (!discountType || discountValue <= 0) {
    return false;
  }

  if (discountType === SharedDiscountType.FIXED) {
    return discountValue > subtotal;
  }

  if (discountType === SharedDiscountType.PERCENTAGE) {
    return Math.floor(subtotal * (discountValue / 10000)) > subtotal;
  }

  return false;
}

export function paymentExceedsTotal(
  totalPaid: number,
  totalAmount: number,
): boolean {
  return totalPaid > totalAmount;
}

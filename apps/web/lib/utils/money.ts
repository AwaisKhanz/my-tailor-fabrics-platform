export function toPaisaFromRupees(amountInRupees: number): number {
  return Math.round(amountInRupees * 100);
}

export function toSignedPaisaFromRupees(amountInRupees: number): number {
  const absoluteAmount = Math.abs(amountInRupees);
  const sign = amountInRupees < 0 ? -1 : 1;
  return sign * toPaisaFromRupees(absoluteAmount);
}

export function toRupeesFromPaisa(amountInPaisa: number): number {
  return amountInPaisa / 100;
}

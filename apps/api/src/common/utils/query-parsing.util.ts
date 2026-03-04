export function parsePositiveInt(
  value: string | null | undefined,
  defaultValue: number,
): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
}

export function parseOptionalPositiveInt(
  value: string | null | undefined,
): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

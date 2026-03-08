import type { TransformFnParams } from 'class-transformer';
import { parseOptionalPositiveInt } from '../utils/query-parsing.util';

export function transformOptionalPositiveInt({
  value,
}: TransformFnParams): unknown {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) && value > 0 ? value : value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }

    const parsed = parseOptionalPositiveInt(trimmed);
    return parsed ?? value;
  }

  return value;
}

export function transformOptionalBoolean({
  value,
}: TransformFnParams): unknown {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === '1' || normalized === 'true') {
      return true;
    }

    if (normalized === '0' || normalized === 'false') {
      return false;
    }

    return value;
  }

  return value;
}

export function transformOptionalString({ value }: TransformFnParams): unknown {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }

  return value;
}

import type { PaginatedResponse, PaginationMeta } from '@tbms/shared-types';

const MIN_PAGE = 1;
const MIN_LIMIT = 1;

interface NormalizePaginationOptions {
  page?: number;
  limit?: number;
  defaultPage?: number;
  defaultLimit?: number;
  maxLimit?: number;
}

export interface NormalizedPagination {
  page: number;
  limit: number;
  skip: number;
}

function normalizePositiveInteger(
  value: number | undefined,
  fallback: number,
): number {
  if (value === undefined || !Number.isFinite(value) || value < MIN_PAGE) {
    return fallback;
  }
  return Math.trunc(value);
}

export function normalizePagination({
  page,
  limit,
  defaultPage = MIN_PAGE,
  defaultLimit = 20,
  maxLimit = 100,
}: NormalizePaginationOptions = {}): NormalizedPagination {
  const safePage = normalizePositiveInteger(page, defaultPage);
  const rawLimit = normalizePositiveInteger(limit, defaultLimit);
  const safeLimit = Math.max(MIN_LIMIT, Math.min(rawLimit, maxLimit));

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
}

export function buildPaginationMeta(
  total: number,
  pagination: Pick<NormalizedPagination, 'page' | 'limit'>,
): PaginationMeta {
  return {
    page: pagination.page,
    lastPage: Math.max(1, Math.ceil(total / pagination.limit)),
  };
}

export function toPaginatedResponse<T>(
  data: T[],
  total: number,
  pagination: Pick<NormalizedPagination, 'page' | 'limit'>,
): PaginatedResponse<T> {
  return {
    data,
    total,
    meta: buildPaginationMeta(total, pagination),
  };
}

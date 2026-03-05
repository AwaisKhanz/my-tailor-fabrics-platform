import type { ApiResponse } from '@tbms/shared-types';

export function success<T>(data: T) {
  const response: ApiResponse<T> = {
    success: true as const,
    data,
  };

  return response;
}

export function successOnly() {
  return success(undefined);
}

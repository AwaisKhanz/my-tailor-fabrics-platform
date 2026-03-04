export function success<T>(data: T) {
  return {
    success: true as const,
    data,
  };
}

export function successOnly() {
  return {
    success: true as const,
  };
}

export function successSpread<T extends Record<string, unknown>>(payload: T) {
  return {
    success: true as const,
    ...payload,
  };
}

export function successWithMeta<T, M>(data: T, meta: M) {
  return {
    success: true as const,
    data,
    meta,
  };
}

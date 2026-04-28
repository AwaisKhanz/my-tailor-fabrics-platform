function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getStringProperty(
  source: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = source[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function getNumberProperty(
  source: Record<string, unknown>,
  key: string,
): number | undefined {
  const value = source[key];
  return typeof value === 'number' ? value : undefined;
}

function getResponseDataProperty(
  error: Record<string, unknown>,
  key: string,
): string | undefined {
  const response = error.response;
  if (!isRecord(response)) {
    return undefined;
  }

  const data = response.data;
  if (!isRecord(data)) {
    return undefined;
  }

  return getStringProperty(data, key);
}

export function getErrorStack(error: unknown): string | undefined {
  return error instanceof Error ? error.stack : undefined;
}

export function summarizeExternalError(error: unknown): string {
  if (!isRecord(error)) {
    return 'unknown external service error';
  }

  const summary = {
    name: getStringProperty(error, 'name'),
    message: getStringProperty(error, 'message'),
    code: getStringProperty(error, 'code'),
    status: getNumberProperty(error, 'status'),
    responseError: getResponseDataProperty(error, 'error'),
    responseErrorDescription: getResponseDataProperty(
      error,
      'error_description',
    ),
  };

  return JSON.stringify(
    Object.fromEntries(
      Object.entries(summary).filter(([, value]) => value !== undefined),
    ),
  );
}

const isProduction = process.env.NODE_ENV === 'production';

export function logDevError(message: string, error?: unknown): void {
  if (isProduction) {
    return;
  }

  if (error === undefined) {
    console.error(message);
    return;
  }

  console.error(message, error);
}

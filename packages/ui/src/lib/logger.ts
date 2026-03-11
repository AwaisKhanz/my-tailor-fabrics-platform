export function logDevError(message: string, error?: unknown): void {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  if (error === undefined) {
    console.error(message);
    return;
  }

  console.error(message, error);
}

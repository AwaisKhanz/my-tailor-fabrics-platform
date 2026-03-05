import type { ZodError } from "zod";

export function getFirstZodErrorMessage(
  error: ZodError,
  fallback = "Invalid form data",
): string {
  return error.issues[0]?.message ?? fallback;
}

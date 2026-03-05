/**
 * Typed resolver helper for Zod v4 + react-hook-form compatibility.
 *
 * Zod v4 changed its internal schema input typing to `unknown`, while the
 * resolver expects `FieldValues`. This helper centralizes that one compatibility
 * bridge so form hooks/components can stay strongly typed.
 *
 * Usage:
 *   resolver: typedZodResolver(mySchema)
 */
import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import type { ZodSchema } from "zod";

export function typedZodResolver<T extends Record<string, unknown>>(
  schema: ZodSchema<T>
): Resolver<T> {
  const resolver = zodResolver(
    schema as unknown as Parameters<typeof zodResolver>[0]
  );
  return resolver as Resolver<T>;
}

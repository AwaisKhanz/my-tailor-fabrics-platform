import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import type { ZodSchema } from "zod";

/**
 * Keep the resolver compatibility cast centralized.
 * This avoids leaking `as` assertions into individual form hooks/components.
 */
export function typedZodResolver<
  T extends Record<string, unknown>,
>(
  schema: ZodSchema<T>
): Resolver<T> {
  const resolver = zodResolver(
    schema as unknown as Parameters<typeof zodResolver>[0]
  );
  return resolver as Resolver<T>;
}

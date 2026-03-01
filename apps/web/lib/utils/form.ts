/**
 * Typed resolver helper for Zod v4 + react-hook-form compatibility.
 *
 * Zod v4 changed its internal schema types. The `_input` property on `ZodType`
 * is now typed as `unknown` rather than `FieldValues`, causing a type error with
 * @hookform/resolvers. This helper centralises that single cast so all form
 * components remain fully typed everywhere else.
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
  return zodResolver(schema as never) as Resolver<T>;
}

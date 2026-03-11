import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldValues, Resolver } from "react-hook-form";
import type * as z4 from "zod/v4/core";

/**
 * React Hook Form pages in this app consistently model form values as parsed schema output.
 * Keep this narrowing local at the resolver boundary to avoid leaking casts to feature code.
 */
export function typedZodResolver<
  TSchema extends z4.$ZodType<unknown, FieldValues>,
  Context = unknown,
>(
  schema: TSchema,
): Resolver<z4.output<TSchema> & FieldValues, Context, z4.output<TSchema>> {
  return zodResolver(schema) as Resolver<
    z4.output<TSchema> & FieldValues,
    Context,
    z4.output<TSchema>
  >;
}

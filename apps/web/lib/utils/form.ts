import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldValues, Resolver } from "react-hook-form";
import type * as z4 from "zod/v4/core";

/**
 * React Hook Form expects form state to use the schema's parsed output shape in this app.
 * Keep the unavoidable resolver cast narrow and local at this framework boundary.
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

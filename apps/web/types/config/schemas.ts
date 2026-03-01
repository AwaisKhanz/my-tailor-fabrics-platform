import * as z from "zod";

export const garmentTypeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  customerPrice: z.coerce.number().min(0, "Price cannot be negative"),
  employeeRate: z.coerce.number().min(0, "Rate cannot be negative"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().default(0),
  branchCustomerPrice: z.coerce.number().optional(),
  branchEmployeeRate: z.coerce.number().optional(),
  measurementCategoryIds: z.array(z.string()).default([]),
});

export type GarmentTypeFormValues = z.infer<typeof garmentTypeSchema>;

export const measurementFieldSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Required"),
  label: z.string().min(1, "Required"),
  fieldType: z.enum(["TEXT", "NUMBER", "DROPDOWN"]),
  options: z.string().optional(),
  isRequired: z.boolean().default(false),
  sortOrder: z.number().default(0),
});

export const measurementCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().default(0),
  fields: z.array(measurementFieldSchema),
});

export type MeasurementCategoryFormValues = z.infer<typeof measurementCategorySchema>;

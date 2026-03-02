import * as z from "zod";
import { DiscountType, FabricSource } from "@tbms/shared-types";

export const orderItemSchema = z.object({
  garmentTypeId: z.string().min(1, "Garment type is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Price must be at least 0"),
  employeeId: z.string().optional(),
  employeeRate: z.coerce.number().optional(),
  dueDate: z.string().optional(),
  description: z.string().optional(),
  fabricSource: z.nativeEnum(FabricSource).default(FabricSource.SHOP),
});

export const orderSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  dueDate: z.string().min(1, "Due date is required"),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  discountType: z.nativeEnum(DiscountType),
  discountValue: z.coerce.number().default(0),
  advancePayment: z.coerce.number().default(0),
  notes: z.string().optional(),
});

export type OrderFormValues = z.infer<typeof orderSchema>;
export type OrderItemFormValues = z.infer<typeof orderItemSchema>;

import * as z from "zod";
import { CustomerStatus } from "@tbms/shared-types";

export const customerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Invalid phone number"),
  whatsapp: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
  status: z.nativeEnum(CustomerStatus).default(CustomerStatus.ACTIVE),
  branchId: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

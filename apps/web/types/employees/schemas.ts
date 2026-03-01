import * as z from "zod";
import { EmployeeStatus, PaymentType, Role } from "@tbms/shared-types";

export const employeeSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(10, "Invalid phone number"),
  phone2: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  designation: z.string().min(2, "Designation is required"),
  status: z.nativeEnum(EmployeeStatus),
  paymentType: z.nativeEnum(PaymentType),
  dateOfJoining: z.string().min(1, "Date of joining is required"),
  dateOfBirth: z.string().optional(),
  emergencyName: z.string().optional(),
  emergencyPhone: z.string().optional(),
  branchId: z.string().optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;

export const accountSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.nativeEnum(Role),
});

export const accountCreationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type AccountCreationFormValues = z.infer<typeof accountCreationSchema>;

export type AccountFormValues = z.infer<typeof accountSchema>;

import { z } from "zod";
import {
  AddonType,
  CustomerStatus,
  DiscountType,
  EmployeeStatus,
  FieldType,
  FabricSource,
  LedgerEntryType,
  PaymentType,
  Role,
} from "./common";
import type { MeasurementField } from "./config";

const optionalTrimmedText = z.string().trim().optional();
const optionalEmail = z.string().trim().email("Invalid email").optional().or(z.literal(""));

export const customerSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters"),
  phone: z.string().trim().min(10, "Invalid phone number"),
  whatsapp: optionalTrimmedText,
  email: optionalEmail,
  address: optionalTrimmedText,
  city: optionalTrimmedText,
  notes: optionalTrimmedText,
  status: z.nativeEnum(CustomerStatus).default(CustomerStatus.ACTIVE),
  branchId: optionalTrimmedText,
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

export const employeeSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  phone: z.string().trim().min(10, "Invalid phone number"),
  phone2: optionalTrimmedText,
  address: optionalTrimmedText,
  city: optionalTrimmedText,
  designation: z.string().trim().min(2, "Designation is required"),
  status: z.nativeEnum(EmployeeStatus),
  paymentType: z.nativeEnum(PaymentType),
  dateOfJoining: z.string().min(1, "Date of joining is required"),
  dateOfBirth: optionalTrimmedText,
  emergencyName: optionalTrimmedText,
  emergencyPhone: optionalTrimmedText,
  branchId: optionalTrimmedText,
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;

export const accountSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.nativeEnum(Role),
});

export type AccountFormValues = z.infer<typeof accountSchema>;

export const accountCreationSchema = z
  .object({
    email: z.string().trim().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type AccountCreationFormValues = z.infer<typeof accountCreationSchema>;

export const orderItemSchema = z.object({
  id: z.string().optional(),
  garmentTypeId: z.string().min(1, "Garment type is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Price must be at least 0"),
  employeeId: z.string().optional(),
  employeeRate: z.coerce.number().optional(),
  dueDate: z.string().optional(),
  description: z.string().optional(),
  fabricSource: z.nativeEnum(FabricSource).default(FabricSource.SHOP),
  designTypeId: z.string().optional(),
  addons: z
    .array(
      z.object({
        type: z.nativeEnum(AddonType),
        name: z.string().min(1, "Addon name is required"),
        price: z.coerce.number().min(0, "Addon price must be at least 0"),
      }),
    )
    .optional(),
});

export type OrderItemFormValues = z.infer<typeof orderItemSchema>;

export const orderSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  dueDate: z.string().min(1, "Due date is required"),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  discountType: z.nativeEnum(DiscountType).optional(),
  discountValue: z.coerce.number().default(0),
  advancePayment: z.coerce.number().default(0),
  notes: z.string().optional(),
});

export type OrderFormValues = z.infer<typeof orderSchema>;

export const garmentTypeSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  customerPrice: z.coerce.number().min(0, "Price cannot be negative"),
  employeeRate: z.coerce.number().min(0, "Rate cannot be negative"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().default(0),
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
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().default(0),
  fields: z.array(measurementFieldSchema),
});

export type MeasurementCategoryFormValues = z.infer<
  typeof measurementCategorySchema
>;

export const measurementFieldDialogFormSchema = z
  .object({
    label: z.string().trim().min(1, "Label is required"),
    sectionName: z.string().trim().min(1, "Section is required"),
    fieldType: z.nativeEnum(FieldType),
    unit: optionalTrimmedText,
    isRequired: z.boolean().default(false),
    dropdownOptions: z.array(z.string().trim().min(1)).default([]),
    sortOrder: z.coerce
      .number()
      .int("Sort order must be a whole number")
      .min(1, "Sort order must be at least 1"),
  })
  .superRefine((value, ctx) => {
    if (value.fieldType !== FieldType.DROPDOWN) {
      return;
    }

    if (value.dropdownOptions.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dropdownOptions"],
        message: "Please add at least one dropdown option.",
      });
    }
  });

export type MeasurementFieldDialogFormValues = z.infer<
  typeof measurementFieldDialogFormSchema
>;

export type MeasurementValuesSchemaField = Pick<
  MeasurementField,
  "id" | "label" | "fieldType" | "isRequired" | "dropdownOptions"
>;

export function createMeasurementValuesFormSchema(
  fields: MeasurementValuesSchemaField[],
) {
  return z
    .record(
      z.string(),
      z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
    )
    .superRefine((values, ctx) => {
      fields.forEach((field) => {
        const raw = values[field.id];
        const normalized = raw == null ? "" : String(raw).trim();

        if (field.isRequired && normalized.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field.id],
            message: `${field.label} is required.`,
          });
          return;
        }

        if (normalized.length === 0) {
          return;
        }

        if (field.fieldType === FieldType.NUMBER && Number.isNaN(Number(normalized))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field.id],
            message: `${field.label} must be a valid number.`,
          });
        }

        if (
          field.fieldType === FieldType.DROPDOWN &&
          !field.dropdownOptions.includes(normalized)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field.id],
            message: `Select a valid option for ${field.label}.`,
          });
        }
      });
    });
}

export const designTypeFormSchema = z.object({
  name: z.string().trim().min(1, "Design name is required"),
  defaultPrice: z.coerce.number().min(0, "Price must be zero or greater"),
  defaultRate: z.coerce.number().min(0, "Rate must be zero or greater"),
  garmentTypeId: z.string().trim().min(1, "Garment selection is required"),
  branchId: z.string().trim().min(1, "Branch selection is required"),
  sortOrder: z.coerce
    .number()
    .int("Sort order must be a whole number")
    .min(0, "Sort order must be zero or greater"),
  isActive: z.boolean().default(true),
});

export type DesignTypeFormValues = z.infer<typeof designTypeFormSchema>;

export const branchCreateFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Branch code must be at least 2 characters")
    .max(6, "Branch code cannot exceed 6 characters"),
  name: z
    .string()
    .trim()
    .min(2, "Branch name must be at least 2 characters"),
  address: optionalTrimmedText,
  phone: optionalTrimmedText,
});

export type BranchCreateFormValues = z.infer<typeof branchCreateFormSchema>;

export const branchUpdateFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Branch name must be at least 2 characters"),
  address: optionalTrimmedText,
  phone: optionalTrimmedText,
});

export type BranchUpdateFormValues = z.infer<typeof branchUpdateFormSchema>;

const userAccountBaseSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email address"),
  role: z.nativeEnum(Role),
  branchId: z.string().trim().optional(),
});

export const userAccountCreateFormSchema = userAccountBaseSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type UserAccountCreateFormValues = z.infer<
  typeof userAccountCreateFormSchema
>;

export const userAccountUpdateFormSchema = userAccountBaseSchema.extend({
  password: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || value.length >= 8,
      "Password must be at least 8 characters",
    ),
});

export type UserAccountUpdateFormValues = z.infer<
  typeof userAccountUpdateFormSchema
>;

export const expenseCreateFormSchema = z.object({
  categoryId: z.string().trim().min(1, "Category is required"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  expenseDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Expense date is required"),
  description: optionalTrimmedText,
});

export type ExpenseCreateFormValues = z.infer<typeof expenseCreateFormSchema>;
export type ExpenseCreateFormInput = z.input<typeof expenseCreateFormSchema>;

export const expenseCategoryFormSchema = z.object({
  name: z.string().trim().min(1, "Category name is required"),
  isActive: z.boolean().default(true),
});

export type ExpenseCategoryFormValues = z.infer<typeof expenseCategoryFormSchema>;
export type ExpenseCategoryFormInput = z.input<typeof expenseCategoryFormSchema>;

export const rateCardCreateFormSchema = z.object({
  garmentTypeId: z.string().trim().min(1, "Garment type is required"),
  branchId: z.string().trim().min(1, "Branch scope is required"),
  stepKey: z.string().trim().min(1, "Production step is required"),
  amount: z.coerce.number().min(0, "Rate must be a non-negative number"),
  effectiveFrom: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Effective date is required"),
});

export type RateCardCreateFormValues = z.infer<typeof rateCardCreateFormSchema>;
export type RateCardCreateFormInput = z.input<typeof rateCardCreateFormSchema>;

export const orderPaymentFormSchema = z.object({
  amount: z.coerce.number().positive("Payment amount must be greater than zero"),
  note: optionalTrimmedText,
});

export type OrderPaymentFormValues = z.infer<typeof orderPaymentFormSchema>;
export type OrderPaymentFormInput = z.input<typeof orderPaymentFormSchema>;

export const paymentDisbursementFormSchema = z.object({
  amount: z.coerce.number().positive("Please enter a valid positive amount."),
  note: optionalTrimmedText,
});

export type PaymentDisbursementFormValues = z.infer<
  typeof paymentDisbursementFormSchema
>;
export type PaymentDisbursementFormInput = z.input<
  typeof paymentDisbursementFormSchema
>;

export const taskRateOverrideFormSchema = z.object({
  amount: z.coerce.number().min(0, "Rate must be zero or greater."),
});

export type TaskRateOverrideFormValues = z.infer<typeof taskRateOverrideFormSchema>;
export type TaskRateOverrideFormInput = z.input<typeof taskRateOverrideFormSchema>;

export const attendanceClockInFormSchema = z.object({
  employeeId: z.string().trim().min(1, "Select an employee to clock in."),
  note: optionalTrimmedText,
});

export type AttendanceClockInFormValues = z.infer<
  typeof attendanceClockInFormSchema
>;
export type AttendanceClockInFormInput = z.input<
  typeof attendanceClockInFormSchema
>;

export const employeeLedgerEntryFormSchema = z.object({
  type: z.nativeEnum(LedgerEntryType),
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  note: optionalTrimmedText,
});

export type EmployeeLedgerEntryFormValues = z.infer<
  typeof employeeLedgerEntryFormSchema
>;
export type EmployeeLedgerEntryFormInput = z.input<
  typeof employeeLedgerEntryFormSchema
>;

export const employeeDocumentUploadFormSchema = z.object({
  label: z.string().trim().min(1, "Document label is required."),
  url: z.string().trim().url("Please enter a valid file URL."),
});

export type EmployeeDocumentUploadFormValues = z.infer<
  typeof employeeDocumentUploadFormSchema
>;
export type EmployeeDocumentUploadFormInput = z.input<
  typeof employeeDocumentUploadFormSchema
>;

export const workflowStepInputFormSchema = z.object({
  id: z.string().optional(),
  stepKey: z
    .string()
    .trim()
    .min(1, "Step key is required.")
    .regex(/^[A-Z0-9_]+$/, "Step key can only contain A-Z, 0-9, and _."),
  stepName: z.string().trim().min(1, "Step name is required."),
  sortOrder: z.coerce.number().int().min(1),
  isRequired: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

export const garmentWorkflowStepsFormSchema = z
  .object({
    steps: z.array(workflowStepInputFormSchema),
  })
  .superRefine((value, ctx) => {
    const seen = new Set<string>();

    value.steps.forEach((step, index) => {
      if (seen.has(step.stepKey)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["steps", index, "stepKey"],
          message: "Step keys must be unique.",
        });
        return;
      }
      seen.add(step.stepKey);
    });
  });

export type GarmentWorkflowStepsFormValues = z.infer<
  typeof garmentWorkflowStepsFormSchema
>;
export type GarmentWorkflowStepsFormInput = z.input<
  typeof garmentWorkflowStepsFormSchema
>;

export const loginFormSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type LoginFormInput = z.input<typeof loginFormSchema>;

export const publicStatusPinSchema = z.object({
  pin: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Please enter your 4-digit PIN."),
});

export type PublicStatusPinFormValues = z.infer<typeof publicStatusPinSchema>;
export type PublicStatusPinFormInput = z.input<typeof publicStatusPinSchema>;

export const confirmPasswordSchema = z.object({
  password: z.string().min(1, "Please enter your password to proceed."),
});

export type ConfirmPasswordFormValues = z.infer<typeof confirmPasswordSchema>;
export type ConfirmPasswordFormInput = z.input<typeof confirmPasswordSchema>;

export const integrationTestEmailFormSchema = z.object({
  to: z.string().trim().email("Recipient email is required."),
});

export type IntegrationTestEmailFormValues = z.infer<
  typeof integrationTestEmailFormSchema
>;
export type IntegrationTestEmailFormInput = z.input<
  typeof integrationTestEmailFormSchema
>;

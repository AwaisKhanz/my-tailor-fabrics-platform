"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.integrationTestEmailFormSchema = exports.confirmPasswordSchema = exports.publicStatusPinSchema = exports.loginFormSchema = exports.garmentWorkflowStepsFormSchema = exports.workflowStepInputFormSchema = exports.employeeDocumentUploadFormSchema = exports.employeeLedgerEntryFormSchema = exports.attendanceClockInFormSchema = exports.taskRateOverrideFormSchema = exports.paymentDisbursementFormSchema = exports.orderPaymentFormSchema = exports.rateCardCreateFormSchema = exports.expenseCategoryFormSchema = exports.expenseCreateFormSchema = exports.userAccountUpdateFormSchema = exports.userAccountCreateFormSchema = exports.branchUpdateFormSchema = exports.branchCreateFormSchema = exports.designTypeFormSchema = exports.measurementFieldDialogFormSchema = exports.measurementCategorySchema = exports.measurementFieldSchema = exports.garmentTypeSchema = exports.orderSchema = exports.orderItemSchema = exports.accountCreationSchema = exports.accountSchema = exports.employeeSchema = exports.customerSchema = void 0;
exports.createMeasurementValuesFormSchema = createMeasurementValuesFormSchema;
const zod_1 = require("zod");
const common_1 = require("./common");
const optionalTrimmedText = zod_1.z.string().trim().optional();
const optionalEmail = zod_1.z.string().trim().email("Invalid email").optional().or(zod_1.z.literal(""));
exports.customerSchema = zod_1.z.object({
    fullName: zod_1.z.string().trim().min(2, "Name must be at least 2 characters"),
    phone: zod_1.z.string().trim().min(10, "Invalid phone number"),
    whatsapp: optionalTrimmedText,
    email: optionalEmail,
    address: optionalTrimmedText,
    city: optionalTrimmedText,
    notes: optionalTrimmedText,
    status: zod_1.z.nativeEnum(common_1.CustomerStatus).default(common_1.CustomerStatus.ACTIVE),
    branchId: optionalTrimmedText,
});
exports.employeeSchema = zod_1.z.object({
    fullName: zod_1.z.string().trim().min(2, "Full name must be at least 2 characters"),
    phone: zod_1.z.string().trim().min(10, "Invalid phone number"),
    phone2: optionalTrimmedText,
    address: optionalTrimmedText,
    city: optionalTrimmedText,
    designation: zod_1.z.string().trim().min(2, "Designation is required"),
    status: zod_1.z.nativeEnum(common_1.EmployeeStatus),
    paymentType: zod_1.z.nativeEnum(common_1.PaymentType),
    dateOfJoining: zod_1.z.string().min(1, "Date of joining is required"),
    dateOfBirth: optionalTrimmedText,
    emergencyName: optionalTrimmedText,
    emergencyPhone: optionalTrimmedText,
    branchId: optionalTrimmedText,
});
exports.accountSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email("Invalid email address"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    role: zod_1.z.nativeEnum(common_1.Role),
});
exports.accountCreationSchema = zod_1.z
    .object({
    email: zod_1.z.string().trim().email("Invalid email address"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: zod_1.z.string(),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
exports.orderItemSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    garmentTypeId: zod_1.z.string().min(1, "Garment type is required"),
    quantity: zod_1.z.coerce.number().min(1, "Quantity must be at least 1"),
    unitPrice: zod_1.z.coerce.number().min(0, "Price must be at least 0"),
    employeeId: zod_1.z.string().optional(),
    employeeRate: zod_1.z.coerce.number().optional(),
    dueDate: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    fabricSource: zod_1.z.nativeEnum(common_1.FabricSource).default(common_1.FabricSource.SHOP),
    designTypeId: zod_1.z.string().optional(),
    addons: zod_1.z
        .array(zod_1.z.object({
        type: zod_1.z.nativeEnum(common_1.AddonType),
        name: zod_1.z.string().min(1, "Addon name is required"),
        price: zod_1.z.coerce.number().min(0, "Addon price must be at least 0"),
    }))
        .optional(),
});
exports.orderSchema = zod_1.z.object({
    customerId: zod_1.z.string().min(1, "Customer is required"),
    dueDate: zod_1.z.string().min(1, "Due date is required"),
    items: zod_1.z.array(exports.orderItemSchema).min(1, "At least one item is required"),
    discountType: zod_1.z.nativeEnum(common_1.DiscountType).optional(),
    discountValue: zod_1.z.coerce.number().default(0),
    advancePayment: zod_1.z.coerce.number().default(0),
    notes: zod_1.z.string().optional(),
});
exports.garmentTypeSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, "Name must be at least 2 characters"),
    customerPrice: zod_1.z.coerce.number().min(0, "Price cannot be negative"),
    employeeRate: zod_1.z.coerce.number().min(0, "Rate cannot be negative"),
    description: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().default(true),
    sortOrder: zod_1.z.coerce.number().default(0),
    measurementCategoryIds: zod_1.z.array(zod_1.z.string()).default([]),
});
exports.measurementFieldSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    name: zod_1.z.string().min(1, "Required"),
    label: zod_1.z.string().min(1, "Required"),
    fieldType: zod_1.z.enum(["TEXT", "NUMBER", "DROPDOWN"]),
    options: zod_1.z.string().optional(),
    isRequired: zod_1.z.boolean().default(false),
    sortOrder: zod_1.z.number().default(0),
});
exports.measurementCategorySchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, "Name must be at least 2 characters"),
    isActive: zod_1.z.boolean().default(true),
    sortOrder: zod_1.z.coerce.number().default(0),
    fields: zod_1.z.array(exports.measurementFieldSchema),
});
exports.measurementFieldDialogFormSchema = zod_1.z
    .object({
    label: zod_1.z.string().trim().min(1, "Label is required"),
    fieldType: zod_1.z.nativeEnum(common_1.FieldType),
    unit: optionalTrimmedText,
    isRequired: zod_1.z.boolean().default(false),
    dropdownOptions: zod_1.z.array(zod_1.z.string().trim().min(1)).default([]),
    sortOrder: zod_1.z.coerce
        .number()
        .int("Sort order must be a whole number")
        .min(1, "Sort order must be at least 1"),
})
    .superRefine((value, ctx) => {
    if (value.fieldType !== common_1.FieldType.DROPDOWN) {
        return;
    }
    if (value.dropdownOptions.length === 0) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["dropdownOptions"],
            message: "Please add at least one dropdown option.",
        });
    }
});
function createMeasurementValuesFormSchema(fields) {
    return zod_1.z
        .record(zod_1.z.string(), zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean(), zod_1.z.null()]).optional())
        .superRefine((values, ctx) => {
        fields.forEach((field) => {
            const raw = values[field.id];
            const normalized = raw == null ? "" : String(raw).trim();
            if (field.isRequired && normalized.length === 0) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    path: [field.id],
                    message: `${field.label} is required.`,
                });
                return;
            }
            if (normalized.length === 0) {
                return;
            }
            if (field.fieldType === common_1.FieldType.NUMBER && Number.isNaN(Number(normalized))) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    path: [field.id],
                    message: `${field.label} must be a valid number.`,
                });
            }
            if (field.fieldType === common_1.FieldType.DROPDOWN &&
                !field.dropdownOptions.includes(normalized)) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    path: [field.id],
                    message: `Select a valid option for ${field.label}.`,
                });
            }
        });
    });
}
exports.designTypeFormSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1, "Design name is required"),
    defaultPrice: zod_1.z.coerce.number().min(0, "Price must be zero or greater"),
    defaultRate: zod_1.z.coerce.number().min(0, "Rate must be zero or greater"),
    garmentTypeId: zod_1.z.string().trim().min(1, "Garment selection is required"),
    branchId: zod_1.z.string().trim().min(1, "Branch selection is required"),
    sortOrder: zod_1.z.coerce
        .number()
        .int("Sort order must be a whole number")
        .min(0, "Sort order must be zero or greater"),
    isActive: zod_1.z.boolean().default(true),
});
exports.branchCreateFormSchema = zod_1.z.object({
    code: zod_1.z
        .string()
        .trim()
        .min(2, "Branch code must be at least 2 characters")
        .max(6, "Branch code cannot exceed 6 characters"),
    name: zod_1.z
        .string()
        .trim()
        .min(2, "Branch name must be at least 2 characters"),
    address: optionalTrimmedText,
    phone: optionalTrimmedText,
});
exports.branchUpdateFormSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(2, "Branch name must be at least 2 characters"),
    address: optionalTrimmedText,
    phone: optionalTrimmedText,
});
const userAccountBaseSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, "Name must be at least 2 characters"),
    email: zod_1.z.string().trim().email("Invalid email address"),
    role: zod_1.z.nativeEnum(common_1.Role),
    branchId: zod_1.z.string().trim().optional(),
});
exports.userAccountCreateFormSchema = userAccountBaseSchema.extend({
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
});
exports.userAccountUpdateFormSchema = userAccountBaseSchema.extend({
    password: zod_1.z
        .string()
        .trim()
        .optional()
        .refine((value) => !value || value.length >= 8, "Password must be at least 8 characters"),
});
exports.expenseCreateFormSchema = zod_1.z.object({
    categoryId: zod_1.z.string().trim().min(1, "Category is required"),
    amount: zod_1.z.coerce.number().positive("Amount must be greater than zero"),
    expenseDate: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Expense date is required"),
    description: optionalTrimmedText,
});
exports.expenseCategoryFormSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1, "Category name is required"),
    isActive: zod_1.z.boolean().default(true),
});
exports.rateCardCreateFormSchema = zod_1.z.object({
    garmentTypeId: zod_1.z.string().trim().min(1, "Garment type is required"),
    branchId: zod_1.z.string().trim().min(1, "Branch scope is required"),
    stepKey: zod_1.z.string().trim().min(1, "Production step is required"),
    amount: zod_1.z.coerce.number().min(0, "Rate must be a non-negative number"),
    effectiveFrom: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Effective date is required"),
});
exports.orderPaymentFormSchema = zod_1.z.object({
    amount: zod_1.z.coerce.number().positive("Payment amount must be greater than zero"),
    note: optionalTrimmedText,
});
exports.paymentDisbursementFormSchema = zod_1.z.object({
    amount: zod_1.z.coerce.number().positive("Please enter a valid positive amount."),
    note: optionalTrimmedText,
});
exports.taskRateOverrideFormSchema = zod_1.z.object({
    amount: zod_1.z.coerce.number().min(0, "Rate must be zero or greater."),
});
exports.attendanceClockInFormSchema = zod_1.z.object({
    employeeId: zod_1.z.string().trim().min(1, "Select an employee to clock in."),
    note: optionalTrimmedText,
});
exports.employeeLedgerEntryFormSchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(common_1.LedgerEntryType),
    amount: zod_1.z.coerce.number().positive("Amount must be greater than zero."),
    note: optionalTrimmedText,
});
exports.employeeDocumentUploadFormSchema = zod_1.z.object({
    label: zod_1.z.string().trim().min(1, "Document label is required."),
    url: zod_1.z.string().trim().url("Please enter a valid file URL."),
});
exports.workflowStepInputFormSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    stepKey: zod_1.z
        .string()
        .trim()
        .min(1, "Step key is required.")
        .regex(/^[A-Z0-9_]+$/, "Step key can only contain A-Z, 0-9, and _."),
    stepName: zod_1.z.string().trim().min(1, "Step name is required."),
    sortOrder: zod_1.z.coerce.number().int().min(1),
    isRequired: zod_1.z.boolean().default(true),
    isActive: zod_1.z.boolean().default(true),
});
exports.garmentWorkflowStepsFormSchema = zod_1.z
    .object({
    steps: zod_1.z.array(exports.workflowStepInputFormSchema),
})
    .superRefine((value, ctx) => {
    const seen = new Set();
    value.steps.forEach((step, index) => {
        if (seen.has(step.stepKey)) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ["steps", index, "stepKey"],
                message: "Step keys must be unique.",
            });
            return;
        }
        seen.add(step.stepKey);
    });
});
exports.loginFormSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email("Enter a valid email address"),
    password: zod_1.z.string().min(1, "Password is required"),
});
exports.publicStatusPinSchema = zod_1.z.object({
    pin: zod_1.z
        .string()
        .trim()
        .regex(/^\d{4}$/, "Please enter your 4-digit PIN."),
});
exports.confirmPasswordSchema = zod_1.z.object({
    password: zod_1.z.string().min(1, "Please enter your password to proceed."),
});
exports.integrationTestEmailFormSchema = zod_1.z.object({
    to: zod_1.z.string().trim().email("Recipient email is required."),
});

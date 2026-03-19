import { z } from "zod";
import { AddonType, CustomerStatus, DiscountType, EmployeeStatus, FieldType, FabricSource, LedgerEntryType, PaymentType, Role } from "./common";
import type { MeasurementField } from "./config";
export declare const customerSchema: z.ZodObject<{
    fullName: z.ZodString;
    phone: z.ZodString;
    whatsapp: z.ZodOptional<z.ZodString>;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<typeof CustomerStatus>>;
    branchId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CustomerFormValues = z.infer<typeof customerSchema>;
export declare const employeeSchema: z.ZodObject<{
    fullName: z.ZodString;
    phone: z.ZodString;
    phone2: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    designation: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<typeof EmployeeStatus>;
    paymentType: z.ZodEnum<typeof PaymentType>;
    monthlySalary: z.ZodPipe<z.ZodTransform<{} | undefined, unknown>, z.ZodOptional<z.ZodNumber>>;
    dateOfJoining: z.ZodString;
    employmentEndDate: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    dateOfBirth: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    emergencyName: z.ZodOptional<z.ZodString>;
    emergencyPhone: z.ZodOptional<z.ZodString>;
    branchId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type EmployeeFormValues = z.infer<typeof employeeSchema>;
export declare const accountSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodEnum<typeof Role>;
}, z.core.$strip>;
export type AccountFormValues = z.infer<typeof accountSchema>;
export declare const accountCreationSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, z.core.$strip>;
export type AccountCreationFormValues = z.infer<typeof accountCreationSchema>;
export declare const orderItemSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    garmentTypeId: z.ZodString;
    quantity: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    unitPrice: z.ZodCoercedNumber<unknown>;
    dueDate: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    fabricSource: z.ZodDefault<z.ZodEnum<typeof FabricSource>>;
    shopFabricId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    shopFabricPrice: z.ZodPipe<z.ZodTransform<{} | undefined, unknown>, z.ZodOptional<z.ZodNumber>>;
    customerFabricNote: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    designTypeId: z.ZodOptional<z.ZodString>;
    addons: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<typeof AddonType>;
        name: z.ZodString;
        price: z.ZodCoercedNumber<unknown>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type OrderItemFormValues = z.infer<typeof orderItemSchema>;
export declare const orderSchema: z.ZodObject<{
    customerId: z.ZodString;
    dueDate: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        garmentTypeId: z.ZodString;
        quantity: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        unitPrice: z.ZodCoercedNumber<unknown>;
        dueDate: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        fabricSource: z.ZodDefault<z.ZodEnum<typeof FabricSource>>;
        shopFabricId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        shopFabricPrice: z.ZodPipe<z.ZodTransform<{} | undefined, unknown>, z.ZodOptional<z.ZodNumber>>;
        customerFabricNote: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        designTypeId: z.ZodOptional<z.ZodString>;
        addons: z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<typeof AddonType>;
            name: z.ZodString;
            price: z.ZodCoercedNumber<unknown>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    discountType: z.ZodOptional<z.ZodEnum<typeof DiscountType>>;
    discountValue: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    advancePayment: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type OrderFormValues = z.infer<typeof orderSchema>;
export declare const garmentTypeSchema: z.ZodObject<{
    name: z.ZodString;
    customerPrice: z.ZodCoercedNumber<unknown>;
    description: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    sortOrder: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    measurementCategoryIds: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type GarmentTypeFormValues = z.infer<typeof garmentTypeSchema>;
export declare const measurementFieldSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    label: z.ZodString;
    fieldType: z.ZodEnum<{
        NUMBER: "NUMBER";
        TEXT: "TEXT";
        DROPDOWN: "DROPDOWN";
    }>;
    options: z.ZodOptional<z.ZodString>;
    isRequired: z.ZodDefault<z.ZodBoolean>;
    sortOrder: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export declare const measurementCategorySchema: z.ZodObject<{
    name: z.ZodString;
    isActive: z.ZodDefault<z.ZodBoolean>;
    sortOrder: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    fields: z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        name: z.ZodString;
        label: z.ZodString;
        fieldType: z.ZodEnum<{
            NUMBER: "NUMBER";
            TEXT: "TEXT";
            DROPDOWN: "DROPDOWN";
        }>;
        options: z.ZodOptional<z.ZodString>;
        isRequired: z.ZodDefault<z.ZodBoolean>;
        sortOrder: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type MeasurementCategoryFormValues = z.infer<typeof measurementCategorySchema>;
export declare const measurementFieldDialogFormSchema: z.ZodObject<{
    label: z.ZodString;
    sectionName: z.ZodString;
    fieldType: z.ZodEnum<typeof FieldType>;
    unit: z.ZodOptional<z.ZodString>;
    isRequired: z.ZodDefault<z.ZodBoolean>;
    dropdownOptions: z.ZodDefault<z.ZodArray<z.ZodString>>;
    sortOrder: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
export type MeasurementFieldDialogFormValues = z.infer<typeof measurementFieldDialogFormSchema>;
export type MeasurementValuesSchemaField = Pick<MeasurementField, "id" | "label" | "fieldType" | "isRequired" | "dropdownOptions">;
export declare function createMeasurementValuesFormSchema(fields: MeasurementValuesSchemaField[]): z.ZodRecord<z.ZodString, z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>>>;
export declare const designTypeFormSchema: z.ZodObject<{
    name: z.ZodString;
    defaultPrice: z.ZodCoercedNumber<unknown>;
    defaultRate: z.ZodCoercedNumber<unknown>;
    garmentTypeId: z.ZodString;
    branchId: z.ZodString;
    sortOrder: z.ZodCoercedNumber<unknown>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type DesignTypeFormValues = z.infer<typeof designTypeFormSchema>;
export declare const branchCreateFormSchema: z.ZodObject<{
    code: z.ZodString;
    name: z.ZodString;
    address: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type BranchCreateFormValues = z.infer<typeof branchCreateFormSchema>;
export declare const branchUpdateFormSchema: z.ZodObject<{
    name: z.ZodString;
    address: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type BranchUpdateFormValues = z.infer<typeof branchUpdateFormSchema>;
export declare const userAccountCreateFormSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    role: z.ZodEnum<typeof Role>;
    branchId: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
}, z.core.$strip>;
export type UserAccountCreateFormValues = z.infer<typeof userAccountCreateFormSchema>;
export declare const userAccountUpdateFormSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    role: z.ZodEnum<typeof Role>;
    branchId: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UserAccountUpdateFormValues = z.infer<typeof userAccountUpdateFormSchema>;
export declare const expenseCreateFormSchema: z.ZodObject<{
    categoryId: z.ZodString;
    amount: z.ZodCoercedNumber<unknown>;
    expenseDate: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ExpenseCreateFormValues = z.infer<typeof expenseCreateFormSchema>;
export type ExpenseCreateFormInput = z.input<typeof expenseCreateFormSchema>;
export declare const expenseCategoryFormSchema: z.ZodObject<{
    name: z.ZodString;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type ExpenseCategoryFormValues = z.infer<typeof expenseCategoryFormSchema>;
export type ExpenseCategoryFormInput = z.input<typeof expenseCategoryFormSchema>;
export declare const rateCardCreateFormSchema: z.ZodObject<{
    garmentTypeId: z.ZodString;
    branchId: z.ZodString;
    stepKey: z.ZodString;
    amount: z.ZodCoercedNumber<unknown>;
    effectiveFrom: z.ZodString;
}, z.core.$strip>;
export type RateCardCreateFormValues = z.infer<typeof rateCardCreateFormSchema>;
export type RateCardCreateFormInput = z.input<typeof rateCardCreateFormSchema>;
export declare const orderPaymentFormSchema: z.ZodObject<{
    amount: z.ZodCoercedNumber<unknown>;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type OrderPaymentFormValues = z.infer<typeof orderPaymentFormSchema>;
export type OrderPaymentFormInput = z.input<typeof orderPaymentFormSchema>;
export declare const paymentDisbursementFormSchema: z.ZodObject<{
    amount: z.ZodCoercedNumber<unknown>;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type PaymentDisbursementFormValues = z.infer<typeof paymentDisbursementFormSchema>;
export type PaymentDisbursementFormInput = z.input<typeof paymentDisbursementFormSchema>;
export declare const salaryAccrualGenerationFormSchema: z.ZodObject<{
    month: z.ZodString;
    employeeId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type SalaryAccrualGenerationFormValues = z.infer<typeof salaryAccrualGenerationFormSchema>;
export type SalaryAccrualGenerationFormInput = z.input<typeof salaryAccrualGenerationFormSchema>;
export declare const taskRateOverrideFormSchema: z.ZodObject<{
    amount: z.ZodCoercedNumber<unknown>;
}, z.core.$strip>;
export type TaskRateOverrideFormValues = z.infer<typeof taskRateOverrideFormSchema>;
export type TaskRateOverrideFormInput = z.input<typeof taskRateOverrideFormSchema>;
export declare const employeeLedgerEntryFormSchema: z.ZodObject<{
    type: z.ZodEnum<typeof LedgerEntryType>;
    amount: z.ZodCoercedNumber<unknown>;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type EmployeeLedgerEntryFormValues = z.infer<typeof employeeLedgerEntryFormSchema>;
export type EmployeeLedgerEntryFormInput = z.input<typeof employeeLedgerEntryFormSchema>;
export declare const employeeDocumentUploadFormSchema: z.ZodObject<{
    label: z.ZodString;
    url: z.ZodString;
}, z.core.$strip>;
export type EmployeeDocumentUploadFormValues = z.infer<typeof employeeDocumentUploadFormSchema>;
export type EmployeeDocumentUploadFormInput = z.input<typeof employeeDocumentUploadFormSchema>;
export declare const employeeCapabilityWindowInputSchema: z.ZodObject<{
    garmentTypeId: z.ZodOptional<z.ZodString>;
    stepKey: z.ZodOptional<z.ZodString>;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const employeeCapabilitySnapshotFormSchema: z.ZodObject<{
    effectiveFrom: z.ZodString;
    note: z.ZodOptional<z.ZodString>;
    capabilities: z.ZodArray<z.ZodObject<{
        garmentTypeId: z.ZodOptional<z.ZodString>;
        stepKey: z.ZodOptional<z.ZodString>;
        note: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type EmployeeCapabilitySnapshotFormValues = z.infer<typeof employeeCapabilitySnapshotFormSchema>;
export type EmployeeCapabilitySnapshotFormInput = z.input<typeof employeeCapabilitySnapshotFormSchema>;
export declare const employeeCompensationChangeFormSchema: z.ZodObject<{
    paymentType: z.ZodEnum<typeof PaymentType>;
    monthlySalary: z.ZodPipe<z.ZodTransform<{} | undefined, unknown>, z.ZodOptional<z.ZodNumber>>;
    effectiveFrom: z.ZodString;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type EmployeeCompensationChangeFormValues = z.infer<typeof employeeCompensationChangeFormSchema>;
export type EmployeeCompensationChangeFormInput = z.input<typeof employeeCompensationChangeFormSchema>;
export declare const workflowStepInputFormSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    stepKey: z.ZodString;
    stepName: z.ZodString;
    sortOrder: z.ZodCoercedNumber<unknown>;
    isRequired: z.ZodDefault<z.ZodBoolean>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const garmentWorkflowStepsFormSchema: z.ZodObject<{
    steps: z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        stepKey: z.ZodString;
        stepName: z.ZodString;
        sortOrder: z.ZodCoercedNumber<unknown>;
        isRequired: z.ZodDefault<z.ZodBoolean>;
        isActive: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type GarmentWorkflowStepsFormValues = z.infer<typeof garmentWorkflowStepsFormSchema>;
export type GarmentWorkflowStepsFormInput = z.input<typeof garmentWorkflowStepsFormSchema>;
export declare const loginFormSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type LoginFormInput = z.input<typeof loginFormSchema>;
export declare const loginOtpCodeSchema: z.ZodObject<{
    otpCode: z.ZodString;
}, z.core.$strip>;
export type LoginOtpCodeValues = z.infer<typeof loginOtpCodeSchema>;
export type LoginOtpCodeInput = z.input<typeof loginOtpCodeSchema>;
export declare const publicStatusPinSchema: z.ZodObject<{
    pin: z.ZodString;
}, z.core.$strip>;
export type PublicStatusPinFormValues = z.infer<typeof publicStatusPinSchema>;
export type PublicStatusPinFormInput = z.input<typeof publicStatusPinSchema>;
export declare const confirmPasswordSchema: z.ZodObject<{
    password: z.ZodString;
}, z.core.$strip>;
export type ConfirmPasswordFormValues = z.infer<typeof confirmPasswordSchema>;
export type ConfirmPasswordFormInput = z.input<typeof confirmPasswordSchema>;
export declare const integrationTestEmailFormSchema: z.ZodObject<{
    to: z.ZodString;
}, z.core.$strip>;
export type IntegrationTestEmailFormValues = z.infer<typeof integrationTestEmailFormSchema>;
export type IntegrationTestEmailFormInput = z.input<typeof integrationTestEmailFormSchema>;

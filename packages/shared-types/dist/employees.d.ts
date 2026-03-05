import { EmployeeStatus, OrderStatus, PaginatedResponse, PaymentType } from './common';
export interface EmployeeLinkedUserAccount {
    id: string;
    email: string;
    isActive: boolean;
    role?: string;
    createdAt?: string;
}
export interface Employee {
    id: string;
    branchId: string;
    employeeCode: string;
    fullName: string;
    phone: string;
    phone2?: string | null;
    address?: string | null;
    city?: string | null;
    designation?: string | null;
    status: EmployeeStatus;
    paymentType: PaymentType;
    dateOfJoining: string;
    dateOfBirth?: string | null;
    emergencyName?: string | null;
    emergencyPhone?: string | null;
    userAccount?: EmployeeLinkedUserAccount | null;
    documents?: EmployeeDocument[];
    createdAt: string;
    updatedAt: string;
}
export interface EmployeeDocument {
    id: string;
    employeeId: string;
    label: string;
    fileUrl: string;
    fileType: string;
    createdAt: string;
}
export interface EmployeeWithRelations extends Employee {
    userAccount?: EmployeeLinkedUserAccount | null;
    documents: EmployeeDocument[];
}
export interface EmployeeListQueryInput {
    page?: number;
    limit?: number;
    search?: string;
}
export type EmployeeListResult = PaginatedResponse<Employee>;
export interface EmployeeItemsQueryInput {
    page?: number;
    limit?: number;
}
export interface EmployeeOrderReference {
    orderNumber: string;
    dueDate?: string | null;
    status?: OrderStatus | string;
}
export type EmployeeOrderItem = Omit<import('./orders').OrderItem, 'order'> & {
    order: EmployeeOrderReference;
};
export type EmployeeItemsResult = PaginatedResponse<EmployeeOrderItem>;
export type EmployeeAssignedItemsResult = EmployeeItemsResult;
export interface CreateEmployeeInput {
    fullName: string;
    phone: string;
    fatherName?: string;
    phone2?: string;
    address?: string;
    city?: string;
    cnic?: string;
    dateOfBirth?: string;
    dateOfJoining?: string;
    designation?: string;
    paymentType?: PaymentType;
    accountNumber?: string;
    emergencyName?: string;
    emergencyPhone?: string;
    notes?: string;
}
export interface UpdateEmployeeInput extends Partial<CreateEmployeeInput> {
    status?: EmployeeStatus;
}
export interface CreateEmployeeUserAccountInput {
    email: string;
    password: string;
}
export interface CreateEmployeeUserAccountResult {
    id: string;
    email: string;
}
export interface AddEmployeeDocumentInput {
    label: string;
    fileUrl: string;
    fileType: string;
}
export interface EmployeeStatsSummary {
    totalEarned: number;
    totalPaid: number;
    balance: number;
    /** @deprecated Use `balance` */
    currentBalance?: number;
}

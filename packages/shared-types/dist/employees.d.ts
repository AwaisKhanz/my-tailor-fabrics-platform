import { EmployeeStatus, PaymentType } from './common';
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
    userAccount?: {
        id: string;
        email: string;
        role: string;
        isActive: boolean;
    } | null;
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

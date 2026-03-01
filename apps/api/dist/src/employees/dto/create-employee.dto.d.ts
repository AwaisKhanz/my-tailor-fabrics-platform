import { EmployeeStatus, PaymentType } from '@tbms/shared-types';
export declare class CreateEmployeeDto {
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
export declare class UpdateEmployeeDto extends CreateEmployeeDto {
    status?: EmployeeStatus;
}

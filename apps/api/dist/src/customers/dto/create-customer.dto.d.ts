import { CustomerStatus } from '@tbms/shared-types';
export declare class CreateCustomerDto {
    fullName: string;
    phone: string;
    whatsapp?: string;
    email?: string;
    address?: string;
    city?: string;
    notes?: string;
}
export declare class UpdateCustomerDto extends CreateCustomerDto {
    status?: CustomerStatus;
}

import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { SearchService } from './search.service';
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    queryCustomers(query: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            address: string | null;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            email: string | null;
            branchId: string;
            sizeNumber: string;
            fullName: string;
            whatsapp: string | null;
            city: string | null;
            notes: string | null;
            status: import(".prisma/client").$Enums.CustomerStatus;
            isVip: boolean;
            lifetimeValue: number;
        }[];
    }>;
    queryEmployees(query: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            address: string | null;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            branchId: string;
            fullName: string;
            city: string | null;
            notes: string | null;
            status: import(".prisma/client").$Enums.EmployeeStatus;
            employeeCode: string;
            fatherName: string | null;
            phone2: string | null;
            cnic: string | null;
            dateOfBirth: Date | null;
            dateOfJoining: Date;
            designation: string | null;
            paymentType: import(".prisma/client").$Enums.PaymentType;
            accountNumber: string | null;
            emergencyName: string | null;
            emergencyPhone: string | null;
            photoUrl: string | null;
        }[];
    }>;
}

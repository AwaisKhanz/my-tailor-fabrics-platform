import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { SearchService } from './search.service';
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    queryCustomers(query: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            phone: string;
            deletedAt: Date | null;
            email: string | null;
            branchId: string;
            fullName: string;
            city: string | null;
            status: import(".prisma/client").$Enums.CustomerStatus;
            notes: string | null;
            sizeNumber: string;
            whatsapp: string | null;
            isVip: boolean;
            lifetimeValue: number;
        }[];
    }>;
    queryEmployees(query: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            phone: string;
            deletedAt: Date | null;
            branchId: string;
            employeeCode: string;
            cnic: string | null;
            fullName: string;
            fatherName: string | null;
            phone2: string | null;
            city: string | null;
            dateOfBirth: Date | null;
            dateOfJoining: Date;
            designation: string | null;
            paymentType: import(".prisma/client").$Enums.PaymentType;
            accountNumber: string | null;
            emergencyName: string | null;
            emergencyPhone: string | null;
            photoUrl: string | null;
            status: import(".prisma/client").$Enums.EmployeeStatus;
            notes: string | null;
        }[];
    }>;
}

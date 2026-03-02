import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/create-employee.dto';
export declare class EmployeesController {
    private readonly employeesService;
    constructor(employeesService: EmployeesService);
    create(createEmployeeDto: CreateEmployeeDto, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            branchId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            address: string | null;
            phone: string;
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
        };
    }>;
    findAll(page: string, limit: string, search: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            data: {
                id: string;
                branchId: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                address: string | null;
                phone: string;
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
            meta: {
                total: number;
                page: number;
                lastPage: number;
            };
            total?: undefined;
        } | {
            data: {
                id: string;
                branchId: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                address: string | null;
                phone: string;
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
            total: number;
            meta?: undefined;
        };
    }>;
    findOne(id: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            documents: {
                id: string;
                employeeId: string;
                createdAt: Date;
                deletedAt: Date | null;
                label: string;
                fileUrl: string;
                fileType: string;
                uploadedById: string;
            }[];
            userAccount: {
                id: string;
                email: string;
                isActive: boolean;
            } | null;
        } & {
            id: string;
            branchId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            address: string | null;
            phone: string;
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
        };
    }>;
    update(id: string, updateEmployeeDto: UpdateEmployeeDto, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            branchId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            address: string | null;
            phone: string;
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
        };
    }>;
    remove(id: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            branchId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            address: string | null;
            phone: string;
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
        };
    }>;
    createUserAccount(id: string, email: string, rawPass: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        user: {
            id: string;
            email: string;
        };
    }>;
    getStats(id: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            totalEarned: any;
            totalPaid: number;
            balance: number;
        };
    }>;
    getItems(id: string, page: string, limit: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            data: {
                id: string;
                status: import(".prisma/client").$Enums.ItemStatus;
                order: {
                    status: import(".prisma/client").$Enums.OrderStatus;
                    orderNumber: string;
                    dueDate: Date;
                };
                orderId: string;
                garmentTypeName: string;
                quantity: number;
                employeeRate: number;
                completedAt: Date | null;
            }[];
            total: number;
        };
    }>;
    addDocument(id: string, label: string, fileUrl: string, fileType: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            employeeId: string;
            createdAt: Date;
            deletedAt: Date | null;
            label: string;
            fileUrl: string;
            fileType: string;
            uploadedById: string;
        };
    }>;
    getMyProfile(req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            documents: {
                id: string;
                employeeId: string;
                createdAt: Date;
                deletedAt: Date | null;
                label: string;
                fileUrl: string;
                fileType: string;
                uploadedById: string;
            }[];
            userAccount: {
                id: string;
                email: string;
                isActive: boolean;
            } | null;
        } & {
            id: string;
            branchId: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            address: string | null;
            phone: string;
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
        };
    }>;
    getMyStats(req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            totalEarned: any;
            totalPaid: number;
            balance: number;
        };
    }>;
    getMyItems(page: string, limit: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            data: {
                id: string;
                status: import(".prisma/client").$Enums.ItemStatus;
                order: {
                    status: import(".prisma/client").$Enums.OrderStatus;
                    orderNumber: string;
                    dueDate: Date;
                };
                orderId: string;
                garmentTypeName: string;
                quantity: number;
                employeeRate: number;
                completedAt: Date | null;
            }[];
            total: number;
        };
    }>;
}

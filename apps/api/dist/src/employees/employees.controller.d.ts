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
            employeeCode: string;
            fullName: string;
            fatherName: string | null;
            phone: string;
            phone2: string | null;
            address: string | null;
            city: string | null;
            cnic: string | null;
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
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            branchId: string;
        };
    }>;
    findAll(page: string, limit: string, search: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            data: {
                id: string;
                employeeCode: string;
                fullName: string;
                fatherName: string | null;
                phone: string;
                phone2: string | null;
                address: string | null;
                city: string | null;
                cnic: string | null;
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
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                branchId: string;
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
                employeeCode: string;
                fullName: string;
                fatherName: string | null;
                phone: string;
                phone2: string | null;
                address: string | null;
                city: string | null;
                cnic: string | null;
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
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                branchId: string;
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
                createdAt: Date;
                deletedAt: Date | null;
                employeeId: string;
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
            employeeCode: string;
            fullName: string;
            fatherName: string | null;
            phone: string;
            phone2: string | null;
            address: string | null;
            city: string | null;
            cnic: string | null;
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
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            branchId: string;
        };
    }>;
    update(id: string, updateEmployeeDto: UpdateEmployeeDto, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            employeeCode: string;
            fullName: string;
            fatherName: string | null;
            phone: string;
            phone2: string | null;
            address: string | null;
            city: string | null;
            cnic: string | null;
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
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            branchId: string;
        };
    }>;
    remove(id: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            employeeCode: string;
            fullName: string;
            fatherName: string | null;
            phone: string;
            phone2: string | null;
            address: string | null;
            city: string | null;
            cnic: string | null;
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
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            branchId: string;
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
            totalEarned: number;
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
                    dueDate: Date;
                    orderNumber: string;
                };
                employeeRate: number;
                quantity: number;
                orderId: string;
                garmentTypeName: string;
                completedAt: Date | null;
            }[];
            total: number;
        };
    }>;
    addDocument(id: string, label: string, fileUrl: string, fileType: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            deletedAt: Date | null;
            employeeId: string;
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
                createdAt: Date;
                deletedAt: Date | null;
                employeeId: string;
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
            employeeCode: string;
            fullName: string;
            fatherName: string | null;
            phone: string;
            phone2: string | null;
            address: string | null;
            city: string | null;
            cnic: string | null;
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
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            branchId: string;
        };
    }>;
    getMyStats(req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
            totalEarned: number;
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
                    dueDate: Date;
                    orderNumber: string;
                };
                employeeRate: number;
                quantity: number;
                orderId: string;
                garmentTypeName: string;
                completedAt: Date | null;
            }[];
            total: number;
        };
    }>;
}

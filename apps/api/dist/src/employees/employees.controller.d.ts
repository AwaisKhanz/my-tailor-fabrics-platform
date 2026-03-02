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
        };
    }>;
    findAll(page: string, limit: string, search: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
        data: {
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
            meta: {
                total: number;
                page: number;
                lastPage: number;
            };
            total?: undefined;
        } | {
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
                isActive: boolean;
                email: string;
            } | null;
        } & {
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
        };
    }>;
    update(id: string, updateEmployeeDto: UpdateEmployeeDto, req: AuthenticatedRequest): Promise<{
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
        };
    }>;
    remove(id: string, req: AuthenticatedRequest): Promise<{
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
                employeeRate: number;
                status: import(".prisma/client").$Enums.ItemStatus;
                garmentTypeName: string;
                quantity: number;
                completedAt: Date | null;
                order: {
                    status: import(".prisma/client").$Enums.OrderStatus;
                    orderNumber: string;
                    dueDate: Date;
                };
                orderId: string;
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
                isActive: boolean;
                email: string;
            } | null;
        } & {
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
                employeeRate: number;
                status: import(".prisma/client").$Enums.ItemStatus;
                garmentTypeName: string;
                quantity: number;
                completedAt: Date | null;
                order: {
                    status: import(".prisma/client").$Enums.OrderStatus;
                    orderNumber: string;
                    dueDate: Date;
                };
                orderId: string;
            }[];
            total: number;
        };
    }>;
}

import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/create-employee.dto';
import { SearchService } from '../search/search.service';
export declare class EmployeesService {
    private prisma;
    private searchService;
    constructor(prisma: PrismaService, searchService: SearchService);
    private generateEmployeeCode;
    create(createEmployeeDto: CreateEmployeeDto, branchId: string): Promise<{
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
    }>;
    findAll(branchId: string, page?: number, limit?: number, search?: string): Promise<{
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
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    findOne(id: string, branchId: string): Promise<{
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
    }>;
    update(id: string, branchId: string, updateEmployeeDto: UpdateEmployeeDto): Promise<{
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
    }>;
    remove(id: string, branchId: string): Promise<{
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
    }>;
    createUserAccount(employeeId: string, branchId: string, email: string, rawPass: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        email: string;
        employeeId: string | null;
        passwordHash: string;
        role: import(".prisma/client").$Enums.Role;
        branchId: string | null;
        lastLoginAt: Date | null;
        refreshToken: string | null;
    }>;
    getStats(id: string, branchId: string): Promise<{
        totalEarned: number;
        totalPaid: number;
        balance: number;
    }>;
    getItems(id: string, branchId: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            employeeRate: number;
            order: {
                status: import(".prisma/client").$Enums.OrderStatus;
                orderNumber: string;
                dueDate: Date;
            };
            status: import(".prisma/client").$Enums.ItemStatus;
            orderId: string;
            garmentTypeName: string;
            quantity: number;
            completedAt: Date | null;
        }[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    addDocument(id: string, branchId: string, label: string, fileUrl: string, fileType: string, uploadedById: string): Promise<{
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        employeeId: string;
        label: string;
        fileUrl: string;
        fileType: string;
        uploadedById: string;
    }>;
    getMyProfile(employeeId: string, branchId: string): Promise<{
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
    }>;
    getMyStats(employeeId: string, branchId: string): Promise<{
        totalEarned: number;
        totalPaid: number;
        balance: number;
    }>;
    getMyItems(employeeId: string, branchId: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            employeeRate: number;
            order: {
                status: import(".prisma/client").$Enums.OrderStatus;
                orderNumber: string;
                dueDate: Date;
            };
            status: import(".prisma/client").$Enums.ItemStatus;
            orderId: string;
            garmentTypeName: string;
            quantity: number;
            completedAt: Date | null;
        }[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
}

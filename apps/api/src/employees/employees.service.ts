import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/create-employee.dto';
import { SearchService } from '../search/search.service';
import * as bcrypt from 'bcrypt';
import { Role, Prisma } from '@prisma/client';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService, private searchService: SearchService) {}

  private async generateEmployeeCode(branchId: string): Promise<string> {
    const branch = await this.prisma.branch.findUnique({ where: { id: branchId } });
    if (!branch) throw new NotFoundException('Branch not found');

    const prefix = `EMP-${branch.code}-`;
    const lastEmployee = await this.prisma.employee.findFirst({
        where: { branchId, employeeCode: { startsWith: prefix } },
        orderBy: { employeeCode: 'desc' },
    });

    let nextNumber = 1;
    if (lastEmployee) {
        const parts = lastEmployee.employeeCode.split('-');
        if (parts.length === 3) {
            nextNumber = parseInt(parts[2], 10) + 1;
        }
    }

    const paddedNumber = String(nextNumber).padStart(4, '0');
    return `${prefix}${paddedNumber}`;
  }

  async create(createEmployeeDto: CreateEmployeeDto, branchId: string) {
    const employeeCode = await this.generateEmployeeCode(branchId);
    
    return this.prisma.employee.create({
      data: {
        ...createEmployeeDto,
        dateOfBirth: createEmployeeDto.dateOfBirth ? new Date(createEmployeeDto.dateOfBirth) : null,
        dateOfJoining: createEmployeeDto.dateOfJoining ? new Date(createEmployeeDto.dateOfJoining) : new Date(),
        employeeCode,
        branchId,
      },
    });
  }

  async findAll(branchId: string, page = 1, limit = 20, search?: string) {
    if (search && search.trim().length >= 2) {
       const results = await this.searchService.searchEmployees(search, branchId, limit);
       return { data: results, meta: { total: results.length, page: 1, lastPage: 1 } };
    }

    const skip = (page - 1) * limit;
    
    // Default to active employees in list view
    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where: { 
          deletedAt: null, 
          status: 'ACTIVE',
          ...(branchId ? { branchId } : {})
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.employee.count({ 
        where: { 
          deletedAt: null, 
          status: 'ACTIVE',
          ...(branchId ? { branchId } : {})
        } 
      })
    ]);

    return { data, total };
  }

  async findOne(id: string, branchId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { 
        id, 
        deletedAt: null,
        ...(branchId ? { branchId } : {})
      },
      include: {
        userAccount: {
          select: { id: true, email: true, isActive: true }
        },
        documents: true
      }
    });

    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async update(id: string, branchId: string, updateEmployeeDto: UpdateEmployeeDto) {
    await this.findOne(id, branchId);
    
    const data: Prisma.EmployeeUpdateInput = { ...updateEmployeeDto };
    if (data.dateOfBirth) data.dateOfBirth = new Date(data.dateOfBirth as string);
    if (data.dateOfJoining) data.dateOfJoining = new Date(data.dateOfJoining as string);

    return this.prisma.employee.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, branchId: string) {
    await this.findOne(id, branchId);
    return this.prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'LEFT' },
    });
  }

  // PRD Phase 1: create a login account for the tailor
  async createUserAccount(employeeId: string, branchId: string, email: string, rawPass: string) {
    const employee = await this.findOne(employeeId, branchId);
    
    // Check if email taken
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already in use');

    if (employee.userAccount) throw new ConflictException('Employee already has a user account linked');

    // Run in transaction to guarantee consistency
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const passwordHash = await bcrypt.hash(rawPass, 12);
        
        const user = await tx.user.create({
            data: {
               name: employee.fullName,
               email,
               passwordHash,
               role: Role.EMPLOYEE,
               branchId: employee.branchId, // Use the employee's branch, not the requester's which could be null for Super Admin
               employeeId
            }
        });

        return user;
    });
  }

  async getStats(id: string, branchId: string) {
    await this.findOne(id, branchId);

    // Sum all COMPLETED order items' rates
    const completedItems = await this.prisma.orderItem.aggregate({
        where: { employeeId: id, status: 'COMPLETED' },
        _sum: { employeeRate: true }
    });

    // Sum all payments (Disbursements)
    const totalPaidRes = await this.prisma.payment.aggregate({
        where: { employeeId: id },
        _sum: { amount: true }
    });

    const totalEarned = completedItems._sum.employeeRate || 0;
    const totalPaid = totalPaidRes._sum.amount || 0;
    const balance = totalEarned - totalPaid;

    return { totalEarned, totalPaid, balance };
  }

  async getItems(id: string, branchId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
        this.prisma.orderItem.findMany({
            where: { employeeId: id },
            select: {
                id: true,
                orderId: true,
                garmentTypeName: true,
                quantity: true,
                employeeRate: true,
                status: true,
                completedAt: true,
                order: { select: { orderNumber: true, status: true, dueDate: true } }
            },
            skip,
            take: limit,
            orderBy: { completedAt: 'desc' },
        }),
        this.prisma.orderItem.count({ where: { employeeId: id } })
    ]);

    return { data, total };
  }

  async addDocument(id: string, branchId: string, label: string, fileUrl: string, fileType: string, uploadedById: string) {
    await this.findOne(id, branchId);
    return this.prisma.employeeDocument.create({
        data: { employeeId: id, label, fileUrl, fileType, uploadedById }
    });
  }

  // Employee Portal Methods
  async getMyProfile(employeeId: string, branchId: string) {
    return this.findOne(employeeId, branchId);
  }

  async getMyStats(employeeId: string, branchId: string) {
    return this.getStats(employeeId, branchId);
  }

  async getMyItems(employeeId: string, branchId: string, page = 1, limit = 20) {
    return this.getItems(employeeId, branchId, page, limit);
  }
}

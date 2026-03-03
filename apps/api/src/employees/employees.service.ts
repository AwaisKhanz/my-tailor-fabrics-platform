import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from './dto/create-employee.dto';
import { SearchService } from '../search/search.service';
import { LedgerService } from '../ledger/ledger.service';
import * as bcrypt from 'bcrypt';
import { Role, Prisma } from '@prisma/client';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const MIN_SEARCH_QUERY_LENGTH = 2;

@Injectable()
export class EmployeesService {
  constructor(
    private prisma: PrismaService,
    private searchService: SearchService,
    private ledgerService: LedgerService,
  ) {}

  private normalizePagination(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
    const safePage =
      Number.isFinite(page) && page > 0 ? Math.trunc(page) : DEFAULT_PAGE;
    const safeLimit =
      Number.isFinite(limit) && limit > 0
        ? Math.min(Math.trunc(limit), MAX_LIMIT)
        : DEFAULT_LIMIT;
    return { page: safePage, limit: safeLimit, skip: (safePage - 1) * safeLimit };
  }

  private parseOptionalDate(value?: string): Date | null | undefined {
    if (value === undefined) return undefined;
    if (!value) return null;
    return new Date(value);
  }

  private async generateEmployeeCode(branchId: string): Promise<string> {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });
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
        dateOfBirth: this.parseOptionalDate(createEmployeeDto.dateOfBirth),
        dateOfJoining:
          this.parseOptionalDate(createEmployeeDto.dateOfJoining) ?? new Date(),
        employeeCode,
        branchId,
      },
    });
  }

  async findAll(branchId: string, page = 1, limit = 20, search?: string) {
    const { page: safePage, limit: safeLimit, skip } = this.normalizePagination(
      page,
      limit,
    );
    const query = search?.trim();

    if (query && query.length >= MIN_SEARCH_QUERY_LENGTH) {
      const results = await this.searchService.searchEmployees(
        query,
        branchId,
        safeLimit,
      );
      return { data: results, total: results.length };
    }

    // Default to active employees in list view
    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where: {
          deletedAt: null,
          status: 'ACTIVE',
          ...(branchId ? { branchId } : {}),
        },
        skip,
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.employee.count({
        where: {
          deletedAt: null,
          status: 'ACTIVE',
          ...(branchId ? { branchId } : {}),
        },
      }),
    ]);

    // Maintain existing response shape expected by callers.
    return { data, total, page: safePage };
  }

  async findOne(id: string, branchId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(branchId ? { branchId } : {}),
      },
      include: {
        userAccount: {
          select: { id: true, email: true, isActive: true },
        },
        documents: true,
      },
    });

    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async update(
    id: string,
    branchId: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ) {
    await this.findOne(id, branchId);

    const data: Prisma.EmployeeUpdateInput = { ...updateEmployeeDto };
    if (updateEmployeeDto.dateOfBirth !== undefined) {
      data.dateOfBirth = this.parseOptionalDate(updateEmployeeDto.dateOfBirth);
    }
    if (updateEmployeeDto.dateOfJoining !== undefined) {
      data.dateOfJoining = new Date(updateEmployeeDto.dateOfJoining);
    }

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
  async createUserAccount(
    employeeId: string,
    branchId: string,
    email: string,
    rawPass: string,
  ) {
    const employee = await this.findOne(employeeId, branchId);

    // Check if email taken
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already in use');

    if (employee.userAccount)
      throw new ConflictException('Employee already has a user account linked');

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
          employeeId,
        },
      });

      return user;
    });
  }

  async getStats(id: string, branchId: string) {
    await this.findOne(id, branchId);
    const summary = await this.ledgerService.getBalance(id);
    return {
      totalEarned: summary.totalEarned,
      totalPaid: summary.totalDeducted,
      balance: summary.currentBalance,
      currentBalance: summary.currentBalance,
    };
  }

  async getItems(id: string, branchId: string, page = 1, limit = 20) {
    await this.findOne(id, branchId);

    const { limit: safeLimit, skip } = this.normalizePagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.orderItem.findMany({
        where: { employeeId: id, deletedAt: null },
        select: {
          id: true,
          orderId: true,
          garmentTypeName: true,
          quantity: true,
          employeeRate: true,
          status: true,
          completedAt: true,
          order: { select: { orderNumber: true, status: true, dueDate: true } },
        },
        skip,
        take: safeLimit,
        orderBy: { completedAt: 'desc' },
      }),
      this.prisma.orderItem.count({ where: { employeeId: id, deletedAt: null } }),
    ]);

    return { data, total };
  }

  async addDocument(
    id: string,
    branchId: string,
    label: string,
    fileUrl: string,
    fileType: string,
    uploadedById: string,
  ) {
    await this.findOne(id, branchId);
    return this.prisma.employeeDocument.create({
      data: { employeeId: id, label, fileUrl, fileType, uploadedById },
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

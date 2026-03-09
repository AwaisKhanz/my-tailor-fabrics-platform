import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from './dto/create-employee.dto';
import { SearchService } from '../search/search.service';
import { LedgerService } from '../ledger/ledger.service';
import * as bcrypt from 'bcrypt';
import { Role, Prisma, EmployeeStatus, PaymentType } from '@prisma/client';
import { normalizeEmailAddress } from '../common/utils/email.util';
import {
  buildPaginationMeta,
  normalizePagination,
  toPaginatedResponse,
} from '../common/utils/pagination.util';
import {
  applyCompensationChange,
  getEffectiveCompensationAt,
  shiftDateByDays,
} from './employee-compensation-window';
import type {
  CompensationChangeInput,
  EmployeeCapability,
  EmployeeCapabilitySnapshot,
  EmployeeCapabilityWindowInput,
  EmployeeCompensationHistoryEntry,
  EligibleEmployeeResult,
} from '@tbms/shared-types';
import {
  EmployeeStatus as SharedEmployeeStatus,
  TaskStatus,
  PaymentType as SharedPaymentType,
} from '@tbms/shared-types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const MIN_SEARCH_QUERY_LENGTH = 2;
const MAX_EMPLOYEE_CODE_GENERATION_ATTEMPTS = 5;
const CAPABILITY_MATCH_SCORES = {
  EXACT: 1,
  GARMENT: 2,
  STEP: 3,
} as const;

type CapabilityMatchType = EligibleEmployeeResult['matchType'];

@Injectable()
export class EmployeesService {
  constructor(
    private prisma: PrismaService,
    private searchService: SearchService,
    private ledgerService: LedgerService,
  ) {}

  private normalizePagination(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
    return normalizePagination({
      page,
      limit,
      defaultPage: DEFAULT_PAGE,
      defaultLimit: DEFAULT_LIMIT,
      maxLimit: MAX_LIMIT,
    });
  }

  private parseOptionalDate(value?: string): Date | null | undefined {
    if (value === undefined) return undefined;
    if (!value) return null;
    return new Date(value);
  }

  private parseRequiredDate(value: string, fieldName: string): Date {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`Invalid ${fieldName} date`);
    }
    return parsed;
  }

  private parseEmployeeCodeSuffix(employeeCode: string): number | null {
    const lastSeparatorIndex = employeeCode.lastIndexOf('-');
    if (lastSeparatorIndex < 0) {
      return null;
    }

    const suffix = employeeCode.slice(lastSeparatorIndex + 1);
    if (!/^\d+$/.test(suffix)) {
      return null;
    }

    const parsed = Number.parseInt(suffix, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private isEmployeeCodeUniqueConstraintError(error: unknown): boolean {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
      return false;
    }

    if (error.code !== 'P2002') {
      return false;
    }

    const target = error.meta?.target;
    if (Array.isArray(target)) {
      return target.some((value) => value === 'employeeCode');
    }

    if (typeof target === 'string') {
      return target.includes('employeeCode');
    }

    return false;
  }

  private ensureValidPayrollFields(params: {
    paymentType: PaymentType;
    monthlySalary: number | null;
    status: EmployeeStatus;
    employmentEndDate: Date | null;
    dateOfJoining: Date;
  }) {
    if (
      params.paymentType === PaymentType.MONTHLY_FIXED &&
      (!params.monthlySalary || params.monthlySalary <= 0)
    ) {
      throw new BadRequestException(
        'monthlySalary is required for monthly payroll employees',
      );
    }

    if (
      params.employmentEndDate &&
      params.employmentEndDate < params.dateOfJoining
    ) {
      throw new BadRequestException(
        'employmentEndDate cannot be before dateOfJoining',
      );
    }

    if (params.paymentType === PaymentType.PER_PIECE) {
      return {
        monthlySalary: null,
        employmentEndDate:
          params.status === EmployeeStatus.LEFT
            ? params.employmentEndDate
            : null,
      };
    }

    return {
      monthlySalary: params.monthlySalary,
      employmentEndDate: params.employmentEndDate,
    };
  }

  private toSharedPaymentType(value: PaymentType): SharedPaymentType {
    return value === PaymentType.MONTHLY_FIXED
      ? SharedPaymentType.MONTHLY_FIXED
      : SharedPaymentType.PER_PIECE;
  }

  private toPrismaPaymentType(value: SharedPaymentType): PaymentType {
    return value === SharedPaymentType.MONTHLY_FIXED
      ? PaymentType.MONTHLY_FIXED
      : PaymentType.PER_PIECE;
  }

  private toSharedEmployeeStatus(value: EmployeeStatus): SharedEmployeeStatus {
    if (value === EmployeeStatus.INACTIVE) {
      return SharedEmployeeStatus.INACTIVE;
    }

    if (value === EmployeeStatus.LEFT) {
      return SharedEmployeeStatus.LEFT;
    }

    return SharedEmployeeStatus.ACTIVE;
  }

  private toPrismaEmployeeStatus(value: SharedEmployeeStatus): EmployeeStatus {
    if (value === SharedEmployeeStatus.INACTIVE) {
      return EmployeeStatus.INACTIVE;
    }

    if (value === SharedEmployeeStatus.LEFT) {
      return EmployeeStatus.LEFT;
    }

    return EmployeeStatus.ACTIVE;
  }

  private normalizeStepKey(stepKey?: string | null): string | null {
    if (!stepKey) {
      return null;
    }
    const normalized = stepKey.trim().toUpperCase();
    return normalized.length > 0 ? normalized : null;
  }

  private capabilityIdentity(capability: {
    garmentTypeId?: string | null;
    stepKey?: string | null;
  }): string {
    return `${capability.garmentTypeId ?? '*'}::${capability.stepKey ?? '*'}`;
  }

  private normalizeCapabilityInput(capability: EmployeeCapabilityWindowInput): {
    garmentTypeId: string | null;
    stepKey: string | null;
    note?: string;
  } {
    const garmentTypeId = capability.garmentTypeId?.trim() || null;
    const stepKey = this.normalizeStepKey(capability.stepKey);
    const note = capability.note?.trim() || undefined;

    if (!garmentTypeId && !stepKey) {
      throw new BadRequestException(
        'Each capability must define at least garmentTypeId or stepKey',
      );
    }

    return {
      garmentTypeId,
      stepKey,
      note,
    };
  }

  private async validateCapabilityStepKeys(
    capabilities: Array<{
      garmentTypeId: string | null;
      stepKey: string | null;
    }>,
  ): Promise<void> {
    const scopedStepCapabilities = capabilities.filter(
      (capability): capability is { garmentTypeId: string; stepKey: string } =>
        Boolean(capability.garmentTypeId) && Boolean(capability.stepKey),
    );

    if (scopedStepCapabilities.length > 0) {
      const uniqueScopedPairs = new Map<
        string,
        { garmentTypeId: string; stepKey: string }
      >();
      for (const capability of scopedStepCapabilities) {
        uniqueScopedPairs.set(
          `${capability.garmentTypeId}::${capability.stepKey}`,
          capability,
        );
      }

      const scopedPairs = Array.from(uniqueScopedPairs.values());
      const matchedWorkflowSteps =
        await this.prisma.workflowStepTemplate.findMany({
          where: {
            deletedAt: null,
            OR: scopedPairs.map((pair) => ({
              garmentTypeId: pair.garmentTypeId,
              stepKey: pair.stepKey,
            })),
          },
          select: {
            garmentTypeId: true,
            stepKey: true,
          },
        });

      const matchedScopedSet = new Set(
        matchedWorkflowSteps.map(
          (workflowStep) =>
            `${workflowStep.garmentTypeId}::${workflowStep.stepKey}`,
        ),
      );

      for (const pair of scopedPairs) {
        if (!matchedScopedSet.has(`${pair.garmentTypeId}::${pair.stepKey}`)) {
          throw new BadRequestException(
            `Invalid stepKey "${pair.stepKey}" for garmentTypeId "${pair.garmentTypeId}"`,
          );
        }
      }
    }

    const stepOnlyKeys = Array.from(
      new Set(
        capabilities
          .filter(
            (
              capability,
            ): capability is { garmentTypeId: null; stepKey: string } =>
              !capability.garmentTypeId && Boolean(capability.stepKey),
          )
          .map((capability) => capability.stepKey),
      ),
    );

    if (stepOnlyKeys.length === 0) {
      return;
    }

    const matchedStepOnlyKeys = await this.prisma.workflowStepTemplate.findMany(
      {
        where: {
          deletedAt: null,
          stepKey: { in: stepOnlyKeys },
        },
        select: { stepKey: true },
        distinct: ['stepKey'],
      },
    );

    const matchedStepOnlySet = new Set(
      matchedStepOnlyKeys.map((workflowStep) => workflowStep.stepKey),
    );

    for (const stepKey of stepOnlyKeys) {
      if (!matchedStepOnlySet.has(stepKey)) {
        throw new BadRequestException(
          `Invalid stepKey "${stepKey}". It does not exist in workflow templates.`,
        );
      }
    }
  }

  private resolveCapabilityMatchType(
    capability: { garmentTypeId: string | null; stepKey: string | null },
    garmentTypeId: string,
    stepKey: string | null,
  ): CapabilityMatchType | null {
    if (stepKey) {
      if (
        capability.garmentTypeId === garmentTypeId &&
        capability.stepKey === stepKey
      ) {
        return 'EXACT';
      }
      if (
        capability.garmentTypeId === garmentTypeId &&
        capability.stepKey === null
      ) {
        return 'GARMENT';
      }
      if (capability.garmentTypeId === null && capability.stepKey === stepKey) {
        return 'STEP';
      }
      return null;
    }

    if (capability.garmentTypeId === garmentTypeId) {
      return 'GARMENT';
    }

    return null;
  }

  private pickBestCapabilityMatch(
    capabilities: Array<{
      garmentTypeId: string | null;
      stepKey: string | null;
    }>,
    garmentTypeId: string,
    stepKey: string | null,
  ): CapabilityMatchType | null {
    let bestMatch: CapabilityMatchType | null = null;
    let bestScore = Number.POSITIVE_INFINITY;

    for (const capability of capabilities) {
      const matchType = this.resolveCapabilityMatchType(
        capability,
        garmentTypeId,
        stepKey,
      );
      if (!matchType) {
        continue;
      }

      const score = CAPABILITY_MATCH_SCORES[matchType];
      if (score < bestScore) {
        bestScore = score;
        bestMatch = matchType;
      }
    }

    return bestMatch;
  }

  private buildCapabilityWhere(
    garmentTypeId: string,
    stepKey: string | null,
    asOf: Date,
  ): Prisma.EmployeeCapabilityWhereInput {
    const activeWindowWhere: Prisma.EmployeeCapabilityWhereInput = {
      deletedAt: null,
      effectiveFrom: { lte: asOf },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: asOf } }],
    };

    if (stepKey) {
      return {
        deletedAt: null,
        effectiveFrom: { lte: asOf },
        AND: [
          {
            OR: [{ effectiveTo: null }, { effectiveTo: { gte: asOf } }],
          },
          {
            OR: [
              { garmentTypeId, stepKey },
              { garmentTypeId, stepKey: null },
              { garmentTypeId: null, stepKey },
            ],
          },
        ],
      };
    }

    return {
      ...activeWindowWhere,
      garmentTypeId,
    };
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
      const previousCodeNumber = this.parseEmployeeCodeSuffix(
        lastEmployee.employeeCode,
      );
      if (previousCodeNumber !== null) {
        nextNumber = previousCodeNumber + 1;
      }
    }

    const paddedNumber = String(nextNumber).padStart(4, '0');
    return `${prefix}${paddedNumber}`;
  }

  async create(createEmployeeDto: CreateEmployeeDto, branchId: string) {
    const dateOfJoining =
      this.parseOptionalDate(createEmployeeDto.dateOfJoining) ?? new Date();
    const paymentType =
      createEmployeeDto.paymentType !== undefined
        ? this.toPrismaPaymentType(createEmployeeDto.paymentType)
        : PaymentType.PER_PIECE;
    const status = EmployeeStatus.ACTIVE;
    const normalizedEmploymentEndDate =
      this.parseOptionalDate(createEmployeeDto.employmentEndDate) ?? null;
    const normalizedMonthlySalary = createEmployeeDto.monthlySalary ?? null;

    const payrollFields = this.ensureValidPayrollFields({
      paymentType,
      monthlySalary: normalizedMonthlySalary,
      status,
      employmentEndDate: normalizedEmploymentEndDate,
      dateOfJoining,
    });

    for (
      let attempt = 1;
      attempt <= MAX_EMPLOYEE_CODE_GENERATION_ATTEMPTS;
      attempt += 1
    ) {
      const employeeCode = await this.generateEmployeeCode(branchId);

      try {
        return await this.prisma.$transaction(async (tx) => {
          const createdEmployee = await tx.employee.create({
            data: {
              fullName: createEmployeeDto.fullName,
              phone: createEmployeeDto.phone,
              fatherName: createEmployeeDto.fatherName,
              phone2: createEmployeeDto.phone2,
              address: createEmployeeDto.address,
              city: createEmployeeDto.city,
              cnic: createEmployeeDto.cnic,
              dateOfBirth: this.parseOptionalDate(
                createEmployeeDto.dateOfBirth,
              ),
              dateOfJoining,
              designation: createEmployeeDto.designation,
              paymentType,
              monthlySalary: payrollFields.monthlySalary,
              accountNumber: createEmployeeDto.accountNumber,
              emergencyName: createEmployeeDto.emergencyName,
              emergencyPhone: createEmployeeDto.emergencyPhone,
              notes: createEmployeeDto.notes,
              employmentEndDate: payrollFields.employmentEndDate,
              employeeCode,
              branchId,
            },
          });

          await tx.employeeCompensationHistory.create({
            data: {
              employeeId: createdEmployee.id,
              paymentType,
              monthlySalary:
                paymentType === PaymentType.MONTHLY_FIXED
                  ? payrollFields.monthlySalary
                  : null,
              effectiveFrom: dateOfJoining,
              note: 'Initial compensation from employee profile',
            },
          });

          return createdEmployee;
        });
      } catch (error: unknown) {
        if (
          this.isEmployeeCodeUniqueConstraintError(error) &&
          attempt < MAX_EMPLOYEE_CODE_GENERATION_ATTEMPTS
        ) {
          continue;
        }

        if (this.isEmployeeCodeUniqueConstraintError(error)) {
          throw new ConflictException(
            'Could not generate a unique employee code. Please try again.',
          );
        }

        throw error;
      }
    }

    throw new ConflictException(
      'Could not generate a unique employee code. Please try again.',
    );
  }

  async findAll(
    branchId: string | null,
    page = 1,
    limit = 20,
    search?: string,
  ) {
    const {
      page: safePage,
      limit: safeLimit,
      skip,
    } = this.normalizePagination(page, limit);
    const query = search?.trim();

    if (query && query.length >= MIN_SEARCH_QUERY_LENGTH) {
      const results = await this.searchService.searchEmployees(
        query,
        branchId,
        safeLimit,
      );
      return {
        data: results,
        total: results.length,
        meta: buildPaginationMeta(results.length, {
          page: 1,
          limit: safeLimit,
        }),
      };
    }

    // Default to active employees in list view
    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        where: {
          deletedAt: null,
          status: EmployeeStatus.ACTIVE,
          ...(branchId ? { branchId } : {}),
        },
        skip,
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.employee.count({
        where: {
          deletedAt: null,
          status: EmployeeStatus.ACTIVE,
          ...(branchId ? { branchId } : {}),
        },
      }),
    ]);

    return toPaginatedResponse(data, total, {
      page: safePage,
      limit: safeLimit,
    });
  }

  async findOne(id: string, branchId: string | null) {
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
        capabilities: {
          where: { deletedAt: null },
          orderBy: [{ effectiveFrom: 'desc' }, { createdAt: 'desc' }],
        },
        compensationHistory: {
          orderBy: [{ effectiveFrom: 'desc' }, { createdAt: 'desc' }],
        },
      },
    });

    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async getCapabilities(
    id: string,
    branchId: string,
    options?: {
      activeOnly?: boolean;
      asOf?: string;
    },
  ): Promise<EmployeeCapability[]> {
    await this.findOne(id, branchId);

    const asOf = options?.asOf
      ? this.parseRequiredDate(options.asOf, 'asOf')
      : new Date();

    const capabilities = await this.prisma.employeeCapability.findMany({
      where: {
        employeeId: id,
        deletedAt: null,
        ...(options?.activeOnly
          ? {
              effectiveFrom: { lte: asOf },
              OR: [{ effectiveTo: null }, { effectiveTo: { gte: asOf } }],
            }
          : {}),
      },
      orderBy: [{ effectiveFrom: 'desc' }, { createdAt: 'desc' }],
    });

    return capabilities.map((capability) => ({
      id: capability.id,
      employeeId: capability.employeeId,
      garmentTypeId: capability.garmentTypeId,
      stepKey: capability.stepKey,
      effectiveFrom: capability.effectiveFrom.toISOString(),
      effectiveTo: capability.effectiveTo?.toISOString() ?? null,
      note: capability.note,
      createdById: capability.createdById,
      createdAt: capability.createdAt.toISOString(),
      deletedAt: capability.deletedAt?.toISOString() ?? null,
    }));
  }

  async replaceCapabilitiesSnapshot(
    id: string,
    branchId: string,
    snapshot: EmployeeCapabilitySnapshot,
    createdById: string,
  ): Promise<EmployeeCapability[]> {
    await this.findOne(id, branchId);

    const effectiveFrom = this.parseRequiredDate(
      snapshot.effectiveFrom,
      'effectiveFrom',
    );
    const normalizedCapabilities = snapshot.capabilities.map((capability) =>
      this.normalizeCapabilityInput(capability),
    );

    const uniqueCapabilityMap = new Map<
      string,
      {
        garmentTypeId: string | null;
        stepKey: string | null;
        note?: string;
      }
    >();
    for (const capability of normalizedCapabilities) {
      uniqueCapabilityMap.set(this.capabilityIdentity(capability), capability);
    }

    const uniqueCapabilities = Array.from(uniqueCapabilityMap.values());
    const garmentTypeIds = uniqueCapabilities
      .map((capability) => capability.garmentTypeId)
      .filter((garmentTypeId): garmentTypeId is string =>
        Boolean(garmentTypeId),
      );

    if (garmentTypeIds.length > 0) {
      const garmentsCount = await this.prisma.garmentType.count({
        where: {
          id: { in: garmentTypeIds },
          deletedAt: null,
          isActive: true,
        },
      });

      if (garmentsCount !== garmentTypeIds.length) {
        throw new BadRequestException('One or more garmentTypeIds are invalid');
      }
    }

    await this.validateCapabilityStepKeys(uniqueCapabilities);

    return this.prisma.$transaction(async (tx) => {
      await tx.employeeCapability.updateMany({
        where: {
          employeeId: id,
          deletedAt: null,
          effectiveFrom: { lte: effectiveFrom },
          OR: [{ effectiveTo: null }, { effectiveTo: { gte: effectiveFrom } }],
        },
        data: {
          effectiveTo: shiftDateByDays(effectiveFrom, -1),
        },
      });

      const createdCapabilities: EmployeeCapability[] = [];
      for (const capability of uniqueCapabilities) {
        const nextWindow = await tx.employeeCapability.findFirst({
          where: {
            employeeId: id,
            deletedAt: null,
            garmentTypeId: capability.garmentTypeId,
            stepKey: capability.stepKey,
            effectiveFrom: { gt: effectiveFrom },
          },
          orderBy: { effectiveFrom: 'asc' },
          select: { effectiveFrom: true },
        });

        const createdCapability = await tx.employeeCapability.create({
          data: {
            employeeId: id,
            garmentTypeId: capability.garmentTypeId,
            stepKey: capability.stepKey,
            effectiveFrom,
            effectiveTo: nextWindow
              ? shiftDateByDays(nextWindow.effectiveFrom, -1)
              : null,
            note: capability.note ?? snapshot.note?.trim() ?? null,
            createdById,
          },
        });

        createdCapabilities.push({
          id: createdCapability.id,
          employeeId: createdCapability.employeeId,
          garmentTypeId: createdCapability.garmentTypeId,
          stepKey: createdCapability.stepKey,
          effectiveFrom: createdCapability.effectiveFrom.toISOString(),
          effectiveTo: createdCapability.effectiveTo?.toISOString() ?? null,
          note: createdCapability.note,
          createdById: createdCapability.createdById,
          createdAt: createdCapability.createdAt.toISOString(),
          deletedAt: createdCapability.deletedAt?.toISOString() ?? null,
        });
      }

      return createdCapabilities;
    });
  }

  async getEligibleEmployees(params: {
    branchId: string;
    garmentTypeId: string;
    stepKey?: string;
    asOf?: string;
  }): Promise<EligibleEmployeeResult[]> {
    const garmentTypeId = params.garmentTypeId.trim();
    if (!garmentTypeId) {
      throw new BadRequestException('garmentTypeId is required');
    }

    const asOf = params.asOf
      ? this.parseRequiredDate(params.asOf, 'asOf')
      : new Date();
    const normalizedStepKey = this.normalizeStepKey(params.stepKey);
    const capabilityWhere = this.buildCapabilityWhere(
      garmentTypeId,
      normalizedStepKey,
      asOf,
    );

    const employees = await this.prisma.employee.findMany({
      where: {
        branchId: params.branchId,
        status: EmployeeStatus.ACTIVE,
        deletedAt: null,
        capabilities: {
          some: capabilityWhere,
        },
      },
      select: {
        id: true,
        branchId: true,
        employeeCode: true,
        fullName: true,
        phone: true,
        phone2: true,
        address: true,
        city: true,
        designation: true,
        status: true,
        paymentType: true,
        monthlySalary: true,
        dateOfJoining: true,
        employmentEndDate: true,
        dateOfBirth: true,
        emergencyName: true,
        emergencyPhone: true,
        createdAt: true,
        updatedAt: true,
        compensationHistory: {
          where: {
            effectiveFrom: { lte: asOf },
            OR: [{ effectiveTo: null }, { effectiveTo: { gte: asOf } }],
          },
          orderBy: { effectiveFrom: 'desc' },
          take: 1,
          select: {
            paymentType: true,
            monthlySalary: true,
          },
        },
        capabilities: {
          where: capabilityWhere,
          select: {
            garmentTypeId: true,
            stepKey: true,
          },
        },
      },
      orderBy: [{ fullName: 'asc' }, { employeeCode: 'asc' }],
    });

    const eligibleEmployees: EligibleEmployeeResult[] = [];
    for (const employee of employees) {
      const effectiveCompensation = employee.compensationHistory[0];
      const paymentType =
        effectiveCompensation?.paymentType ?? employee.paymentType;

      if (paymentType !== PaymentType.PER_PIECE) {
        continue;
      }

      const bestMatchType = this.pickBestCapabilityMatch(
        employee.capabilities.map((capability) => ({
          garmentTypeId: capability.garmentTypeId,
          stepKey: capability.stepKey,
        })),
        garmentTypeId,
        normalizedStepKey,
      );

      if (!bestMatchType) {
        continue;
      }

      eligibleEmployees.push({
        employee: {
          id: employee.id,
          branchId: employee.branchId,
          employeeCode: employee.employeeCode,
          fullName: employee.fullName,
          phone: employee.phone,
          phone2: employee.phone2,
          address: employee.address,
          city: employee.city,
          designation: employee.designation,
          status: this.toSharedEmployeeStatus(employee.status),
          paymentType: this.toSharedPaymentType(paymentType),
          monthlySalary: null,
          dateOfJoining: employee.dateOfJoining.toISOString(),
          employmentEndDate: employee.employmentEndDate?.toISOString() ?? null,
          dateOfBirth: employee.dateOfBirth?.toISOString() ?? null,
          emergencyName: employee.emergencyName,
          emergencyPhone: employee.emergencyPhone,
          createdAt: employee.createdAt.toISOString(),
          updatedAt: employee.updatedAt.toISOString(),
        },
        matchType: bestMatchType,
        score: CAPABILITY_MATCH_SCORES[bestMatchType],
      });
    }

    return eligibleEmployees.sort((left, right) => {
      if (left.score !== right.score) {
        return left.score - right.score;
      }

      return left.employee.fullName.localeCompare(right.employee.fullName);
    });
  }

  async assertEmployeeEligibleForAssignment(params: {
    employeeId: string;
    branchId: string;
    garmentTypeId: string;
    stepKey?: string;
    asOf?: Date;
  }): Promise<void> {
    const eligibleEmployees = await this.getEligibleEmployees({
      branchId: params.branchId,
      garmentTypeId: params.garmentTypeId,
      stepKey: params.stepKey,
      asOf: params.asOf?.toISOString(),
    });

    if (eligibleEmployees.length === 0) {
      throw new BadRequestException(
        'No eligible per-piece employees found for the selected garment/step',
      );
    }

    const isEligible = eligibleEmployees.some(
      (entry) => entry.employee.id === params.employeeId,
    );
    if (!isEligible) {
      throw new BadRequestException(
        'Selected employee is not eligible for the selected garment/step',
      );
    }
  }

  async getCompensationHistory(
    id: string,
    branchId: string,
  ): Promise<EmployeeCompensationHistoryEntry[]> {
    await this.findOne(id, branchId);

    const history = await this.prisma.employeeCompensationHistory.findMany({
      where: { employeeId: id },
      orderBy: [{ effectiveFrom: 'desc' }, { createdAt: 'desc' }],
    });

    return history.map((entry) => ({
      id: entry.id,
      employeeId: entry.employeeId,
      paymentType: this.toSharedPaymentType(entry.paymentType),
      monthlySalary: entry.monthlySalary,
      effectiveFrom: entry.effectiveFrom.toISOString(),
      effectiveTo: entry.effectiveTo?.toISOString() ?? null,
      note: entry.note,
      changedById: entry.changedById,
      createdAt: entry.createdAt.toISOString(),
    }));
  }

  async createCompensationChange(
    id: string,
    branchId: string,
      change: CompensationChangeInput,
      changedById: string,
  ): Promise<EmployeeCompensationHistoryEntry> {
    const employee = await this.findOne(id, branchId);
    const effectiveFrom = this.parseRequiredDate(
      change.effectiveFrom,
      'effectiveFrom',
    );

    const created = await this.prisma.$transaction(async (tx) => {
      const createdChange = await applyCompensationChange(tx, {
        employeeId: id,
        changedById,
        change: {
          paymentType: this.toPrismaPaymentType(change.paymentType),
          monthlySalary: change.monthlySalary,
          effectiveFrom: effectiveFrom.toISOString(),
          note: change.note,
        },
      });

      if (employee.status === EmployeeStatus.LEFT) {
        await tx.employee.update({
          where: { id },
          data: {
            employmentEndDate: employee.employmentEndDate ?? new Date(),
          },
        });
      }

      return createdChange;
    });

    return {
      id: created.id,
      employeeId: id,
      paymentType: this.toSharedPaymentType(created.paymentType),
      monthlySalary: created.monthlySalary,
      effectiveFrom: created.effectiveFrom.toISOString(),
      effectiveTo: created.effectiveTo?.toISOString() ?? null,
      note: created.note,
      changedById,
      createdAt: created.createdAt.toISOString(),
    };
  }

  async update(
    id: string,
    branchId: string,
    updateEmployeeDto: UpdateEmployeeDto,
    updatedById?: string,
  ) {
    const existingEmployee = await this.findOne(id, branchId);
    const dateOfJoining =
      updateEmployeeDto.dateOfJoining !== undefined
        ? new Date(updateEmployeeDto.dateOfJoining)
        : existingEmployee.dateOfJoining;
    const status =
      updateEmployeeDto.status !== undefined
        ? this.toPrismaEmployeeStatus(updateEmployeeDto.status)
        : existingEmployee.status;
    const employmentEndDate =
      updateEmployeeDto.employmentEndDate !== undefined
        ? (this.parseOptionalDate(updateEmployeeDto.employmentEndDate) ?? null)
        : existingEmployee.employmentEndDate;

    return this.prisma.$transaction(async (tx) => {
      const currentCompensation = (await getEffectiveCompensationAt(
        tx,
        id,
        new Date(),
      )) ?? {
        paymentType: existingEmployee.paymentType,
        monthlySalary: existingEmployee.monthlySalary,
      };

      const hasCompensationInput =
        updateEmployeeDto.paymentType !== undefined ||
        updateEmployeeDto.monthlySalary !== undefined ||
        updateEmployeeDto.compensationEffectiveFrom !== undefined;

      if (hasCompensationInput) {
        const desiredPaymentType =
          updateEmployeeDto.paymentType !== undefined
            ? this.toPrismaPaymentType(updateEmployeeDto.paymentType)
            : currentCompensation.paymentType;
        const desiredMonthlySalary =
          updateEmployeeDto.monthlySalary !== undefined
            ? updateEmployeeDto.monthlySalary
            : currentCompensation.monthlySalary;
        const compensationEffectiveFrom =
          this.parseOptionalDate(updateEmployeeDto.compensationEffectiveFrom) ??
          new Date();
        const snapshotChanged =
          desiredPaymentType !== currentCompensation.paymentType ||
          (desiredPaymentType === PaymentType.MONTHLY_FIXED
            ? (desiredMonthlySalary ?? null) !==
              (currentCompensation.monthlySalary ?? null)
            : currentCompensation.monthlySalary !== null);

        if (
          updateEmployeeDto.compensationEffectiveFrom !== undefined ||
          snapshotChanged
        ) {
          await applyCompensationChange(tx, {
            employeeId: id,
            change: {
              paymentType: desiredPaymentType,
              monthlySalary: desiredMonthlySalary ?? undefined,
              effectiveFrom: compensationEffectiveFrom.toISOString(),
            },
            changedById: updatedById,
          });
        }
      }

      const effectiveCompensation = (await getEffectiveCompensationAt(
        tx,
        id,
        new Date(),
      )) ?? {
        paymentType: existingEmployee.paymentType,
        monthlySalary: existingEmployee.monthlySalary,
      };

      const normalizedPayrollFields = this.ensureValidPayrollFields({
        paymentType: effectiveCompensation.paymentType,
        monthlySalary: effectiveCompensation.monthlySalary ?? null,
        status,
        employmentEndDate:
          status === EmployeeStatus.LEFT
            ? (employmentEndDate ?? new Date())
            : employmentEndDate,
        dateOfJoining,
      });

      const updatedEmployee = await tx.employee.update({
        where: { id },
        data: {
          fullName: updateEmployeeDto.fullName ?? existingEmployee.fullName,
          phone: updateEmployeeDto.phone ?? existingEmployee.phone,
          fatherName:
            updateEmployeeDto.fatherName ?? existingEmployee.fatherName,
          phone2: updateEmployeeDto.phone2 ?? existingEmployee.phone2,
          address: updateEmployeeDto.address ?? existingEmployee.address,
          city: updateEmployeeDto.city ?? existingEmployee.city,
          cnic: updateEmployeeDto.cnic ?? existingEmployee.cnic,
          designation:
            updateEmployeeDto.designation ?? existingEmployee.designation,
          accountNumber:
            updateEmployeeDto.accountNumber ?? existingEmployee.accountNumber,
          emergencyName:
            updateEmployeeDto.emergencyName ?? existingEmployee.emergencyName,
          emergencyPhone:
            updateEmployeeDto.emergencyPhone ?? existingEmployee.emergencyPhone,
          notes: updateEmployeeDto.notes ?? existingEmployee.notes,
          status,
          dateOfBirth:
            updateEmployeeDto.dateOfBirth !== undefined
              ? this.parseOptionalDate(updateEmployeeDto.dateOfBirth)
              : existingEmployee.dateOfBirth,
          dateOfJoining,
          paymentType: effectiveCompensation.paymentType,
          monthlySalary: normalizedPayrollFields.monthlySalary,
          employmentEndDate:
            status === EmployeeStatus.LEFT
              ? (normalizedPayrollFields.employmentEndDate ?? new Date())
              : normalizedPayrollFields.employmentEndDate,
        },
      });

      if (status !== EmployeeStatus.ACTIVE) {
        await tx.user.updateMany({
          where: { employeeId: id, deletedAt: null },
          data: {
            isActive: false,
            refreshToken: null,
            previousRefreshToken: null,
            previousRefreshTokenExpiresAt: null,
          },
        });
      }

      return updatedEmployee;
    });
  }

  async remove(id: string, branchId: string) {
    await this.findOne(id, branchId);

    const openAssignedTasks = await this.prisma.orderItemTask.count({
      where: {
        assignedEmployeeId: id,
        deletedAt: null,
        status: { in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS] },
        orderItem: {
          order: {
            branchId,
            deletedAt: null,
          },
          deletedAt: null,
        },
      },
    });

    if (openAssignedTasks > 0) {
      throw new BadRequestException(
        `Cannot archive employee with ${openAssignedTasks} open assigned task(s). Reassign or unassign tasks first.`,
      );
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const deletedAt = new Date();

      await tx.user.updateMany({
        where: { employeeId: id, deletedAt: null },
        data: {
          isActive: false,
          refreshToken: null,
          previousRefreshToken: null,
          previousRefreshTokenExpiresAt: null,
        },
      });

      return tx.employee.update({
        where: { id },
        data: {
          deletedAt,
          status: EmployeeStatus.LEFT,
          employmentEndDate: deletedAt,
        },
      });
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
    const normalizedEmail = normalizeEmailAddress(email);

    // Check if email taken
    const existing = await this.prisma.user.findFirst({
      where: {
        email: { equals: normalizedEmail, mode: 'insensitive' },
      },
      select: { id: true, deletedAt: true },
    });
    if (existing) {
      if (existing.deletedAt) {
        throw new ConflictException(
          'A user with this email existed and was deleted. Contact support.',
        );
      }
      throw new ConflictException('Email already in use');
    }

    if (employee.userAccount)
      throw new ConflictException('Employee already has a user account linked');

    // Run in transaction to guarantee consistency
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const passwordHash = await bcrypt.hash(rawPass, 12);

      const user = await tx.user.create({
        data: {
          name: employee.fullName,
          email: normalizedEmail,
          passwordHash,
          role: Role.EMPLOYEE,
          branchId: employee.branchId, // Use the employee's branch, not the requester's which could be null for Super Admin
          employeeId,
        },
      });

      return user;
    });
  }

  async getStats(id: string, branchId: string | null) {
    await this.findOne(id, branchId);
    const summary = await this.ledgerService.getBalance(id, branchId);
    return {
      totalEarned: summary.totalEarned,
      totalPaid: summary.totalDeducted,
      balance: summary.currentBalance,
      currentBalance: summary.currentBalance,
    };
  }

  async getItems(id: string, branchId: string | null, page = 1, limit = 20) {
    await this.findOne(id, branchId);

    const {
      page: safePage,
      limit: safeLimit,
      skip,
    } = this.normalizePagination(page, limit);
    const [data, total] = await Promise.all([
      this.prisma.orderItem.findMany({
        where: {
          tasks: {
            some: {
              assignedEmployeeId: id,
              deletedAt: null,
            },
          },
          deletedAt: null,
          ...(branchId ? { order: { branchId } } : {}),
        },
        select: {
          id: true,
          orderId: true,
          garmentTypeName: true,
          quantity: true,
          unitPrice: true,
          status: true,
          completedAt: true,
          order: { select: { orderNumber: true, status: true, dueDate: true } },
        },
        skip,
        take: safeLimit,
        orderBy: { completedAt: 'desc' },
      }),
      this.prisma.orderItem.count({
        where: {
          tasks: {
            some: {
              assignedEmployeeId: id,
              deletedAt: null,
            },
          },
          deletedAt: null,
          ...(branchId ? { order: { branchId } } : {}),
        },
      }),
    ]);

    return toPaginatedResponse(data, total, {
      page: safePage,
      limit: safeLimit,
    });
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
  async getMyProfile(employeeId: string, branchId: string | null) {
    return this.findOne(employeeId, branchId);
  }

  async getMyStats(employeeId: string, branchId: string | null) {
    return this.getStats(employeeId, branchId);
  }

  async getMyItems(
    employeeId: string,
    branchId: string | null,
    page = 1,
    limit = 20,
  ) {
    return this.getItems(employeeId, branchId, page, limit);
  }
}

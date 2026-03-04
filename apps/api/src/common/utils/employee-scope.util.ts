import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EmployeeStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type EmployeeScopeClient = PrismaService | Prisma.TransactionClient;

type EmployeeScopeOptions = {
  employeeId: string;
  branchId?: string | null;
  requireActive?: boolean;
  notFoundMessage?: string;
  wrongBranchMessage?: string;
  inactiveMessage?: string;
  inactiveViolation?: 'bad_request' | 'forbidden';
};

type ScopedEmployee = {
  id: string;
  branchId: string;
  status: EmployeeStatus;
};

export async function requireEmployeeInScope(
  client: EmployeeScopeClient,
  {
    employeeId,
    branchId,
    requireActive = false,
    notFoundMessage = 'Employee not found',
    wrongBranchMessage = 'Employee does not belong to the selected branch',
    inactiveMessage = 'Only active employees are allowed for this action',
    inactiveViolation = 'bad_request',
  }: EmployeeScopeOptions,
): Promise<ScopedEmployee> {
  const employee = await client.employee.findFirst({
    where: {
      id: employeeId,
      deletedAt: null,
    },
    select: {
      id: true,
      branchId: true,
      status: true,
    },
  });

  if (!employee) {
    throw new NotFoundException(notFoundMessage);
  }

  if (branchId && employee.branchId !== branchId) {
    throw new ForbiddenException(wrongBranchMessage);
  }

  if (requireActive && employee.status !== EmployeeStatus.ACTIVE) {
    if (inactiveViolation === 'forbidden') {
      throw new ForbiddenException(inactiveMessage);
    }
    throw new BadRequestException(inactiveMessage);
  }

  return employee;
}

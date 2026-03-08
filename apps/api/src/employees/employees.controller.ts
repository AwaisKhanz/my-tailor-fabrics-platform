import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import {
  AddEmployeeDocumentDto,
  CreateEmployeeDto,
  CreateEmployeeUserAccountDto,
  UpdateEmployeeDto,
} from './dto/create-employee.dto';
import {
  CompensationChangeDto,
  EligibleEmployeesQueryDto,
  EmployeeCapabilitiesQueryDto,
  UpdateEmployeeCapabilitiesDto,
} from './dto/workforce-governance.dto';
import { Roles } from '../common/decorators/auth.decorators';
import {
  RequireAnyPermissions,
  RequirePermissions,
} from '../common/decorators/permissions.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { requireBranchScope } from '../common/utils/branch-scope.util';
import { success } from '../common/utils/response.util';
import {
  ADMIN_ROLES,
  EMPLOYEE_SELF_ROLES,
  OPERATOR_ROLES,
  PERMISSION,
} from '@tbms/shared-constants';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['employees.manage'])
  @Post()
  async create(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.employeesService.create(
      createEmployeeDto,
      requireBranchScope(req),
    );
    return success(data);
  }

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['employees.read'])
  @Get()
  async findAll(
    @Query() query: PaginationQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.employeesService.findAll(
      req.branchId,
      query.page ?? 1,
      query.limit ?? 20,
      query.search,
    );
    return success(data);
  }

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['employees.read'])
  @Get('eligible')
  async getEligibleEmployees(
    @Query() query: EligibleEmployeesQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.employeesService.getEligibleEmployees({
      branchId: requireBranchScope(req),
      garmentTypeId: query.garmentTypeId,
      stepKey: query.stepKey,
      asOf: query.asOf,
    });
    return success(data);
  }

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['employees.read'])
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const data = await this.employeesService.findOne(id, req.branchId);
    return success(data);
  }

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['employees.read'])
  @Get(':id/capabilities')
  async getCapabilities(
    @Param('id') id: string,
    @Query() query: EmployeeCapabilitiesQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.employeesService.getCapabilities(
      id,
      req.branchId ?? requireBranchScope(req),
      {
        activeOnly: query.activeOnly,
        asOf: query.asOf,
      },
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['employees.manage'])
  @Put(':id/capabilities')
  async replaceCapabilities(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeCapabilitiesDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.employeesService.replaceCapabilitiesSnapshot(
      id,
      requireBranchScope(req),
      dto,
      req.user.userId,
    );
    return success(data);
  }

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['employees.read'])
  @Get(':id/compensation')
  async getCompensationHistory(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.employeesService.getCompensationHistory(
      id,
      req.branchId ?? requireBranchScope(req),
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['employees.manage'])
  @Post(':id/compensation')
  async createCompensationChange(
    @Param('id') id: string,
    @Body() dto: CompensationChangeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.employeesService.createCompensationChange(
      id,
      requireBranchScope(req),
      dto,
      req.user.userId,
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['employees.manage'])
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.employeesService.update(
      id,
      requireBranchScope(req),
      updateEmployeeDto,
      req.user.userId,
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['employees.manage'])
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const data = await this.employeesService.remove(
      id,
      requireBranchScope(req),
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['employees.manage'])
  @Post(':id/user-account')
  async createUserAccount(
    @Param('id') id: string,
    @Body() dto: CreateEmployeeUserAccountDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.employeesService.createUserAccount(
      id,
      requireBranchScope(req),
      dto.email,
      dto.password,
    );
    const result = { id: data.id, email: data.email };
    return success(result);
  }

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['employees.read'])
  @Get(':id/stats')
  async getStats(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const data = await this.employeesService.getStats(id, req.branchId);
    return success(data);
  }

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['employees.read'])
  @Get(':id/items')
  async getItems(
    @Param('id') id: string,
    @Query() pagination: PaginationQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.employeesService.getItems(
      id,
      req.branchId,
      pagination.page ?? 1,
      pagination.limit ?? 20,
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['employees.manage'])
  @Post(':id/documents')
  async addDocument(
    @Param('id') id: string,
    @Body() dto: AddEmployeeDocumentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.employeesService.addDocument(
      id,
      requireBranchScope(req),
      dto.label,
      dto.fileUrl,
      dto.fileType,
      req.user.userId,
    );
    return success(data);
  }

  // Employee Portal Endpoints
  @Roles(...EMPLOYEE_SELF_ROLES)
  @RequireAnyPermissions(PERMISSION['employees.read'], PERMISSION['tasks.read'])
  @Get('my/profile')
  async getMyProfile(@Req() req: AuthenticatedRequest) {
    const data = await this.employeesService.getMyProfile(
      req.user.employeeId!,
      req.branchId,
    );
    return success(data);
  }

  @Roles(...EMPLOYEE_SELF_ROLES)
  @RequireAnyPermissions(PERMISSION['employees.read'], PERMISSION['tasks.read'])
  @Get('my/stats')
  async getMyStats(@Req() req: AuthenticatedRequest) {
    const data = await this.employeesService.getMyStats(
      req.user.employeeId!,
      req.branchId,
    );
    return success(data);
  }

  @Roles(...EMPLOYEE_SELF_ROLES)
  @RequireAnyPermissions(PERMISSION['employees.read'], PERMISSION['tasks.read'])
  @Get('my/items')
  async getMyItems(
    @Query() pagination: PaginationQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.employeesService.getMyItems(
      req.user.employeeId!,
      req.branchId,
      pagination.page ?? 1,
      pagination.limit ?? 20,
    );
    return success(data);
  }
}

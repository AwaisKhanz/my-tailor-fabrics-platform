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
  UseGuards,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import {
  AddEmployeeDocumentDto,
  CreateEmployeeDto,
  CreateEmployeeUserAccountDto,
  UpdateEmployeeDto,
} from './dto/create-employee.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BranchGuard } from '../common/guards/branch.guard';
import { Roles } from '../common/decorators/auth.decorators';
import { requireBranchScope } from '../common/utils/branch-scope.util';
import {
  ADMIN_ROLES,
  EMPLOYEE_SELF_ROLES,
  OPERATOR_ROLES,
} from '@tbms/shared-constants';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Roles(...ADMIN_ROLES)
  @Post()
  async create(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.employeesService.create(
      createEmployeeDto,
      requireBranchScope(req),
    );
    return { success: true, data };
  }

  @Roles(...OPERATOR_ROLES)
  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.employeesService.findAll(
      req.branchId,
      Number(page) || 1,
      Number(limit) || 20,
      search,
    );
    return { success: true, data };
  }

  @Roles(...OPERATOR_ROLES)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const data = await this.employeesService.findOne(id, req.branchId);
    return { success: true, data };
  }

  @Roles(...ADMIN_ROLES)
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
    );
    return { success: true, data };
  }

  @Roles(...ADMIN_ROLES)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const data = await this.employeesService.remove(
      id,
      requireBranchScope(req),
    );
    return { success: true, data };
  }

  @Roles(...ADMIN_ROLES)
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
    return { success: true, data: result, user: result };
  }

  @Roles(...OPERATOR_ROLES)
  @Get(':id/stats')
  async getStats(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const data = await this.employeesService.getStats(id, req.branchId);
    return { success: true, data };
  }

  @Roles(...OPERATOR_ROLES)
  @Get(':id/items')
  async getItems(
    @Param('id') id: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.employeesService.getItems(
      id,
      req.branchId,
      Number(page) || 1,
      Number(limit) || 20,
    );
    return { success: true, data };
  }

  @Roles(...ADMIN_ROLES)
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
    return { success: true, data };
  }

  // Employee Portal Endpoints
  @Roles(...EMPLOYEE_SELF_ROLES)
  @Get('my/profile')
  async getMyProfile(@Req() req: AuthenticatedRequest) {
    const data = await this.employeesService.getMyProfile(
      req.user.employeeId!,
      req.branchId,
    );
    return { success: true, data };
  }

  @Roles(...EMPLOYEE_SELF_ROLES)
  @Get('my/stats')
  async getMyStats(@Req() req: AuthenticatedRequest) {
    const data = await this.employeesService.getMyStats(
      req.user.employeeId!,
      req.branchId,
    );
    return { success: true, data };
  }

  @Roles(...EMPLOYEE_SELF_ROLES)
  @Get('my/items')
  async getMyItems(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.employeesService.getMyItems(
      req.user.employeeId!,
      req.branchId,
      Number(page) || 1,
      Number(limit) || 20,
    );
    return { success: true, data };
  }
}

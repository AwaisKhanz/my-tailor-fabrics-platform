import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from './dto/create-employee.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BranchGuard } from '../common/guards/branch.guard';
import { Roles } from '../common/decorators/auth.decorators';
import { Role } from '@tbms/shared-types';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  async create(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.employeesService.create(
      createEmployeeDto,
      req.branchId,
    );
    return { success: true, data };
  }

  @Roles(Role.ENTRY_OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
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

  @Roles(Role.ENTRY_OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const data = await this.employeesService.findOne(id, req.branchId);
    return { success: true, data };
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.employeesService.update(
      id,
      req.branchId,
      updateEmployeeDto,
    );
    return { success: true, data };
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const data = await this.employeesService.remove(id, req.branchId);
    return { success: true, data };
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post(':id/user-account')
  async createUserAccount(
    @Param('id') id: string,
    @Body('email') email: string,
    @Body('password') rawPass: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.employeesService.createUserAccount(
      id,
      req.branchId,
      email,
      rawPass,
    );
    return { success: true, user: { id: data.id, email: data.email } };
  }

  @Roles(Role.ENTRY_OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @Get(':id/stats')
  async getStats(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const data = await this.employeesService.getStats(id, req.branchId);
    return { success: true, data };
  }

  @Roles(Role.ENTRY_OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
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

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post(':id/documents')
  async addDocument(
    @Param('id') id: string,
    @Body('label') label: string,
    @Body('fileUrl') fileUrl: string,
    @Body('fileType') fileType: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.employeesService.addDocument(
      id,
      req.branchId,
      label,
      fileUrl,
      fileType,
      req.user.userId,
    );
    return { success: true, data };
  }

  // Employee Portal Endpoints
  @Roles(Role.EMPLOYEE)
  @Get('my/profile')
  async getMyProfile(@Req() req: AuthenticatedRequest) {
    const data = await this.employeesService.getMyProfile(
      req.user.employeeId!,
      req.branchId,
    );
    return { success: true, data };
  }

  @Roles(Role.EMPLOYEE)
  @Get('my/stats')
  async getMyStats(@Req() req: AuthenticatedRequest) {
    const data = await this.employeesService.getMyStats(
      req.user.employeeId!,
      req.branchId,
    );
    return { success: true, data };
  }

  @Roles(Role.EMPLOYEE)
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

import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UseGuards, Put } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/create-customer.dto';
import { UpsertMeasurementDto } from './dto/upsert-measurement.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BranchGuard } from '../common/guards/branch.guard';
import { Roles } from '../common/decorators/auth.decorators';
import { Role } from '@tbms/shared-types';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Roles(Role.ENTRY_OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto, @Req() req: AuthenticatedRequest) {
    const data = await this.customersService.create(createCustomerDto, req.branchId);
    return { success: true, data };
  }

  @Roles(Role.ENTRY_OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @Query('isVip') isVip: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.customersService.findAll(
      req.branchId,
      Number(page) || 1,
      Number(limit) || 20,
      search,
      isVip === 'true' ? true : undefined,
    );
    return { success: true, data };
  }

  @Roles(Role.ENTRY_OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const data = await this.customersService.findOne(id, req.branchId);
    return { success: true, data };
  }

  @Roles(Role.ENTRY_OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto, @Req() req: AuthenticatedRequest) {
    const data = await this.customersService.update(id, req.branchId, updateCustomerDto);
    return { success: true, data };
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const data = await this.customersService.remove(id, req.branchId);
    return { success: true, data };
  }

  @Roles(Role.ENTRY_OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @Get(':id/orders')
  async getOrders(@Param('id') id: string, @Query('page') page: string, @Query('limit') limit: string, @Req() req: AuthenticatedRequest) {
     const data = await this.customersService.getOrders(id, req.branchId, Number(page) || 1, Number(limit) || 20);
     return { success: true, data };
  }

  @Roles(Role.ENTRY_OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @Post(':id/measurements')
  async upsertMeasurement(@Param('id') id: string, @Body() dto: UpsertMeasurementDto, @Req() req: AuthenticatedRequest) {
     const data = await this.customersService.upsertMeasurement(id, req.branchId, dto);
     return { success: true, data };
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.ENTRY_OPERATOR)
  @Patch(':id/vip')
  async toggleVip(@Param('id') id: string, @Body('isVip') isVip: boolean, @Req() req: AuthenticatedRequest) {
    const data = await this.customersService.toggleVip(id, req.branchId, isVip);
    return { success: true, data };
  }
}

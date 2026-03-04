import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
  Put,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import {
  CreateCustomerDto,
  ToggleVipDto,
  UpdateCustomerDto,
} from './dto/create-customer.dto';
import { UpsertMeasurementDto } from './dto/upsert-measurement.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BranchGuard } from '../common/guards/branch.guard';
import { Roles } from '../common/decorators/auth.decorators';
import { requireBranchScope } from '../common/utils/branch-scope.util';
import { CustomerStatus } from '@tbms/shared-types';
import { ADMIN_ROLES, OPERATOR_ROLES } from '@tbms/shared-constants';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  private parseStatus(
    value?: string,
  ): CustomerStatus | undefined {
    if (!value) {
      return undefined;
    }

    return Object.values(CustomerStatus).includes(value as CustomerStatus)
      ? (value as CustomerStatus)
      : undefined;
  }

  @Roles(...OPERATOR_ROLES)
  @Post()
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.customersService.create(
      createCustomerDto,
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
    @Query('isVip') isVip: string,
    @Query('status') status: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    const parsedStatus = this.parseStatus(status);
    const data = await this.customersService.findAll(
      req.branchId,
      Number(page) || 1,
      Number(limit) || 20,
      search,
      isVip === 'true' ? true : undefined,
      parsedStatus,
    );
    return { success: true, data };
  }

  @Roles(...OPERATOR_ROLES)
  @Get('summary')
  async getSummary(
    @Query('search') search: string,
    @Query('isVip') isVip: string,
    @Query('status') status: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    const vipFilter =
      isVip === 'true' ? true : isVip === 'false' ? false : undefined;
    const parsedStatus = this.parseStatus(status);

    const data = await this.customersService.getSummary(req.branchId, {
      search,
      isVip: vipFilter,
      status: parsedStatus,
    });
    return { success: true, data };
  }

  @Roles(...OPERATOR_ROLES)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const data = await this.customersService.findOne(id, req.branchId);
    return { success: true, data };
  }

  @Roles(...OPERATOR_ROLES)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.customersService.update(
      id,
      requireBranchScope(req),
      updateCustomerDto,
    );
    return { success: true, data };
  }

  @Roles(...ADMIN_ROLES)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const data = await this.customersService.remove(
      id,
      requireBranchScope(req),
    );
    return { success: true, data };
  }

  @Roles(...OPERATOR_ROLES)
  @Get(':id/orders')
  async getOrders(
    @Param('id') id: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.customersService.getOrders(
      id,
      req.branchId,
      Number(page) || 1,
      Number(limit) || 20,
    );
    return { success: true, data };
  }

  @Roles(...OPERATOR_ROLES)
  @Post(':id/measurements')
  async upsertMeasurement(
    @Param('id') id: string,
    @Body() dto: UpsertMeasurementDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.customersService.upsertMeasurement(
      id,
      requireBranchScope(req),
      dto,
    );
    return { success: true, data };
  }

  @Roles(...OPERATOR_ROLES)
  @Patch(':id/vip')
  async toggleVip(
    @Param('id') id: string,
    @Body() body: ToggleVipDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.customersService.toggleVip(
      id,
      requireBranchScope(req),
      body.isVip,
    );
    return { success: true, data };
  }
}

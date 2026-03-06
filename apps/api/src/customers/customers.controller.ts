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
  Put,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import {
  CreateCustomerDto,
  ToggleVipDto,
  UpdateCustomerDto,
} from './dto/create-customer.dto';
import { UpsertMeasurementDto } from './dto/upsert-measurement.dto';
import { Roles } from '../common/decorators/auth.decorators';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { requireBranchScope } from '../common/utils/branch-scope.util';
import { success } from '../common/utils/response.util';
import { CustomerStatus } from '@tbms/shared-types';
import { ADMIN_ROLES, OPERATOR_ROLES } from '@tbms/shared-constants';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  private parseStatus(value?: string): CustomerStatus | undefined {
    if (!value) {
      return undefined;
    }

    const statuses = Object.values(CustomerStatus);
    return statuses.find((status) => status === value);
  }

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions('customers.create')
  @Post()
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.customersService.create(
      createCustomerDto,
      requireBranchScope(req),
    );
    return success(data);
  }

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions('customers.read')
  @Get()
  async findAll(
    @Query() pagination: PaginationQueryDto,
    @Query('search') search: string,
    @Query('isVip') isVip: string,
    @Query('status') status: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    const vipFilter =
      isVip === 'true' ? true : isVip === 'false' ? false : undefined;
    const parsedStatus = this.parseStatus(status);
    const data = await this.customersService.findAll(
      req.branchId,
      pagination.page ?? 1,
      pagination.limit ?? 20,
      search,
      vipFilter,
      parsedStatus,
    );
    return success(data);
  }

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions('customers.read')
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
    return success(data);
  }

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions('customers.read')
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const data = await this.customersService.findOne(id, req.branchId);
    return success(data);
  }

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions('customers.update')
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
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('customers.delete')
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const data = await this.customersService.remove(
      id,
      requireBranchScope(req),
    );
    return success(data);
  }

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions('customers.read')
  @Get(':id/orders')
  async getOrders(
    @Param('id') id: string,
    @Query() pagination: PaginationQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.customersService.getOrders(
      id,
      req.branchId,
      pagination.page ?? 1,
      pagination.limit ?? 20,
    );
    return success(data);
  }

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions('customers.measurements.manage')
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
    return success(data);
  }

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions('customers.update')
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
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('customers.measurements.manage')
  @Post('measurements/backfill-snapshots')
  async backfillMeasurementSnapshots(@Req() req: AuthenticatedRequest) {
    const data = await this.customersService.backfillMeasurementValueSnapshots(
      requireBranchScope(req),
    );
    return success(data);
  }
}

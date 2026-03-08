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
import { ParseCuidPipe } from '../common/pipes/parse-cuid.pipe';
import { requireBranchScope } from '../common/utils/branch-scope.util';
import { success } from '../common/utils/response.util';
import {
  ADMIN_ROLES,
  OPERATOR_ROLES,
  PERMISSION,
} from '@tbms/shared-constants';
import {
  CustomersListQueryDto,
  CustomersSummaryQueryDto,
} from './dto/customer-query.dto';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['customers.create'])
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
  @RequirePermissions(PERMISSION['customers.read'])
  @Get()
  async findAll(
    @Query() query: CustomersListQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.customersService.findAll(
      req.branchId,
      query.page ?? 1,
      query.limit ?? 20,
      query.search,
      query.isVip,
      query.status,
    );
    return success(data);
  }

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['customers.read'])
  @Get('summary')
  async getSummary(
    @Query() query: CustomersSummaryQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.customersService.getSummary(req.branchId, {
      search: query.search,
      isVip: query.isVip,
      status: query.status,
    });
    return success(data);
  }

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['customers.read'])
  @Get(':id')
  async findOne(
    @Param('id', ParseCuidPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.customersService.findOne(id, req.branchId);
    return success(data);
  }

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['customers.update'])
  @Put(':id')
  async update(
    @Param('id', ParseCuidPipe) id: string,
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
  @RequirePermissions(PERMISSION['customers.delete'])
  @Delete(':id')
  async remove(
    @Param('id', ParseCuidPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.customersService.remove(
      id,
      requireBranchScope(req),
    );
    return success(data);
  }

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['customers.read'])
  @Get(':id/orders')
  async getOrders(
    @Param('id', ParseCuidPipe) id: string,
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
  @RequirePermissions(PERMISSION['customers.measurements.manage'])
  @Post(':id/measurements')
  async upsertMeasurement(
    @Param('id', ParseCuidPipe) id: string,
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
  @RequirePermissions(PERMISSION['customers.update'])
  @Patch(':id/vip')
  async toggleVip(
    @Param('id', ParseCuidPipe) id: string,
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
  @RequirePermissions(PERMISSION['customers.measurements.manage'])
  @Post('measurements/backfill-snapshots')
  async backfillMeasurementSnapshots(@Req() req: AuthenticatedRequest) {
    const data = await this.customersService.backfillMeasurementValueSnapshots(
      requireBranchScope(req),
    );
    return success(data);
  }
}

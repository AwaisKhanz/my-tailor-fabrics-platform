import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
} from '@nestjs/common';
import { RatesService } from './rates.service';
import { Roles } from '../common/decorators/auth.decorators';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { ADMIN_ROLES } from '@tbms/shared-constants';
import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreateRateDto } from './dto/create-rate.dto';
import {
  resolveBranchScopeForMutation,
  resolveBranchScopeForRead,
  resolveBranchScopeForReadOrNull,
} from '../common/utils/branch-resolution.util';
import { success, successWithMeta } from '../common/utils/response.util';

@Controller('rates')
@RequirePermissions('rates.read')
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Get()
  @Roles(...ADMIN_ROLES)
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query() pagination: PaginationQueryDto,
    @Query('search') search?: string,
  ) {
    const {
      data,
      total,
      page: safePage,
      lastPage,
    } = await this.ratesService.findAll({
      branchId: resolveBranchScopeForReadOrNull(req),
      search,
      page: pagination.page,
      limit: pagination.limit,
    });

    return successWithMeta(
      { data, total },
      {
        total,
        page: safePage,
        lastPage,
      },
    );
  }

  @Get('stats')
  @Roles(...ADMIN_ROLES)
  async getStats(
    @Req() req: AuthenticatedRequest,
    @Query('search') search?: string,
  ) {
    const data = await this.ratesService.getStats({
      branchId: resolveBranchScopeForReadOrNull(req),
      search,
    });

    return success(data);
  }

  @Post()
  @Roles(...ADMIN_ROLES)
  @RequirePermissions('rates.manage')
  async create(@Body() dto: CreateRateDto, @Req() req: AuthenticatedRequest) {
    const data = await this.ratesService.create({
      ...dto,
      branchId: resolveBranchScopeForMutation(req, dto.branchId),
      createdById: req.user.userId,
    });
    return success(data);
  }

  @Get('history')
  @Roles(...ADMIN_ROLES)
  async getHistory(
    @Req() req: AuthenticatedRequest,
    @Query('garmentTypeId') garmentTypeId: string,
    @Query('stepKey') stepKey: string,
    @Query('branchId') branchId?: string,
  ) {
    const scopedBranchId = resolveBranchScopeForRead(req, branchId, {
      allowAllForSuperAdmin: true,
    });
    const data = await this.ratesService.getHistory(
      garmentTypeId,
      stepKey,
      scopedBranchId ?? undefined,
    );
    return success(data);
  }
}

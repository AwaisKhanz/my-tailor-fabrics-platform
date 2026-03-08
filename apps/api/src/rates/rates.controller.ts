import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import { RatesService } from './rates.service';
import { Roles } from '../common/decorators/auth.decorators';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { ADMIN_ROLES, PERMISSION } from '@tbms/shared-constants';
import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreateRateDto } from './dto/create-rate.dto';
import { RateHistoryQueryDto, SearchRatesQueryDto } from './dto/rate-query.dto';
import {
  resolveBranchScopeForMutation,
  resolveBranchScopeForRead,
  resolveBranchScopeForReadOrNull,
} from '../common/utils/branch-resolution.util';
import { success } from '../common/utils/response.util';

@Controller('rates')
@RequirePermissions(PERMISSION['rates.read'])
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Get()
  @Roles(...ADMIN_ROLES)
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: PaginationQueryDto,
  ) {
    const data = await this.ratesService.findAll({
      branchId: resolveBranchScopeForReadOrNull(req),
      search: query.search,
      page: query.page,
      limit: query.limit,
    });

    return success(data);
  }

  @Get('stats')
  @Roles(...ADMIN_ROLES)
  async getStats(
    @Req() req: AuthenticatedRequest,
    @Query() query: SearchRatesQueryDto,
  ) {
    const data = await this.ratesService.getStats({
      branchId: resolveBranchScopeForReadOrNull(req),
      search: query.search,
    });

    return success(data);
  }

  @Post()
  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['rates.manage'])
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
    @Query() query: RateHistoryQueryDto,
  ) {
    const scopedBranchId = resolveBranchScopeForRead(req, query.branchId, {
      allowAllForSuperAdmin: true,
    });
    const data = await this.ratesService.getHistory(
      query.garmentTypeId,
      query.stepKey,
      scopedBranchId ?? undefined,
    );
    return success(data);
  }
}

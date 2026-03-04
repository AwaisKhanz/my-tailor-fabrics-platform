import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RatesService } from './rates.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BranchGuard } from '../common/guards/branch.guard';
import { Roles } from '../common/decorators/auth.decorators';
import { ADMIN_ROLES } from '@tbms/shared-constants';
import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { CreateRateDto } from './dto/create-rate.dto';
import {
  resolveBranchScopeForMutation,
  resolveBranchScopeForRead,
  resolveBranchScopeForReadOrNull,
} from '../common/utils/branch-resolution.util';

@Controller('rates')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Get()
  @Roles(...ADMIN_ROLES)
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
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
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    return {
      success: true,
      data: { data, total },
      meta: {
        total,
        page: safePage,
        lastPage,
      },
    };
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

    return { success: true, data };
  }

  @Post()
  @Roles(...ADMIN_ROLES)
  async create(@Body() dto: CreateRateDto, @Req() req: AuthenticatedRequest) {
    const data = await this.ratesService.create({
      ...dto,
      branchId: resolveBranchScopeForMutation(req, dto.branchId),
      createdById: req.user.userId,
    });
    return { success: true, data };
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
    return { success: true, data };
  }
}

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
import { Role } from '@tbms/shared-types';
import { ADMIN_ROLES } from '@tbms/shared-constants';
import type { CreateRateCardInput } from '@tbms/shared-types';
import type { AuthenticatedRequest } from '../common/interfaces/request.interface';

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
    const scopedBranchId =
      req.user.role === Role.SUPER_ADMIN ? (req.branchId ?? null) : req.branchId;

    const {
      data,
      total,
      page: safePage,
      lastPage,
    } = await this.ratesService.findAll({
      branchId: scopedBranchId,
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

  @Post()
  @Roles(...ADMIN_ROLES)
  async create(
    @Body() dto: CreateRateCardInput,
    @Req() req: AuthenticatedRequest,
  ) {
    // Non super-admins are strictly scoped to their assigned branch.
    if (req.user.role !== Role.SUPER_ADMIN) {
      dto.branchId = req.branchId;
    } else if (req.branchId && !dto.branchId) {
      // Respect active branch scope for super-admin unless explicitly overridden.
      dto.branchId = req.branchId;
    }
    const data = await this.ratesService.create({
      ...dto,
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
    const scopedBranchId =
      req.user.role === Role.SUPER_ADMIN ? (branchId ?? req.branchId) : req.branchId;
    const data = await this.ratesService.getHistory(
      garmentTypeId,
      stepKey,
      scopedBranchId ?? undefined,
    );
    return { success: true, data };
  }
}

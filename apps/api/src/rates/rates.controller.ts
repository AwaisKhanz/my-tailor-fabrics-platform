import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { RatesService } from './rates.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/auth.decorators';
import { Role } from '@tbms/shared-types';
import type { CreateRateCardInput } from '@tbms/shared-types';

@Controller('rates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async findAll(
    @Request() req: { user: { role: Role; branchId: string } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const branchId = req.user.role === Role.SUPER_ADMIN ? null : req.user.branchId;
    const { data, total } = await this.ratesService.findAll({
      branchId,
      search,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
    
    return {
      success: true,
      data,
      meta: { 
        total, 
        page: page ? parseInt(page) : 1, 
        lastPage: Math.ceil(total / (limit ? parseInt(limit) : 10)) 
      }
    };
  }

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async create(
    @Body() dto: CreateRateCardInput, 
    @Request() req: { user: { id: string; role: Role; branchId: string } }
  ) {
    // Ensure admins don't create rates for other branches unless super admin
    if (req.user.role !== Role.SUPER_ADMIN) {
      dto.branchId = req.user.branchId;
    }
    return this.ratesService.create({ ...dto, createdById: req.user.id });
  }

  @Get('history')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async getHistory(
    @Query('garmentTypeId') garmentTypeId: string,
    @Query('stepKey') stepKey: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.ratesService.getHistory(garmentTypeId, stepKey, branchId);
  }
}

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
} from '@nestjs/common';
import { DesignTypesService } from './design-types.service';
import {
  CreateDesignTypeDto,
  UpdateDesignTypeDto,
} from './dto/design-type.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BranchGuard } from '../common/guards/branch.guard';
import { Roles } from '../common/decorators/auth.decorators';
import {
  ADMIN_ROLES,
  OPERATOR_ROLES,
  SUPER_ADMIN_ONLY_ROLES,
} from '@tbms/shared-constants';
import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import {
  resolveBranchScopeForMutation,
  resolveBranchScopeForRead,
} from '../common/utils/branch-resolution.util';

@Controller('design-types')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class DesignTypesController {
  constructor(private readonly designTypesService: DesignTypesService) {}

  @Post()
  @Roles(...ADMIN_ROLES)
  async create(
    @Body() createDesignTypeDto: CreateDesignTypeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const dto = {
      ...createDesignTypeDto,
      branchId: resolveBranchScopeForMutation(req, createDesignTypeDto.branchId),
    };

    const data = await this.designTypesService.create(dto);
    return { success: true, data };
  }

  @Get()
  @Roles(...OPERATOR_ROLES)
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') branchId?: string,
    @Query('garmentTypeId') garmentTypeId?: string,
    @Query('search') search?: string,
  ) {
    const scopedBranchId = resolveBranchScopeForRead(req, branchId, {
      allowAllForSuperAdmin: true,
    });
    const data = await this.designTypesService.findAll(
      scopedBranchId ?? undefined,
      garmentTypeId,
      search,
    );
    return { success: true, data };
  }

  @Post('seed')
  @Roles(...SUPER_ADMIN_ONLY_ROLES)
  async seed() {
    await this.designTypesService.seedDefaults();
    return { success: true };
  }

  @Get(':id')
  @Roles(...OPERATOR_ROLES)
  async findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.designTypesService.findOne(
      id,
      req.branchId ?? undefined,
    );
    return { success: true, data };
  }

  @Patch(':id')
  @Roles(...ADMIN_ROLES)
  async update(
    @Param('id') id: string,
    @Body() updateDesignTypeDto: UpdateDesignTypeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.designTypesService.update(
      id,
      updateDesignTypeDto,
      req.branchId ?? undefined,
    );
    return { success: true, data };
  }

  @Delete(':id')
  @Roles(...ADMIN_ROLES)
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    await this.designTypesService.remove(id, req.branchId ?? undefined);
    return { success: true };
  }
}

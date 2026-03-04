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
} from '@nestjs/common';
import { DesignTypesService } from './design-types.service';
import {
  CreateDesignTypeDto,
  UpdateDesignTypeDto,
} from './dto/design-type.dto';
import { Roles } from '../common/decorators/auth.decorators';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
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
import { success, successOnly } from '../common/utils/response.util';

@Controller('design-types')
export class DesignTypesController {
  constructor(private readonly designTypesService: DesignTypesService) {}

  @Post()
  @Roles(...ADMIN_ROLES)
  @RequirePermissions('designTypes.manage')
  async create(
    @Body() createDesignTypeDto: CreateDesignTypeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const dto = {
      ...createDesignTypeDto,
      branchId: resolveBranchScopeForMutation(
        req,
        createDesignTypeDto.branchId,
      ),
    };

    const data = await this.designTypesService.create(dto);
    return success(data);
  }

  @Get()
  @Roles(...OPERATOR_ROLES)
  @RequirePermissions('designTypes.read')
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
    return success(data);
  }

  @Post('seed')
  @Roles(...SUPER_ADMIN_ONLY_ROLES)
  @RequirePermissions('designTypes.manage')
  async seed() {
    await this.designTypesService.seedDefaults();
    return successOnly();
  }

  @Get(':id')
  @Roles(...OPERATOR_ROLES)
  @RequirePermissions('designTypes.read')
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const data = await this.designTypesService.findOne(
      id,
      req.branchId ?? undefined,
    );
    return success(data);
  }

  @Patch(':id')
  @Roles(...ADMIN_ROLES)
  @RequirePermissions('designTypes.manage')
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
    return success(data);
  }

  @Delete(':id')
  @Roles(...ADMIN_ROLES)
  @RequirePermissions('designTypes.manage')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    await this.designTypesService.remove(id, req.branchId ?? undefined);
    return successOnly();
  }
}

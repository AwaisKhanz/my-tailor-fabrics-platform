import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ADMIN_ROLES,
  OPERATOR_ROLES,
  PERMISSION,
} from '@tbms/shared-constants';
import { Roles } from '../common/decorators/auth.decorators';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { ParseCuidPipe } from '../common/pipes/parse-cuid.pipe';
import { resolveBranchScopeForMutation } from '../common/utils/branch-resolution.util';
import { requireBranchScope } from '../common/utils/branch-scope.util';
import { success } from '../common/utils/response.util';
import {
  CreateShopFabricDto,
  ListShopFabricsQueryDto,
  UpdateShopFabricDto,
} from './dto/fabric.dto';
import { FabricsService } from './fabrics.service';

@Controller('fabrics')
export class FabricsController {
  constructor(private readonly fabricsService: FabricsService) {}

  @Get()
  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['fabrics.read'])
  async findAll(
    @Query() query: ListShopFabricsQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.fabricsService.findAll({
      branchId: requireBranchScope(req),
      page: query.page,
      limit: query.limit,
      search: query.search,
      activeOnly: query.activeOnly,
      includeArchived: query.includeArchived,
    });
    return success(data);
  }

  @Get('stats')
  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['fabrics.read'])
  async getStats(
    @Query() query: ListShopFabricsQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.fabricsService.getStats(
      requireBranchScope(req),
      query.search,
    );
    return success(data);
  }

  @Get(':id')
  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['fabrics.read'])
  async findOne(
    @Param('id', ParseCuidPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.fabricsService.findOne(id, requireBranchScope(req));
    return success(data);
  }

  @Post()
  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['fabrics.manage'])
  async create(
    @Body() dto: CreateShopFabricDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.fabricsService.create(
      resolveBranchScopeForMutation(req, dto.branchId) ??
        requireBranchScope(req),
      dto,
    );
    return success(data);
  }

  @Patch(':id')
  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['fabrics.manage'])
  async update(
    @Param('id', ParseCuidPipe) id: string,
    @Body() dto: UpdateShopFabricDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.fabricsService.update(id, requireBranchScope(req), {
      ...dto,
      branchId:
        resolveBranchScopeForMutation(req, dto.branchId) ??
        requireBranchScope(req),
    });
    return success(data);
  }
}

import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { Controller, Get, Query, Req } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { Roles } from '../common/decorators/auth.decorators';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { success } from '../common/utils/response.util';
import { ADMIN_ROLES } from '@tbms/shared-constants';
import { resolveBranchScopeForReadOrNull } from '../common/utils/branch-resolution.util';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('audit.read')
  @Get()
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query() pagination: PaginationQueryDto,
    @Query('action') action?: string,
    @Query('entity') entity?: string,
    @Query('userId') userId?: string,
    @Query('search') search?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('branchId') branchId?: string,
  ) {
    const scopedBranchId = resolveBranchScopeForReadOrNull(req, branchId, {
      allowAllForSuperAdmin: true,
    });
    const data = await this.auditLogsService.findAll({
      branchId: scopedBranchId,
      page: pagination.page ?? 1,
      limit: pagination.limit ?? 20,
      action,
      entity,
      userId,
      search,
      from,
      to,
    });
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('audit.read')
  @Get('stats')
  async getStats(
    @Req() req: AuthenticatedRequest,
    @Query('action') action?: string,
    @Query('entity') entity?: string,
    @Query('userId') userId?: string,
    @Query('search') search?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('branchId') branchId?: string,
  ) {
    const scopedBranchId = resolveBranchScopeForReadOrNull(req, branchId, {
      allowAllForSuperAdmin: true,
    });
    const data = await this.auditLogsService.getStats({
      branchId: scopedBranchId,
      action,
      entity,
      userId,
      search,
      from,
      to,
    });
    return success(data);
  }
}

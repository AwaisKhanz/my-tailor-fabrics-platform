import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { Controller, Get, Query, Req } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { Roles } from '../common/decorators/auth.decorators';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { success } from '../common/utils/response.util';
import { ADMIN_ROLES, PERMISSION } from '@tbms/shared-constants';
import { resolveBranchScopeForReadOrNull } from '../common/utils/branch-resolution.util';
import {
  AuditLogsListQueryDto,
  AuditLogsStatsQueryDto,
} from './dto/audit-log-query.dto';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['audit.read'])
  @Get()
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: AuditLogsListQueryDto,
  ) {
    const scopedBranchId = resolveBranchScopeForReadOrNull(
      req,
      query.branchId,
      {
        allowAllForSuperAdmin: true,
      },
    );
    const data = await this.auditLogsService.findAll({
      branchId: scopedBranchId,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      action: query.action,
      entity: query.entity,
      userId: query.userId,
      search: query.search,
      from: query.from,
      to: query.to,
    });
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['audit.read'])
  @Get('stats')
  async getStats(
    @Req() req: AuthenticatedRequest,
    @Query() query: AuditLogsStatsQueryDto,
  ) {
    const scopedBranchId = resolveBranchScopeForReadOrNull(
      req,
      query.branchId,
      {
        allowAllForSuperAdmin: true,
      },
    );
    const data = await this.auditLogsService.getStats({
      branchId: scopedBranchId,
      action: query.action,
      entity: query.entity,
      userId: query.userId,
      search: query.search,
      from: query.from,
      to: query.to,
    });
    return success(data);
  }
}

import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { Controller, Get, Query, Req } from '@nestjs/common';
import { SearchService } from './search.service';
import { Roles } from '../common/decorators/auth.decorators';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { OPERATOR_ROLES, PERMISSION } from '@tbms/shared-constants';
import { resolveBranchScopeForReadOrNull } from '../common/utils/branch-resolution.util';
import { success } from '../common/utils/response.util';
import { SearchLookupQueryDto } from './dto/search-query.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('customers')
  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['search.global'])
  async queryCustomers(
    @Query() query: SearchLookupQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const branchId = resolveBranchScopeForReadOrNull(req);

    const data = await this.searchService.searchCustomers(
      query.q ?? '',
      branchId,
      query.limit ?? 10,
    );
    return success(data);
  }

  @Get('employees')
  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['search.global'])
  async queryEmployees(
    @Query() query: SearchLookupQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const branchId = resolveBranchScopeForReadOrNull(req);

    const data = await this.searchService.searchEmployees(
      query.q ?? '',
      branchId,
      query.limit ?? 10,
    );
    return success(data);
  }
}

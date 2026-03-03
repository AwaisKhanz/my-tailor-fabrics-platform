import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BranchGuard } from '../common/guards/branch.guard';
import { Roles } from '../common/decorators/auth.decorators';
import { OPERATOR_ROLES } from '@tbms/shared-constants';

@Controller('search')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('customers')
  @Roles(...OPERATOR_ROLES)
  async queryCustomers(
    @Query('q') query: string,
    @Req() req: AuthenticatedRequest,
    @Query('limit') limit?: string,
  ) {
    const branchId = req.branchId ?? null; // Set by BranchGuard

    const data = await this.searchService.searchCustomers(
      query || '',
      branchId,
      Number(limit) || 10,
    );
    return { success: true, data };
  }

  @Get('employees')
  @Roles(...OPERATOR_ROLES)
  async queryEmployees(
    @Query('q') query: string,
    @Req() req: AuthenticatedRequest,
    @Query('limit') limit?: string,
  ) {
    const branchId = req.branchId ?? null; // Set by BranchGuard

    const data = await this.searchService.searchEmployees(
      query || '',
      branchId,
      Number(limit) || 10,
    );
    return { success: true, data };
  }
}

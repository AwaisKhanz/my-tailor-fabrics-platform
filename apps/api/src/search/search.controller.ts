import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BranchGuard } from '../common/guards/branch.guard';
import { Roles } from '../common/decorators/auth.decorators';
import { Role } from '@tbms/shared-types';

@Controller('search')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('customers')
  @Roles(Role.ENTRY_OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  async queryCustomers(@Query('q') query: string, @Req() req: AuthenticatedRequest) {
    const branchId = req.branchId; // Set by BranchGuard
    const limit = Number(req.query.limit) || 10;
    
    const data = await this.searchService.searchCustomers(query || '', branchId, limit);
    return { success: true, data };
  }

  @Get('employees')
  @Roles(Role.ENTRY_OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  async queryEmployees(@Query('q') query: string, @Req() req: AuthenticatedRequest) {
    const branchId = req.branchId; // Set by BranchGuard
    const limit = Number(req.query.limit) || 10;

    const data = await this.searchService.searchEmployees(query || '', branchId, limit);
    return { success: true, data };
  }
}

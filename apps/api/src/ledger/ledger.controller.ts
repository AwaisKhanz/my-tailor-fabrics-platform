import { Controller, Get, Post, Body, Param, Query, Delete, Req, UseGuards } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/auth.decorators';
import { Role, LedgerEntryType } from '@tbms/shared-types';
import type { CreateLedgerEntryInput } from '@tbms/shared-types';
import type { AuthenticatedRequest } from '../common/interfaces/request.interface';

@Controller('ledger')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  /**
   * GET /ledger/:employeeId/balance
   * Returns the current balance summary for an employee.
   */
  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async createManualEntry(@Body() dto: CreateLedgerEntryInput, @Req() req: AuthenticatedRequest) {
    // Force branchId from token to ensure data integrity
    const data = await this.ledgerService.createEntry({
      ...dto,
      branchId: req.branchId,
      createdById: req.user.userId,
    });
    return { success: true, data };
  }

  @Get(':employeeId/balance')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async getBalance(@Param('employeeId') employeeId: string) {
    const summary = await this.ledgerService.getBalance(employeeId);
    return { success: true, data: summary };
  }

  @Get(':employeeId/statement')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async getStatement(
    @Param('employeeId') employeeId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('type') type?: LedgerEntryType,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.ledgerService.getStatement(employeeId, {
      from,
      to,
      type,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
    return { success: true, data: result };
  }

  /**
   * GET /ledger/:employeeId/earnings?weeksBack=
   * Returns earnings grouped by week for the last N weeks.
   */
  @Get(':employeeId/earnings')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async getEarnings(
    @Param('employeeId') employeeId: string,
    @Query('weeksBack') weeksBack?: string,
  ) {
    const data = await this.ledgerService.getEarningsByPeriod(
      employeeId,
      weeksBack ? parseInt(weeksBack) : 12,
    );
    return { success: true, data };
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async deleteEntry(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const data = await this.ledgerService.remove(id, req.branchId);
    return { success: true, data };
  }
}

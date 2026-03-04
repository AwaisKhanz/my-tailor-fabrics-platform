import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BranchGuard } from '../common/guards/branch.guard';
import { Roles } from '../common/decorators/auth.decorators';
import { LedgerEntryType } from '@tbms/shared-types';
import { ADMIN_ROLES } from '@tbms/shared-constants';
import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { CreateLedgerEntryDto } from './dto/create-ledger-entry.dto';

@Controller('ledger')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  /**
   * GET /ledger/:employeeId/balance
   * Returns the current balance summary for an employee.
   */
  @Post()
  @Roles(...ADMIN_ROLES)
  async createManualEntry(
    @Body() dto: CreateLedgerEntryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const branchId = req.branchId ?? dto.branchId;
    if (!branchId) {
      throw new BadRequestException(
        'Branch scope is required to create a ledger entry',
      );
    }

    const data = await this.ledgerService.createEntry({
      ...dto,
      branchId,
      createdById: req.user.userId,
    });
    return { success: true, data };
  }

  @Get(':employeeId/balance')
  @Roles(...ADMIN_ROLES)
  async getBalance(
    @Param('employeeId') employeeId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const summary = await this.ledgerService.getBalance(employeeId, req.branchId);
    return { success: true, data: summary };
  }

  @Get(':employeeId/statement')
  @Roles(...ADMIN_ROLES)
  async getStatement(
    @Param('employeeId') employeeId: string,
    @Req() req: AuthenticatedRequest,
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
    }, req.branchId);
    return { success: true, data: result };
  }

  /**
   * GET /ledger/:employeeId/earnings?weeksBack=
   * Returns earnings grouped by week for the last N weeks.
   */
  @Get(':employeeId/earnings')
  @Roles(...ADMIN_ROLES)
  async getEarnings(
    @Param('employeeId') employeeId: string,
    @Req() req: AuthenticatedRequest,
    @Query('weeksBack') weeksBack?: string,
  ) {
    const data = await this.ledgerService.getEarningsByPeriod(
      employeeId,
      weeksBack ? parseInt(weeksBack) : 12,
      req.branchId,
    );
    return { success: true, data };
  }

  @Delete(':id')
  @Roles(...ADMIN_ROLES)
  async deleteEntry(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const data = await this.ledgerService.remove(id, req.branchId);
    return { success: true, data };
  }
}

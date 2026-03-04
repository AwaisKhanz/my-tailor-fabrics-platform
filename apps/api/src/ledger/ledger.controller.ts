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
} from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { Roles } from '../common/decorators/auth.decorators';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { LedgerEntryType } from '@tbms/shared-types';
import { ADMIN_ROLES } from '@tbms/shared-constants';
import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreateLedgerEntryDto } from './dto/create-ledger-entry.dto';
import { parsePositiveInt } from '../common/utils/query-parsing.util';
import { success } from '../common/utils/response.util';

@Controller('ledger')
@RequirePermissions('ledger.read')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  /**
   * GET /ledger/:employeeId/balance
   * Returns the current balance summary for an employee.
   */
  @Post()
  @Roles(...ADMIN_ROLES)
  @RequirePermissions('ledger.manage')
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
    return success(data);
  }

  @Get(':employeeId/balance')
  @Roles(...ADMIN_ROLES)
  async getBalance(
    @Param('employeeId') employeeId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const summary = await this.ledgerService.getBalance(
      employeeId,
      req.branchId,
    );
    return success(summary);
  }

  @Get(':employeeId/statement')
  @Roles(...ADMIN_ROLES)
  async getStatement(
    @Param('employeeId') employeeId: string,
    @Req() req: AuthenticatedRequest,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('type') type?: LedgerEntryType,
    @Query() pagination?: PaginationQueryDto,
  ) {
    const result = await this.ledgerService.getStatement(
      employeeId,
      {
        from,
        to,
        type,
        page: pagination?.page ?? 1,
        limit: pagination?.limit ?? 20,
      },
      req.branchId,
    );
    return success(result);
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
      parsePositiveInt(weeksBack, 12),
      req.branchId,
    );
    return success(data);
  }

  @Delete(':id')
  @Roles(...ADMIN_ROLES)
  @RequirePermissions('ledger.manage')
  async deleteEntry(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const data = await this.ledgerService.remove(id, req.branchId);
    return success(data);
  }
}

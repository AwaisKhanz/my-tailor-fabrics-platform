import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { Roles } from '../common/decorators/auth.decorators';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { ParseCuidPipe } from '../common/pipes/parse-cuid.pipe';
import { LedgerEntryType } from '@tbms/shared-types';
import { ADMIN_ROLES, PERMISSION } from '@tbms/shared-constants';
import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import {
  CreateLedgerEntryDto,
  ReverseLedgerEntryDto,
} from './dto/create-ledger-entry.dto';
import { resolveBranchScopeForMutation } from '../common/utils/branch-resolution.util';
import { success } from '../common/utils/response.util';
import {
  LedgerEarningsQueryDto,
  LedgerStatementQueryDto,
} from './dto/ledger-query.dto';

@Controller('ledger')
@RequirePermissions(PERMISSION['ledger.read'])
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  /**
   * GET /ledger/:employeeId/balance
   * Returns the current balance summary for an employee.
   */
  @Post()
  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['ledger.manage'])
  async createManualEntry(
    @Body() dto: CreateLedgerEntryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const branchId = resolveBranchScopeForMutation(req, dto.branchId ?? null);

    if (dto.type === LedgerEntryType.SALARY) {
      throw new BadRequestException(
        'Manual SALARY entries are disabled. Use salary accrual generation.',
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
    @Param('employeeId', ParseCuidPipe) employeeId: string,
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
    @Param('employeeId', ParseCuidPipe) employeeId: string,
    @Req() req: AuthenticatedRequest,
    @Query() query: LedgerStatementQueryDto,
  ) {
    const result = await this.ledgerService.getStatement(
      employeeId,
      {
        from: query.from,
        to: query.to,
        type: query.type,
        page: query.page ?? 1,
        limit: query.limit ?? 20,
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
    @Param('employeeId', ParseCuidPipe) employeeId: string,
    @Req() req: AuthenticatedRequest,
    @Query() query: LedgerEarningsQueryDto,
  ) {
    const data = await this.ledgerService.getEarningsByPeriod(
      employeeId,
      query.weeksBack ?? 12,
      req.branchId,
    );
    return success(data);
  }

  @Post(':id/reverse')
  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['ledger.manage'])
  async reverseEntry(
    @Param('id', ParseCuidPipe) id: string,
    @Body() dto: ReverseLedgerEntryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.ledgerService.reverseEntry(
      id,
      req.user.userId,
      req.branchId,
      dto.note,
    );
    return success(data);
  }
}

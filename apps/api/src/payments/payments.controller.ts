import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { DisbursePaymentDto } from './dto/payment.dto';
import { Roles } from '../common/decorators/auth.decorators';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { requireBranchScope } from '../common/utils/branch-scope.util';
import { success, successSpread } from '../common/utils/response.util';
import { ADMIN_ROLES } from '@tbms/shared-constants';

import { WeeklyPdfService } from './weekly-pdf.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly weeklyPdfService: WeeklyPdfService,
  ) {}

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('payments.read')
  @Get('employee/:id/summary')
  async getSummary(
    @Param('id') employeeId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.paymentsService.getEmployeeBalanceSummary(
      employeeId,
      req.branchId,
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('payments.manage')
  @Post()
  async disbursePay(
    @Body() dto: DisbursePaymentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.paymentsService.disbursePay(
      dto.employeeId,
      dto.amount,
      req.user.userId,
      requireBranchScope(req),
      dto.note,
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('payments.read')
  @Get('employee/:id/history')
  async getHistory(
    @Param('id') employeeId: string,
    @Req() req: AuthenticatedRequest,
    @Query() pagination: PaginationQueryDto,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const data = await this.paymentsService.getHistory(
      employeeId,
      pagination.page ?? 1,
      pagination.limit ?? 20,
      from,
      to,
      sortBy,
      sortOrder,
      req.branchId,
    );
    return successSpread(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('payments.read')
  @Get('weekly-report')
  async getWeeklyReport(@Req() req: AuthenticatedRequest) {
    const data = await this.paymentsService.getWeeklyReport(req.branchId);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('payments.read')
  @Get('weekly-report/pdf')
  async getWeeklyReportPdf(
    @Req() req: AuthenticatedRequest,
    @Res() res: import('express').Response,
  ) {
    const data = await this.paymentsService.getWeeklyReport(req.branchId);
    const pdfStream = await this.weeklyPdfService.generatePdfStream(data);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="weekly_payments.pdf"',
    });
    pdfStream.pipe(res);
  }
}

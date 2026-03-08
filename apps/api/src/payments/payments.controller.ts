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
import {
  DisbursePaymentDto,
  GenerateSalaryAccrualsDto,
  ReversePaymentDto,
} from './dto/payment.dto';
import { PaymentsHistoryQueryDto } from './dto/payment-query.dto';
import { Roles } from '../common/decorators/auth.decorators';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { ParseCuidPipe } from '../common/pipes/parse-cuid.pipe';
import { requireBranchScope } from '../common/utils/branch-scope.util';
import { success } from '../common/utils/response.util';
import { ADMIN_ROLES, PERMISSION } from '@tbms/shared-constants';

import { WeeklyPdfService } from './weekly-pdf.service';
import { SalaryAccrualService } from './salary-accrual.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly weeklyPdfService: WeeklyPdfService,
    private readonly salaryAccrualService: SalaryAccrualService,
  ) {}

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['payments.read'])
  @Get('employee/:id/summary')
  async getSummary(
    @Param('id', ParseCuidPipe) employeeId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.paymentsService.getEmployeeBalanceSummary(
      employeeId,
      req.branchId,
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['payments.manage'])
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
  @RequirePermissions(PERMISSION['payments.manage'])
  @Post(':id/reverse')
  async reversePayment(
    @Param('id', ParseCuidPipe) id: string,
    @Body() dto: ReversePaymentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.paymentsService.reversePayment(
      id,
      req.user.userId,
      req.branchId,
      dto.note,
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['payments.manage'])
  @Post('salary-accruals/generate')
  async generateSalaryAccruals(
    @Body() dto: GenerateSalaryAccrualsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.salaryAccrualService.generateForMonth({
      branchId: requireBranchScope(req),
      month: dto.month,
      employeeId: dto.employeeId,
      generatedById: req.user.userId,
      source: 'MANUAL',
    });
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['payments.read'])
  @Get('employee/:id/history')
  async getHistory(
    @Param('id', ParseCuidPipe) employeeId: string,
    @Req() req: AuthenticatedRequest,
    @Query() query: PaymentsHistoryQueryDto,
  ) {
    const data = await this.paymentsService.getHistory(
      employeeId,
      query.page ?? 1,
      query.limit ?? 20,
      query.from,
      query.to,
      query.sortBy,
      query.sortOrder,
      req.branchId,
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['payments.read'])
  @Get('weekly-report')
  async getWeeklyReport(@Req() req: AuthenticatedRequest) {
    const data = await this.paymentsService.getWeeklyReport(req.branchId);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['payments.read'])
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

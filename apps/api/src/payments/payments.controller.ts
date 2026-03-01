import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { Controller, Get, Post, Body, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { DisbursePaymentDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BranchGuard } from '../common/guards/branch.guard';
import { Roles } from '../common/decorators/auth.decorators';
import { Role } from '@tbms/shared-types';

import { WeeklyPdfService } from './weekly-pdf.service';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class PaymentsController {
  constructor(
      private readonly paymentsService: PaymentsService,
      private readonly weeklyPdfService: WeeklyPdfService
  ) {}

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('employee/:id/summary')
  async getSummary(@Param('id') employeeId: string) {
    const data = await this.paymentsService.getEmployeeBalanceSummary(employeeId);
    return { success: true, data };
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  async disbursePay(@Body() dto: DisbursePaymentDto, @Req() req: AuthenticatedRequest) {
    // Note: User object contains id added by JwtAuthGuard
    const data = await this.paymentsService.disbursePay(dto.employeeId, dto.amount, req.user.userId, dto.note);
    return { success: true, data };
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('employee/:id/history')
  async getHistory(
    @Param('id') employeeId: string, 
    @Query('page') page: string, 
    @Query('limit') limit: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    const data = await this.paymentsService.getHistory(employeeId, Number(page) || 1, Number(limit) || 20, sortBy, sortOrder);
    return { success: true, ...data };
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('weekly-report')
  async getWeeklyReport() {
    const data = await this.paymentsService.getWeeklyReport();
    return { success: true, data };
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('weekly-report/pdf')
  async getWeeklyReportPdf(@Res() res: import('express').Response) {
    const data = await this.paymentsService.getWeeklyReport();
    const pdfStream = await this.weeklyPdfService.generatePdfStream(data as { employeeCode: string; employeeName: string; paidThisWeek: number | string; }[]);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="weekly_payments.pdf"',
    });
    pdfStream.pipe(res);
  }
}

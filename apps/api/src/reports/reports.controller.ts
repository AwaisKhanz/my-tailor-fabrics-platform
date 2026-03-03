import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { Controller, Get, Req, Res, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ExportService } from './export.service';
import { PdfExportService } from './pdf-export.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BranchGuard } from '../common/guards/branch.guard';
import { Roles } from '../common/decorators/auth.decorators';
import { Role } from '@tbms/shared-types';
import { DASHBOARD_READ_ROLES } from '@tbms/shared-constants';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly exportService: ExportService,
    private readonly pdfExportService: PdfExportService,
  ) {}

  @Roles(...DASHBOARD_READ_ROLES)
  @Get('dashboard')
  async getDashboard(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') targetBranchId?: string,
  ) {
    // Only SUPER_ADMIN can request dashboard data for branches they don't explicitly belong to or globally (if branchId is not provided)
    let resolvedBranchId: string | undefined = req.branchId; // from BranchGuard

    if (req.user.role === Role.SUPER_ADMIN && targetBranchId !== undefined) {
      resolvedBranchId = targetBranchId === 'all' ? undefined : targetBranchId;
    }

    const data = await this.reportsService.getDashboardStats(resolvedBranchId);
    return { success: true, data };
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @Get('designs')
  async getDesigns(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') targetBranchId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const branchId = this.resolveBranch(req, targetBranchId);
    const data = await this.reportsService.getDesignAnalytics(branchId, from, to);
    return { success: true, data };
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @Get('addons')
  async getAddons(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') targetBranchId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const branchId = this.resolveBranch(req, targetBranchId);
    const data = await this.reportsService.getAddonAnalytics(branchId, from, to);
    return { success: true, data };
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @Get('summary')
  async getSummary(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') targetBranchId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const branchId = this.resolveBranch(req, targetBranchId);
    const data = await this.reportsService.getSummary(branchId, from, to);
    return { success: true, data };
  }
 
  @Roles(...DASHBOARD_READ_ROLES)
  @Get('revenue-vs-expenses')
  async getRevenueVsExpenses(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') targetBranchId?: string,
    @Query('months') months?: number,
  ) {
    const branchId = this.resolveBranch(req, targetBranchId);
    const data = await this.reportsService.getRevenueVsExpenses(
      branchId,
      months,
    );
    return { success: true, data };
  }
 
  @Roles(...DASHBOARD_READ_ROLES)
  @Get('garments')
  async getGarmentRevenue(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') targetBranchId?: string,
  ) {
    const branchId = this.resolveBranch(req, targetBranchId);
    const data = await this.reportsService.getGarmentTypesRevenue(branchId);
    return { success: true, data };
  }
 
  @Roles(...DASHBOARD_READ_ROLES)
  @Get('productivity')
  async getEmployeeProductivity(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') targetBranchId?: string,
  ) {
    const branchId = this.resolveBranch(req, targetBranchId);
    const data = await this.reportsService.getEmployeeProductivity(branchId);
    return { success: true, data };
  }

  private resolveBranch(req: AuthenticatedRequest, targetBranchId?: string) {
    let resolved: string | undefined = req.branchId;
    if (req.user.role === Role.SUPER_ADMIN && targetBranchId !== undefined) {
      resolved = targetBranchId === 'all' ? undefined : targetBranchId;
    }
    return resolved;
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @Get('export/orders')
  async exportOrders(
    @Req() req: AuthenticatedRequest,
    @Res() res: import('express').Response,
    @Query('branchId') targetBranchId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('format') format?: string,
  ) {
    const branchId = this.resolveBranch(req, targetBranchId);

    if (format === 'pdf') {
      const stream = await this.pdfExportService.exportOrdersPdf(branchId, from, to);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="orders.pdf"',
      });
      stream.pipe(res);
    } else {
      const stream = await this.exportService.exportOrders(branchId, from, to);
      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="orders.xlsx"',
      });
      stream.pipe(res);
    }
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @Get('export/payments')
  async exportPayments(
    @Req() req: AuthenticatedRequest,
    @Res() res: import('express').Response,
    @Query('branchId') targetBranchId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('format') format?: string,
  ) {
    const branchId = this.resolveBranch(req, targetBranchId);

    if (format === 'pdf') {
      const stream = await this.pdfExportService.exportPaymentsPdf(branchId, from, to);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="payments.pdf"',
      });
      stream.pipe(res);
    } else {
      const stream = await this.exportService.exportPayments(branchId, from, to);
      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="payments.xlsx"',
      });
      stream.pipe(res);
    }
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @Get('export/expenses')
  async exportExpenses(
    @Req() req: AuthenticatedRequest,
    @Res() res: import('express').Response,
    @Query('branchId') targetBranchId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('format') format?: string,
  ) {
    const branchId = this.resolveBranch(req, targetBranchId);

    if (format === 'pdf') {
      const stream = await this.pdfExportService.exportExpensesPdf(branchId, from, to);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="expenses.pdf"',
      });
      stream.pipe(res);
    } else {
      const stream = await this.exportService.exportExpenses(branchId, from, to);
      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="expenses.xlsx"',
      });
      stream.pipe(res);
    }
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @Get('export/employees')
  async exportEmployees(
    @Req() req: AuthenticatedRequest,
    @Res() res: import('express').Response,
    @Query('branchId') targetBranchId?: string,
  ) {
    const branchId = this.resolveBranch(req, targetBranchId);
    const stream = await this.exportService.exportEmployeeSummaries(branchId);
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="employees.xlsx"',
    });
    stream.pipe(res);
  }
}

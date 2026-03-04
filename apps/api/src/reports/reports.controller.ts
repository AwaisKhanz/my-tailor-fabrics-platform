import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { Controller, Get, Req, Res, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ExportService } from './export.service';
import { PdfExportService } from './pdf-export.service';
import { Roles } from '../common/decorators/auth.decorators';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { DASHBOARD_READ_ROLES } from '@tbms/shared-constants';
import { resolveBranchScopeForRead } from '../common/utils/branch-resolution.util';
import { parseOptionalPositiveInt } from '../common/utils/query-parsing.util';
import { success } from '../common/utils/response.util';

@Controller('reports')
@RequirePermissions('reports.read')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly exportService: ExportService,
    private readonly pdfExportService: PdfExportService,
  ) {}

  @Roles(...DASHBOARD_READ_ROLES)
  @RequirePermissions('dashboard.read')
  @Get('dashboard')
  async getDashboard(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') targetBranchId?: string,
  ) {
    const branchId = resolveBranchScopeForRead(req, targetBranchId, {
      allowAllForSuperAdmin: true,
    });
    const data = await this.reportsService.getDashboardStats(branchId);
    return success(data);
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @Get('designs')
  async getDesigns(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') targetBranchId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const branchId = resolveBranchScopeForRead(req, targetBranchId, {
      allowAllForSuperAdmin: true,
    });
    const data = await this.reportsService.getDesignAnalytics(
      branchId,
      from,
      to,
    );
    return success(data);
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @Get('addons')
  async getAddons(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') targetBranchId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const branchId = resolveBranchScopeForRead(req, targetBranchId, {
      allowAllForSuperAdmin: true,
    });
    const data = await this.reportsService.getAddonAnalytics(
      branchId,
      from,
      to,
    );
    return success(data);
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @Get('summary')
  async getSummary(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') targetBranchId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const branchId = resolveBranchScopeForRead(req, targetBranchId, {
      allowAllForSuperAdmin: true,
    });
    const data = await this.reportsService.getSummary(branchId, from, to);
    return success(data);
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @Get('financial-trend')
  async getFinancialTrend(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') targetBranchId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('granularity') granularity?: string,
  ) {
    const branchId = resolveBranchScopeForRead(req, targetBranchId, {
      allowAllForSuperAdmin: true,
    });
    const data = await this.reportsService.getFinancialTrend(
      branchId,
      from,
      to,
      granularity,
    );
    return success(data);
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @Get('distributions')
  async getDistributions(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') targetBranchId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const branchId = resolveBranchScopeForRead(req, targetBranchId, {
      allowAllForSuperAdmin: true,
    });
    const data = await this.reportsService.getDistributions(branchId, from, to);
    return success(data);
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @Get('revenue-vs-expenses')
  async getRevenueVsExpenses(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') targetBranchId?: string,
    @Query('months') months?: string,
  ) {
    const branchId = resolveBranchScopeForRead(req, targetBranchId, {
      allowAllForSuperAdmin: true,
    });
    const data = await this.reportsService.getRevenueVsExpenses(
      branchId,
      parseOptionalPositiveInt(months),
    );
    return success(data);
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @Get('garments')
  async getGarmentRevenue(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') targetBranchId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const branchId = resolveBranchScopeForRead(req, targetBranchId, {
      allowAllForSuperAdmin: true,
    });
    const data = await this.reportsService.getGarmentTypesRevenue(
      branchId,
      from,
      to,
    );
    return success(data);
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @Get('productivity')
  async getEmployeeProductivity(
    @Req() req: AuthenticatedRequest,
    @Query('branchId') targetBranchId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
  ) {
    const branchId = resolveBranchScopeForRead(req, targetBranchId, {
      allowAllForSuperAdmin: true,
    });
    const data = await this.reportsService.getProductivityPoints(
      branchId,
      from,
      to,
      parseOptionalPositiveInt(limit),
    );
    return success(data);
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @RequirePermissions('reports.read', 'reports.export')
  @Get('export/orders')
  async exportOrders(
    @Req() req: AuthenticatedRequest,
    @Res() res: import('express').Response,
    @Query('branchId') targetBranchId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('format') format?: string,
  ) {
    const branchId = resolveBranchScopeForRead(req, targetBranchId, {
      allowAllForSuperAdmin: true,
    });

    if (format === 'pdf') {
      const stream = await this.pdfExportService.exportOrdersPdf(
        branchId,
        from,
        to,
      );
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
  @RequirePermissions('reports.read', 'reports.export')
  @Get('export/payments')
  async exportPayments(
    @Req() req: AuthenticatedRequest,
    @Res() res: import('express').Response,
    @Query('branchId') targetBranchId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('format') format?: string,
  ) {
    const branchId = resolveBranchScopeForRead(req, targetBranchId, {
      allowAllForSuperAdmin: true,
    });

    if (format === 'pdf') {
      const stream = await this.pdfExportService.exportPaymentsPdf(
        branchId,
        from,
        to,
      );
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="payments.pdf"',
      });
      stream.pipe(res);
    } else {
      const stream = await this.exportService.exportPayments(
        branchId,
        from,
        to,
      );
      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="payments.xlsx"',
      });
      stream.pipe(res);
    }
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @RequirePermissions('reports.read', 'reports.export')
  @Get('export/expenses')
  async exportExpenses(
    @Req() req: AuthenticatedRequest,
    @Res() res: import('express').Response,
    @Query('branchId') targetBranchId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('format') format?: string,
  ) {
    const branchId = resolveBranchScopeForRead(req, targetBranchId, {
      allowAllForSuperAdmin: true,
    });

    if (format === 'pdf') {
      const stream = await this.pdfExportService.exportExpensesPdf(
        branchId,
        from,
        to,
      );
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="expenses.pdf"',
      });
      stream.pipe(res);
    } else {
      const stream = await this.exportService.exportExpenses(
        branchId,
        from,
        to,
      );
      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="expenses.xlsx"',
      });
      stream.pipe(res);
    }
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @RequirePermissions('reports.read', 'reports.export')
  @Get('export/employees')
  async exportEmployees(
    @Req() req: AuthenticatedRequest,
    @Res() res: import('express').Response,
    @Query('branchId') targetBranchId?: string,
  ) {
    const branchId = resolveBranchScopeForRead(req, targetBranchId, {
      allowAllForSuperAdmin: true,
    });
    const stream = await this.exportService.exportEmployeeSummaries(branchId);
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="employees.xlsx"',
    });
    stream.pipe(res);
  }
}

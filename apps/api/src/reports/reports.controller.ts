import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { Controller, Get, Req, Res, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ExportService } from './export.service';
import { PdfExportService } from './pdf-export.service';
import { Roles } from '../common/decorators/auth.decorators';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { DASHBOARD_READ_ROLES, PERMISSION } from '@tbms/shared-constants';
import { resolveBranchScopeForRead } from '../common/utils/branch-resolution.util';
import { success } from '../common/utils/response.util';
import {
  BranchScopedReportQueryDto,
  DateRangeReportQueryDto,
  ExportReportQueryDto,
  FinancialTrendQueryDto,
  ProductivityQueryDto,
  RevenueVsExpensesQueryDto,
} from './dto/report-query.dto';

@Controller('reports')
@RequirePermissions(PERMISSION['reports.read'])
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly exportService: ExportService,
    private readonly pdfExportService: PdfExportService,
  ) {}

  @Roles(...DASHBOARD_READ_ROLES)
  @RequirePermissions(PERMISSION['dashboard.read'])
  @Get('dashboard')
  async getDashboard(
    @Req() req: AuthenticatedRequest,
    @Query() query: BranchScopedReportQueryDto,
  ) {
    const branchId = resolveBranchScopeForRead(req, query.branchId, {
      allowAllForSuperAdmin: true,
    });
    const data = await this.reportsService.getDashboardStats(branchId);
    return success(data);
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @Get('designs')
  async getDesigns(
    @Req() req: AuthenticatedRequest,
    @Query() query: DateRangeReportQueryDto,
  ) {
    const branchId = resolveBranchScopeForRead(req, query.branchId, {
      allowAllForSuperAdmin: true,
    });
    const data = await this.reportsService.getDesignAnalytics(
      branchId,
      query.from,
      query.to,
    );
    return success(data);
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @Get('addons')
  async getAddons(
    @Req() req: AuthenticatedRequest,
    @Query() query: DateRangeReportQueryDto,
  ) {
    const branchId = resolveBranchScopeForRead(req, query.branchId, {
      allowAllForSuperAdmin: true,
    });
    const data = await this.reportsService.getAddonAnalytics(
      branchId,
      query.from,
      query.to,
    );
    return success(data);
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @Get('summary')
  async getSummary(
    @Req() req: AuthenticatedRequest,
    @Query() query: DateRangeReportQueryDto,
  ) {
    const branchId = resolveBranchScopeForRead(req, query.branchId, {
      allowAllForSuperAdmin: true,
    });
    const data = await this.reportsService.getSummary(
      branchId,
      query.from,
      query.to,
    );
    return success(data);
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @Get('financial-trend')
  async getFinancialTrend(
    @Req() req: AuthenticatedRequest,
    @Query() query: FinancialTrendQueryDto,
  ) {
    const branchId = resolveBranchScopeForRead(req, query.branchId, {
      allowAllForSuperAdmin: true,
    });
    const data = await this.reportsService.getFinancialTrend(
      branchId,
      query.from,
      query.to,
      query.granularity,
    );
    return success(data);
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @Get('distributions')
  async getDistributions(
    @Req() req: AuthenticatedRequest,
    @Query() query: DateRangeReportQueryDto,
  ) {
    const branchId = resolveBranchScopeForRead(req, query.branchId, {
      allowAllForSuperAdmin: true,
    });
    const data = await this.reportsService.getDistributions(
      branchId,
      query.from,
      query.to,
    );
    return success(data);
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @Get('revenue-vs-expenses')
  async getRevenueVsExpenses(
    @Req() req: AuthenticatedRequest,
    @Query() query: RevenueVsExpensesQueryDto,
  ) {
    const branchId = resolveBranchScopeForRead(req, query.branchId, {
      allowAllForSuperAdmin: true,
    });
    const data = await this.reportsService.getRevenueVsExpenses(
      branchId,
      query.months,
    );
    return success(data);
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @Get('garments')
  async getGarmentRevenue(
    @Req() req: AuthenticatedRequest,
    @Query() query: DateRangeReportQueryDto,
  ) {
    const branchId = resolveBranchScopeForRead(req, query.branchId, {
      allowAllForSuperAdmin: true,
    });
    const data = await this.reportsService.getGarmentTypesRevenue(
      branchId,
      query.from,
      query.to,
    );
    return success(data);
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @Get('productivity')
  async getEmployeeProductivity(
    @Req() req: AuthenticatedRequest,
    @Query() query: ProductivityQueryDto,
  ) {
    const branchId = resolveBranchScopeForRead(req, query.branchId, {
      allowAllForSuperAdmin: true,
    });
    const data = await this.reportsService.getProductivityPoints(
      branchId,
      query.from,
      query.to,
      query.limit,
    );
    return success(data);
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @RequirePermissions(PERMISSION['reports.read'], PERMISSION['reports.export'])
  @Get('export/orders')
  async exportOrders(
    @Req() req: AuthenticatedRequest,
    @Res() res: import('express').Response,
    @Query() query: ExportReportQueryDto,
  ) {
    const branchId = resolveBranchScopeForRead(req, query.branchId, {
      allowAllForSuperAdmin: true,
    });

    if (query.format === 'pdf') {
      const stream = await this.pdfExportService.exportOrdersPdf(
        branchId,
        query.from,
        query.to,
      );
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="orders.pdf"',
      });
      stream.pipe(res);
    } else {
      const stream = await this.exportService.exportOrders(
        branchId,
        query.from,
        query.to,
      );
      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="orders.xlsx"',
      });
      stream.pipe(res);
    }
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @RequirePermissions(PERMISSION['reports.read'], PERMISSION['reports.export'])
  @Get('export/payments')
  async exportPayments(
    @Req() req: AuthenticatedRequest,
    @Res() res: import('express').Response,
    @Query() query: ExportReportQueryDto,
  ) {
    const branchId = resolveBranchScopeForRead(req, query.branchId, {
      allowAllForSuperAdmin: true,
    });

    if (query.format === 'pdf') {
      const stream = await this.pdfExportService.exportPaymentsPdf(
        branchId,
        query.from,
        query.to,
      );
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="payments.pdf"',
      });
      stream.pipe(res);
    } else {
      const stream = await this.exportService.exportPayments(
        branchId,
        query.from,
        query.to,
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
  @RequirePermissions(PERMISSION['reports.read'], PERMISSION['reports.export'])
  @Get('export/expenses')
  async exportExpenses(
    @Req() req: AuthenticatedRequest,
    @Res() res: import('express').Response,
    @Query() query: ExportReportQueryDto,
  ) {
    const branchId = resolveBranchScopeForRead(req, query.branchId, {
      allowAllForSuperAdmin: true,
    });

    if (query.format === 'pdf') {
      const stream = await this.pdfExportService.exportExpensesPdf(
        branchId,
        query.from,
        query.to,
      );
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="expenses.pdf"',
      });
      stream.pipe(res);
    } else {
      const stream = await this.exportService.exportExpenses(
        branchId,
        query.from,
        query.to,
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
  @RequirePermissions(PERMISSION['reports.read'], PERMISSION['reports.export'])
  @Get('export/employees')
  async exportEmployees(
    @Req() req: AuthenticatedRequest,
    @Res() res: import('express').Response,
    @Query() query: BranchScopedReportQueryDto,
  ) {
    const branchId = resolveBranchScopeForRead(req, query.branchId, {
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

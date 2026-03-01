import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { Controller, Get, Req, Res, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BranchGuard } from '../common/guards/branch.guard';
import { Roles } from '../common/decorators/auth.decorators';
import { Role } from '@tbms/shared-types';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class ReportsController {
    constructor(
        private readonly reportsService: ReportsService,
        private readonly exportService: ExportService
    ) {}

    @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.VIEWER)
    @Get('dashboard')
    async getDashboard(@Req() req: AuthenticatedRequest, @Query('branchId') overrideBranchId?: string) {
        // Only SUPER_ADMIN can request dashboard data for branches they don't explicitly belong to or globally (if branchId is not provided)
        let resolvedBranchId: string | undefined = req.branchId; // from BranchGuard
        
        if (req.user.role === Role.SUPER_ADMIN && overrideBranchId !== undefined) {
             resolvedBranchId = overrideBranchId === 'all' ? undefined : overrideBranchId;
        }

        const data = await this.reportsService.getDashboardStats(resolvedBranchId);
        return { success: true, data };
    }

    private resolveBranch(req: AuthenticatedRequest, overrideBranchId?: string) {
        let resolved: string | undefined = req.branchId;
        if (req.user.role === Role.SUPER_ADMIN && overrideBranchId !== undefined) {
             resolved = overrideBranchId === 'all' ? undefined : overrideBranchId;
        }
        return resolved;
    }

    @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.VIEWER)
    @Get('export/orders')
    async exportOrders(
        @Req() req: AuthenticatedRequest, 
        @Res() res: import('express').Response, 
        @Query('branchId') overrideBranchId?: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        const branchId = this.resolveBranch(req, overrideBranchId);
        const stream = await this.exportService.exportOrders(branchId, from, to);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="orders.xlsx"',
        });
        stream.pipe(res);
    }

    @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.VIEWER)
    @Get('export/payments')
    async exportPayments(
        @Req() req: AuthenticatedRequest, 
        @Res() res: import('express').Response, 
        @Query('branchId') overrideBranchId?: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        const branchId = this.resolveBranch(req, overrideBranchId);
        const stream = await this.exportService.exportPayments(branchId, from, to);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="payments.xlsx"',
        });
        stream.pipe(res);
    }

    @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.VIEWER)
    @Get('export/expenses')
    async exportExpenses(
        @Req() req: AuthenticatedRequest, 
        @Res() res: import('express').Response, 
        @Query('branchId') overrideBranchId?: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        const branchId = this.resolveBranch(req, overrideBranchId);
        const stream = await this.exportService.exportExpenses(branchId, from, to);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="expenses.xlsx"',
        });
        stream.pipe(res);
    }

    @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.VIEWER)
    @Get('export/employees')
    async exportEmployees(
        @Req() req: AuthenticatedRequest, 
        @Res() res: import('express').Response, 
        @Query('branchId') overrideBranchId?: string
    ) {
        const branchId = this.resolveBranch(req, overrideBranchId);
        const stream = await this.exportService.exportEmployeeSummaries(branchId);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="employees.xlsx"',
        });
        stream.pipe(res);
    }
}

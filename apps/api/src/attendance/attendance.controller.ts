import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BranchGuard } from '../common/guards/branch.guard';
import { Roles } from '../common/decorators/auth.decorators';
import { requireBranchScope } from '../common/utils/branch-scope.util';
import {
  DASHBOARD_READ_ROLES,
  EMPLOYEE_AND_OPERATOR_ROLES,
} from '@tbms/shared-constants';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /** Clock in — can be done by any authenticated user on behalf of an employee */
  @Roles(...EMPLOYEE_AND_OPERATOR_ROLES)
  @Post('clock-in')
  async clockIn(
    @Body('employeeId') employeeId: string,
    @Body('note') note: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.attendanceService.clockIn(
      employeeId,
      requireBranchScope(req),
      note,
    );
    return { success: true, data };
  }

  /** Clock out for a specific attendance record */
  @Roles(...EMPLOYEE_AND_OPERATOR_ROLES)
  @Post('clock-out/:recordId')
  async clockOut(
    @Param('recordId') recordId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.attendanceService.clockOut(
      recordId,
      requireBranchScope(req),
    );
    return { success: true, data };
  }

  /** Get paginated attendance records, optionally filtered by employee */
  @Roles(...DASHBOARD_READ_ROLES)
  @Get()
  async findAll(
    @Query('employeeId') employeeId: string | undefined,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.attendanceService.findAll(
      req.branchId,
      employeeId,
      Number(page) || 1,
      Number(limit) || 20,
    );
    return { success: true, data };
  }

  /** Get attendance summary for a specific employee */
  @Roles(...DASHBOARD_READ_ROLES)
  @Get('employee/:employeeId/summary')
  async getEmployeeSummary(
    @Param('employeeId') employeeId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.attendanceService.getEmployeeSummary(
      employeeId,
      req.branchId,
    );
    return { success: true, data };
  }
}

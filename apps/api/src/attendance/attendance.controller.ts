import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { Roles } from '../common/decorators/auth.decorators';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { requireBranchScope } from '../common/utils/branch-scope.util';
import { success } from '../common/utils/response.util';
import { ClockInDto } from './dto/clock-in.dto';
import {
  DASHBOARD_READ_ROLES,
  EMPLOYEE_AND_OPERATOR_ROLES,
} from '@tbms/shared-constants';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /** Clock in — can be done by any authenticated user on behalf of an employee */
  @Roles(...EMPLOYEE_AND_OPERATOR_ROLES)
  @RequirePermissions('attendance.checkin')
  @Post('clock-in')
  async clockIn(@Body() dto: ClockInDto, @Req() req: AuthenticatedRequest) {
    const data = await this.attendanceService.clockIn(
      dto.employeeId,
      requireBranchScope(req),
      dto.note,
    );
    return success(data);
  }

  /** Clock out for a specific attendance record */
  @Roles(...EMPLOYEE_AND_OPERATOR_ROLES)
  @RequirePermissions('attendance.checkin')
  @Post('clock-out/:recordId')
  async clockOut(
    @Param('recordId') recordId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.attendanceService.clockOut(
      recordId,
      requireBranchScope(req),
    );
    return success(data);
  }

  /** Get paginated attendance records, optionally filtered by employee */
  @Roles(...DASHBOARD_READ_ROLES)
  @RequirePermissions('attendance.read')
  @Get()
  async findAll(
    @Query('employeeId') employeeId: string | undefined,
    @Query() pagination: PaginationQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.attendanceService.findAll(
      req.branchId,
      employeeId,
      pagination.page ?? 1,
      pagination.limit ?? 20,
    );
    return success(data);
  }

  /** Get attendance summary for a specific employee */
  @Roles(...DASHBOARD_READ_ROLES)
  @RequirePermissions('attendance.read')
  @Get('employee/:employeeId/summary')
  async getEmployeeSummary(
    @Param('employeeId') employeeId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.attendanceService.getEmployeeSummary(
      employeeId,
      req.branchId,
    );
    return success(data);
  }
}

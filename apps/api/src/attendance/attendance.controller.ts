import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { Roles } from '../common/decorators/auth.decorators';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { ParseCuidPipe } from '../common/pipes/parse-cuid.pipe';
import { requireBranchScope } from '../common/utils/branch-scope.util';
import { success } from '../common/utils/response.util';
import { ClockInDto } from './dto/clock-in.dto';
import { ClockInSelfDto } from './dto/clock-in-self.dto';
import { AttendanceListQueryDto } from './dto/attendance-query.dto';
import {
  DASHBOARD_READ_ROLES,
  EMPLOYEE_SELF_ROLES,
  OPERATOR_ROLES,
  PERMISSION,
} from '@tbms/shared-constants';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /** Clock in for a specific employee (staff action). */
  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['attendance.manage'])
  @Post('clock-in')
  async clockIn(@Body() dto: ClockInDto, @Req() req: AuthenticatedRequest) {
    const data = await this.attendanceService.clockIn(
      dto.employeeId,
      requireBranchScope(req),
      dto.note,
    );
    return success(data);
  }

  /** Clock out for a specific attendance record (staff action). */
  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['attendance.manage'])
  @Post('clock-out/:recordId')
  async clockOut(
    @Param('recordId', ParseCuidPipe) recordId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.attendanceService.clockOut(
      recordId,
      requireBranchScope(req),
    );
    return success(data);
  }

  /** Clock in for the authenticated employee. */
  @Roles(...EMPLOYEE_SELF_ROLES)
  @RequirePermissions(PERMISSION['attendance.checkin'])
  @Post('me/clock-in')
  async clockInSelf(
    @Body() dto: ClockInSelfDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const employeeId = req.user.employeeId;
    if (!employeeId) {
      throw new ForbiddenException('Employee identity is missing');
    }
    const data = await this.attendanceService.clockIn(
      employeeId,
      requireBranchScope(req),
      dto.note,
    );
    return success(data);
  }

  /** Clock out the authenticated employee against their own attendance record. */
  @Roles(...EMPLOYEE_SELF_ROLES)
  @RequirePermissions(PERMISSION['attendance.checkin'])
  @Post('me/clock-out/:recordId')
  async clockOutSelf(
    @Param('recordId', ParseCuidPipe) recordId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const employeeId = req.user.employeeId;
    if (!employeeId) {
      throw new ForbiddenException('Employee identity is missing');
    }
    const data = await this.attendanceService.clockOutForEmployee(
      recordId,
      requireBranchScope(req),
      employeeId,
    );
    return success(data);
  }

  /** Get paginated attendance records, optionally filtered by employee */
  @Roles(...DASHBOARD_READ_ROLES)
  @RequirePermissions(PERMISSION['attendance.read'])
  @Get()
  async findAll(
    @Query() query: AttendanceListQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.attendanceService.findAll(
      req.branchId,
      query.employeeId,
      query.page ?? 1,
      query.limit ?? 20,
    );
    return success(data);
  }

  /** Get attendance summary for a specific employee */
  @Roles(...DASHBOARD_READ_ROLES)
  @RequirePermissions(PERMISSION['attendance.read'])
  @Get('employee/:employeeId/summary')
  async getEmployeeSummary(
    @Param('employeeId', ParseCuidPipe) employeeId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.attendanceService.getEmployeeSummary(
      employeeId,
      req.branchId,
    );
    return success(data);
  }
}

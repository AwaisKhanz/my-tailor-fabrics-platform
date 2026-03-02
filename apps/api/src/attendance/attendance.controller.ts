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
import { Role } from '@tbms/shared-types';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /** Clock in — can be done by any authenticated user on behalf of an employee */
  @Roles(Role.ENTRY_OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.EMPLOYEE)
  @Post('clock-in')
  async clockIn(
    @Body('employeeId') employeeId: string,
    @Body('note') note: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.attendanceService.clockIn(
      employeeId,
      req.branchId,
      note,
    );
    return { success: true, data };
  }

  /** Clock out for a specific attendance record */
  @Roles(Role.ENTRY_OPERATOR, Role.ADMIN, Role.SUPER_ADMIN, Role.EMPLOYEE)
  @Post('clock-out/:recordId')
  async clockOut(
    @Param('recordId') recordId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.attendanceService.clockOut(recordId, req.branchId);
    return { success: true, data };
  }

  /** Get paginated attendance records, optionally filtered by employee */
  @Roles(Role.VIEWER, Role.ENTRY_OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
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
  @Roles(Role.VIEWER, Role.ENTRY_OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
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

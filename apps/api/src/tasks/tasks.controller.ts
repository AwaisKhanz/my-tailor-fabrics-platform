import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { BranchGuard } from '../common/guards/branch.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/auth.decorators';
import { TaskStatus } from '@tbms/shared-types';
import {
  ADMIN_ROLES,
  DASHBOARD_READ_ROLES,
  EMPLOYEE_AND_OPERATOR_ROLES,
} from '@tbms/shared-constants';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Roles(...ADMIN_ROLES)
  @Patch(':id/assign')
  async assignTask(
    @Param('id') id: string,
    @Body('employeeId') employeeId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.tasksService.assignTask(
      id,
      employeeId,
      req.branchId,
      req.user.role,
    );
    return { success: true, data };
  }

  @Roles(...EMPLOYEE_AND_OPERATOR_ROLES)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: TaskStatus,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.tasksService.updateTaskStatus(
      id,
      status,
      req.branchId,
      req.user.userId,
      req.user.role,
      req.user.employeeId ?? null,
    );
    return { success: true, data };
  }

  @Roles(...ADMIN_ROLES)
  @Patch(':id/rate')
  async updateRate(
    @Param('id') id: string,
    @Body('rateOverride') rateOverride: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.tasksService.updateTaskRate(
      id,
      rateOverride,
      req.branchId,
      req.user.role,
    );
    return { success: true, data };
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @Get('order/:orderId')
  async findByOrder(
    @Param('orderId') orderId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.tasksService.findAllByOrder(orderId, req.branchId);
    return { success: true, data };
  }

  @Roles(...EMPLOYEE_AND_OPERATOR_ROLES)
  @Get('employee/:employeeId')
  async findByEmployee(
    @Param('employeeId') employeeId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.tasksService.findAllByEmployee(
      employeeId,
      req.branchId,
      req.user.role,
      req.user.employeeId ?? null,
    );
    return { success: true, data };
  }
}

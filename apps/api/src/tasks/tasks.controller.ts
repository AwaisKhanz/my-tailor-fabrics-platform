import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Req,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TaskStatus } from '@tbms/shared-types';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

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
      req.user.userId,
      req.user.role,
    );
    return { success: true, data };
  }

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
    );
    return { success: true, data };
  }

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

  @Get('order/:orderId')
  async findByOrder(
    @Param('orderId') orderId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.tasksService.findAllByOrder(orderId, req.branchId);
    return { success: true, data };
  }

  @Get('employee/:employeeId')
  async findByEmployee(
    @Param('employeeId') employeeId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.tasksService.findAllByEmployee(
      employeeId,
      req.branchId,
    );
    return { success: true, data };
  }
}

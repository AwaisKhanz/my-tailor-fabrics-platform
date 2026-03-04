import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Req,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { TasksService } from './tasks.service';
import { Roles } from '../common/decorators/auth.decorators';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { requireBranchScope } from '../common/utils/branch-scope.util';
import { success } from '../common/utils/response.util';
import {
  ADMIN_ROLES,
  DASHBOARD_READ_ROLES,
  EMPLOYEE_AND_OPERATOR_ROLES,
} from '@tbms/shared-constants';
import { AssignTaskDto } from './dto/create-task.dto';
import { UpdateTaskRateDto, UpdateTaskStatusDto } from './dto/update-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('tasks.assign')
  @Patch(':id/assign')
  async assignTask(
    @Param('id') id: string,
    @Body() dto: AssignTaskDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.tasksService.assignTask(
      id,
      dto.employeeId,
      requireBranchScope(req),
    );
    return success(data);
  }

  @Roles(...EMPLOYEE_AND_OPERATOR_ROLES)
  @RequirePermissions('tasks.update')
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTaskStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.tasksService.updateTaskStatus(
      id,
      dto.status,
      requireBranchScope(req),
      req.user.userId,
      req.user.role,
      req.user.employeeId ?? null,
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('tasks.rate.override')
  @Patch(':id/rate')
  async updateRate(
    @Param('id') id: string,
    @Body() dto: UpdateTaskRateDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.tasksService.updateTaskRate(
      id,
      dto.rateOverride,
      requireBranchScope(req),
    );
    return success(data);
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @RequirePermissions('tasks.read')
  @Get('order/:orderId')
  async findByOrder(
    @Param('orderId') orderId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.tasksService.findAllByOrder(orderId, req.branchId);
    return success(data);
  }

  @Roles(...EMPLOYEE_AND_OPERATOR_ROLES)
  @RequirePermissions('tasks.read')
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
    return success(data);
  }
}

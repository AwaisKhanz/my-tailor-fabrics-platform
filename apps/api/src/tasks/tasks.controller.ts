import {
  Controller,
  Get,
  Body,
  Patch,
  Post,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { TasksService } from './tasks.service';
import { Roles } from '../common/decorators/auth.decorators';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { ParseCuidPipe } from '../common/pipes/parse-cuid.pipe';
import { requireBranchScope } from '../common/utils/branch-scope.util';
import { resolveBranchScopeForRead } from '../common/utils/branch-resolution.util';
import { success } from '../common/utils/response.util';
import {
  ADMIN_ROLES,
  DASHBOARD_READ_ROLES,
  EMPLOYEE_AND_OPERATOR_ROLES,
  PERMISSION,
} from '@tbms/shared-constants';
import { AssignTaskDto } from './dto/create-task.dto';
import { ReconcileTaskEarningsQueryDto } from './dto/task-query.dto';
import { UpdateTaskRateDto, UpdateTaskStatusDto } from './dto/update-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['tasks.assign'])
  @Patch(':id/assign')
  async assignTask(
    @Param('id', ParseCuidPipe) id: string,
    @Body() dto: AssignTaskDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.tasksService.assignTask(
      id,
      dto.employeeId ?? null,
      requireBranchScope(req),
      req.user.userId,
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['tasks.assign'])
  @Get(':id/eligible-employees')
  async getEligibleEmployees(
    @Param('id', ParseCuidPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.tasksService.getEligibleEmployeesForTask(
      id,
      requireBranchScope(req),
    );
    return success(data);
  }

  @Roles(...EMPLOYEE_AND_OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['tasks.update'])
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseCuidPipe) id: string,
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
  @RequirePermissions(PERMISSION['tasks.rate.override'])
  @Patch(':id/rate')
  async updateRate(
    @Param('id', ParseCuidPipe) id: string,
    @Body() dto: UpdateTaskRateDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.tasksService.updateTaskRate(
      id,
      dto.rateOverride,
      requireBranchScope(req),
      req.user.userId,
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['tasks.rate.override'])
  @Post('reconcile-earnings')
  async reconcileEarnings(
    @Req() req: AuthenticatedRequest,
    @Query() query: ReconcileTaskEarningsQueryDto,
  ) {
    const scopedBranchId = resolveBranchScopeForRead(req, query.branchId, {
      allowAllForSuperAdmin: true,
    });
    const data = await this.tasksService.reconcileTaskEarnings(
      scopedBranchId ?? null,
      req.user.userId,
    );
    return success(data);
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @RequirePermissions(PERMISSION['tasks.read'])
  @Get('order/:orderId')
  async findByOrder(
    @Param('orderId', ParseCuidPipe) orderId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.tasksService.findAllByOrder(orderId, req.branchId);
    return success(data);
  }

  @Roles(...EMPLOYEE_AND_OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['tasks.read'])
  @Get('employee/:employeeId')
  async findByEmployee(
    @Param('employeeId', ParseCuidPipe) employeeId: string,
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

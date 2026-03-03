import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BranchGuard } from '../common/guards/branch.guard';
import { Roles } from '../common/decorators/auth.decorators';
import { ADMIN_ROLES } from '@tbms/shared-constants';

@Controller('expenses')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Roles(...ADMIN_ROLES)
  @Post()
  async create(
    @Body() dto: CreateExpenseDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.expensesService.create(
      req.branchId,
      req.user.userId,
      dto,
    );
    return { success: true, data };
  }

  @Roles(...ADMIN_ROLES)
  @Get()
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('categoryId') categoryId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const data = await this.expensesService.findAll(
      req.branchId,
      Number(page) || 1,
      Number(limit) || 20,
      categoryId,
      from,
      to,
      sortBy,
      sortOrder,
    );
    return { success: true, ...data };
  }

  @Roles(...ADMIN_ROLES)
  @Get('categories')
  async findAllCategories() {
    const data = await this.expensesService.findAllCategories();
    return { success: true, data };
  }

  @Roles(...ADMIN_ROLES)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const data = await this.expensesService.findOne(id, req.branchId);
    return { success: true, data };
  }

  @Roles(...ADMIN_ROLES)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.expensesService.update(id, req.branchId, dto);
    return { success: true, data };
  }

  @Roles(...ADMIN_ROLES)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    await this.expensesService.remove(id, req.branchId);
    return { success: true };
  }
}

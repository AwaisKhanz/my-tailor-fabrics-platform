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
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import {
  CreateExpenseCategoryDto,
  CreateExpenseDto,
  UpdateExpenseCategoryDto,
  UpdateExpenseDto,
} from './dto/expense.dto';
import { Roles } from '../common/decorators/auth.decorators';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { requireBranchScope } from '../common/utils/branch-scope.util';
import { success, successOnly } from '../common/utils/response.util';
import { ADMIN_ROLES } from '@tbms/shared-constants';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('expenses.manage')
  @Post()
  async create(
    @Body() dto: CreateExpenseDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.expensesService.create(
      requireBranchScope(req),
      req.user.userId,
      dto,
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('expenses.read')
  @Get()
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query() pagination: PaginationQueryDto,
    @Query('categoryId') categoryId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const data = await this.expensesService.findAll(
      req.branchId,
      pagination.page ?? 1,
      pagination.limit ?? 20,
      pagination.search,
      categoryId,
      from,
      to,
      sortBy,
      sortOrder,
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('expenses.read')
  @Get('categories/paginated')
  async findAllCategoriesPaginated(@Query() pagination: PaginationQueryDto) {
    const data = await this.expensesService.findAllCategoriesPaginated(
      pagination.page ?? 1,
      pagination.limit ?? 20,
      pagination.search,
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('expenses.read')
  @Get('categories')
  async findAllCategories() {
    const data = await this.expensesService.findAllCategories();
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('expenses.manage')
  @Post('categories')
  async createCategory(@Body() dto: CreateExpenseCategoryDto) {
    const data = await this.expensesService.createCategory(dto);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('expenses.manage')
  @Put('categories/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateExpenseCategoryDto,
  ) {
    const data = await this.expensesService.updateCategory(id, dto);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('expenses.manage')
  @Delete('categories/:id')
  async removeCategory(@Param('id') id: string) {
    await this.expensesService.removeCategory(id);
    return successOnly();
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('expenses.read')
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const data = await this.expensesService.findOne(id, req.branchId);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('expenses.manage')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.expensesService.update(
      id,
      requireBranchScope(req),
      dto,
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('expenses.manage')
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    await this.expensesService.remove(id, requireBranchScope(req));
    return successOnly();
  }
}

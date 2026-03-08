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
import { ListExpensesQueryDto } from './dto/expense-query.dto';
import { Roles } from '../common/decorators/auth.decorators';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ParseCuidPipe } from '../common/pipes/parse-cuid.pipe';
import { requireBranchScope } from '../common/utils/branch-scope.util';
import { success, successOnly } from '../common/utils/response.util';
import { ADMIN_ROLES, PERMISSION } from '@tbms/shared-constants';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['expenses.manage'])
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
  @RequirePermissions(PERMISSION['expenses.read'])
  @Get()
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListExpensesQueryDto,
  ) {
    const data = await this.expensesService.findAll(
      req.branchId,
      query.page ?? 1,
      query.limit ?? 20,
      query.search,
      query.categoryId,
      query.from,
      query.to,
      query.sortBy,
      query.sortOrder,
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['expenses.read'])
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
  @RequirePermissions(PERMISSION['expenses.read'])
  @Get('categories')
  async findAllCategories() {
    const data = await this.expensesService.findAllCategories();
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['expenses.manage'])
  @Post('categories')
  async createCategory(@Body() dto: CreateExpenseCategoryDto) {
    const data = await this.expensesService.createCategory(dto);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['expenses.manage'])
  @Put('categories/:id')
  async updateCategory(
    @Param('id', ParseCuidPipe) id: string,
    @Body() dto: UpdateExpenseCategoryDto,
  ) {
    const data = await this.expensesService.updateCategory(id, dto);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['expenses.manage'])
  @Delete('categories/:id')
  async removeCategory(@Param('id', ParseCuidPipe) id: string) {
    await this.expensesService.removeCategory(id);
    return successOnly();
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['expenses.read'])
  @Get(':id')
  async findOne(
    @Param('id', ParseCuidPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.expensesService.findOne(id, req.branchId);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['expenses.manage'])
  @Put(':id')
  async update(
    @Param('id', ParseCuidPipe) id: string,
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
  @RequirePermissions(PERMISSION['expenses.manage'])
  @Delete(':id')
  async remove(
    @Param('id', ParseCuidPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.expensesService.remove(id, requireBranchScope(req));
    return successOnly();
  }
}

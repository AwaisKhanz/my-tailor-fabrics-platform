import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Delete,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { Roles } from '../common/decorators/auth.decorators';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { success, successOnly } from '../common/utils/response.util';
import {
  ADMIN_ROLES,
  ALL_ROLES,
  SUPER_ADMIN_ONLY_ROLES,
} from '@tbms/shared-constants';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Roles(...ALL_ROLES)
  @RequirePermissions('branches.read')
  @Get()
  async findAll(
    @Query() pagination: PaginationQueryDto,
    @Query('search') search?: string,
  ) {
    const data = await this.branchesService.findAll({
      page: pagination.page,
      limit: pagination.limit,
      search,
    });
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('branches.read')
  @Get('stats')
  async getStats() {
    const data = await this.branchesService.getStats();
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('branches.read')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.branchesService.findOne(id);
    return success(data);
  }

  @Roles(...SUPER_ADMIN_ONLY_ROLES)
  @RequirePermissions('branches.manage')
  @Post()
  async createBranch(@Body() body: CreateBranchDto) {
    const data = await this.branchesService.create(body);
    return success(data);
  }

  @Roles(...SUPER_ADMIN_ONLY_ROLES)
  @RequirePermissions('branches.manage')
  @Put(':id')
  async updateBranch(@Param('id') id: string, @Body() body: UpdateBranchDto) {
    const data = await this.branchesService.update(id, body);
    return success(data);
  }

  @Roles(...SUPER_ADMIN_ONLY_ROLES)
  @RequirePermissions('branches.manage')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.branchesService.remove(id);
    return successOnly();
  }
}

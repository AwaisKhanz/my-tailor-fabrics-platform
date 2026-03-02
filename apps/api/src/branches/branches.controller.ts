import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Delete } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/auth.decorators';
import type { CreateBranchInput, UpdateBranchInput } from '@tbms/shared-types';
import { Role } from '@tbms/shared-types';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.ENTRY_OPERATOR, Role.VIEWER, Role.EMPLOYEE)
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.branchesService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
    });
    return { success: true, data };
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get('stats')
  async getStats() {
    const data = await this.branchesService.getStats();
    return { success: true, data };
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.branchesService.findOne(id);
    return { success: true, data };
  }

  @Roles(Role.SUPER_ADMIN)
  @Post()
  async createBranch(@Body() body: CreateBranchInput) {
    const data = await this.branchesService.create(body);
    return { success: true, data };
  }

  @Roles(Role.SUPER_ADMIN)
  @Put(':id')
  async updateBranch(@Param('id') id: string, @Body() body: UpdateBranchInput) {
    const data = await this.branchesService.update(id, body);
    return { success: true, data };
  }

  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.branchesService.remove(id);
    return { success: true };
  }
}

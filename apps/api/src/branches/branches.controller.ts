import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/auth.decorators';
import {
  ADMIN_ROLES,
  ALL_ROLES,
  SUPER_ADMIN_ONLY_ROLES,
} from '@tbms/shared-constants';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Roles(...ALL_ROLES)
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

  @Roles(...ADMIN_ROLES)
  @Get('stats')
  async getStats() {
    const data = await this.branchesService.getStats();
    return { success: true, data };
  }

  @Roles(...ADMIN_ROLES)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.branchesService.findOne(id);
    return { success: true, data };
  }

  @Roles(...SUPER_ADMIN_ONLY_ROLES)
  @Post()
  async createBranch(@Body() body: CreateBranchDto) {
    const data = await this.branchesService.create(body);
    return { success: true, data };
  }

  @Roles(...SUPER_ADMIN_ONLY_ROLES)
  @Put(':id')
  async updateBranch(@Param('id') id: string, @Body() body: UpdateBranchDto) {
    const data = await this.branchesService.update(id, body);
    return { success: true, data };
  }

  @Roles(...SUPER_ADMIN_ONLY_ROLES)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.branchesService.remove(id);
    return { success: true };
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/auth.decorators';
import type { CreateUserInput, UpdateUserInput } from '@tbms/shared-types';
import { Role } from '@tbms/shared-types';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(Role.SUPER_ADMIN)
  @Get()
  async findAll(@Query('branchId') branchId?: string) {
    const data = await this.usersService.findAll(branchId);
    return { success: true, data };
  }

  @Roles(Role.SUPER_ADMIN)
  @Get('stats')
  async getStats() {
    const data = await this.usersService.getStats();
    return { success: true, data };
  }

  @Roles(Role.SUPER_ADMIN)
  @Post()
  async create(@Body() body: CreateUserInput) {
    const data = await this.usersService.create(body);
    return { success: true, data };
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch(':id/status')
  async setActive(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    const data = await this.usersService.setActive(id, isActive);
    return { success: true, data };
  }

  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { success: true };
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateUserInput) {
    const data = await this.usersService.update(id, body);
    return { success: true, data };
  }
}

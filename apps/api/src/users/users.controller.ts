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
import { SUPER_ADMIN_ONLY_ROLES } from '@tbms/shared-constants';
import { CreateUserDto, SetUserActiveDto, UpdateUserDto } from './dto/user.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(...SUPER_ADMIN_ONLY_ROLES)
  @Get()
  async findAll(@Query('branchId') branchId?: string) {
    const data = await this.usersService.findAll(branchId);
    return { success: true, data };
  }

  @Roles(...SUPER_ADMIN_ONLY_ROLES)
  @Get('stats')
  async getStats() {
    const data = await this.usersService.getStats();
    return { success: true, data };
  }

  @Roles(...SUPER_ADMIN_ONLY_ROLES)
  @Post()
  async create(@Body() body: CreateUserDto) {
    const data = await this.usersService.create(body);
    return { success: true, data };
  }

  @Roles(...SUPER_ADMIN_ONLY_ROLES)
  @Patch(':id/status')
  async setActive(@Param('id') id: string, @Body() body: SetUserActiveDto) {
    const data = await this.usersService.setActive(id, body.isActive);
    return { success: true, data };
  }

  @Roles(...SUPER_ADMIN_ONLY_ROLES)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { success: true };
  }

  @Roles(...SUPER_ADMIN_ONLY_ROLES)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const data = await this.usersService.update(id, body);
    return { success: true, data };
  }
}

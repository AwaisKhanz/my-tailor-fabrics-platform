import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../common/decorators/auth.decorators';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { SUPER_ADMIN_ONLY_ROLES, PERMISSION } from '@tbms/shared-constants';
import {
  CreateUserDto,
  ListUsersQueryDto,
  SetUserActiveDto,
  UpdateUserDto,
} from './dto/user.dto';
import { success, successOnly } from '../common/utils/response.util';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(...SUPER_ADMIN_ONLY_ROLES)
  @RequirePermissions(PERMISSION['users.read'])
  @Get()
  async findAll(@Query() query: ListUsersQueryDto) {
    const data = await this.usersService.findAll(query);
    return success(data);
  }

  @Roles(...SUPER_ADMIN_ONLY_ROLES)
  @RequirePermissions(PERMISSION['users.read'])
  @Get('stats')
  async getStats() {
    const data = await this.usersService.getStats();
    return success(data);
  }

  @Roles(...SUPER_ADMIN_ONLY_ROLES)
  @RequirePermissions(PERMISSION['users.manage'])
  @Post()
  async create(@Body() body: CreateUserDto) {
    const data = await this.usersService.create(body);
    return success(data);
  }

  @Roles(...SUPER_ADMIN_ONLY_ROLES)
  @RequirePermissions(PERMISSION['users.manage'])
  @Patch(':id/status')
  async setActive(@Param('id') id: string, @Body() body: SetUserActiveDto) {
    const data = await this.usersService.setActive(id, body.isActive);
    return success(data);
  }

  @Roles(...SUPER_ADMIN_ONLY_ROLES)
  @RequirePermissions(PERMISSION['users.manage'])
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return successOnly();
  }

  @Roles(...SUPER_ADMIN_ONLY_ROLES)
  @RequirePermissions(PERMISSION['users.manage'])
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const data = await this.usersService.update(id, body);
    return success(data);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DesignTypesService } from './design-types.service';
import {
  CreateDesignTypeDto,
  UpdateDesignTypeDto,
} from './dto/design-type.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/auth.decorators';
import { Role } from '@tbms/shared-types';

@Controller('design-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DesignTypesController {
  constructor(private readonly designTypesService: DesignTypesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async create(@Body() createDesignTypeDto: CreateDesignTypeDto) {
    const data = await this.designTypesService.create(createDesignTypeDto);
    return { success: true, data };
  }

  @Get()
  async findAll(
    @Query('branchId') branchId?: string,
    @Query('garmentTypeId') garmentTypeId?: string,
  ) {
    const data = await this.designTypesService.findAll(branchId, garmentTypeId);
    return { success: true, data };
  }

  @Post('seed')
  @Roles(Role.SUPER_ADMIN)
  async seed() {
    await this.designTypesService.seedDefaults();
    return { success: true };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.designTypesService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateDesignTypeDto: UpdateDesignTypeDto,
  ) {
    const data = await this.designTypesService.update(id, updateDesignTypeDto);
    return { success: true, data };
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async remove(@Param('id') id: string) {
    await this.designTypesService.remove(id);
    return { success: true };
  }
}

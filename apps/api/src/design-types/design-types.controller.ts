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
import { ADMIN_ROLES, SUPER_ADMIN_ONLY_ROLES } from '@tbms/shared-constants';

@Controller('design-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DesignTypesController {
  constructor(private readonly designTypesService: DesignTypesService) {}

  @Post()
  @Roles(...ADMIN_ROLES)
  async create(@Body() createDesignTypeDto: CreateDesignTypeDto) {
    const data = await this.designTypesService.create(createDesignTypeDto);
    return { success: true, data };
  }

  @Get()
  async findAll(
    @Query('branchId') branchId?: string,
    @Query('garmentTypeId') garmentTypeId?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.designTypesService.findAll(
      branchId,
      garmentTypeId,
      search,
    );
    return { success: true, data };
  }

  @Post('seed')
  @Roles(...SUPER_ADMIN_ONLY_ROLES)
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
  @Roles(...ADMIN_ROLES)
  async update(
    @Param('id') id: string,
    @Body() updateDesignTypeDto: UpdateDesignTypeDto,
  ) {
    const data = await this.designTypesService.update(id, updateDesignTypeDto);
    return { success: true, data };
  }

  @Delete(':id')
  @Roles(...ADMIN_ROLES)
  async remove(@Param('id') id: string) {
    await this.designTypesService.remove(id);
    return { success: true };
  }
}

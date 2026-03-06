import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { ConfigService } from './config.service';
import {
  CreateGarmentTypeDto,
  UpdateGarmentTypeDto,
} from './dto/garment-type.dto';
import {
  CreateMeasurementCategoryDto,
  UpdateMeasurementCategoryDto,
  CreateMeasurementSectionDto,
  UpdateMeasurementSectionDto,
  DeleteMeasurementSectionDto,
  CreateMeasurementFieldDto,
  UpdateMeasurementFieldDto,
} from './dto/measurement-category.dto';
import { UpdateSystemSettingsDto } from './dto/system-settings.dto';
import { UpdateGarmentWorkflowStepsDto } from './dto/workflow-step.dto';
import { Roles } from '../common/decorators/auth.decorators';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  ADMIN_ROLES,
  OPERATOR_ROLES,
  SUPER_ADMIN_ONLY_ROLES,
} from '@tbms/shared-constants';
import { success } from '../common/utils/response.util';

function parseBooleanQueryFlag(value?: string): boolean {
  if (!value) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true';
}

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Roles(...SUPER_ADMIN_ONLY_ROLES)
  @RequirePermissions('branches.read')
  @Get('branches')
  async getBranches() {
    const data = await this.configService.getBranches();
    return success(data);
  }

  // --- System Settings ---
  @Roles(...OPERATOR_ROLES)
  @RequirePermissions('settings.read')
  @Get('settings')
  async getSystemSettings() {
    const data = await this.configService.getSystemSettings();
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('system.manage')
  @Put('settings')
  async updateSystemSettings(@Body() dto: UpdateSystemSettingsDto) {
    const data = await this.configService.updateSystemSettings(dto);
    return success(data);
  }

  // --- Garment Types ---
  // Operators and above can read garment types; pricing remains branch-scoped via BranchGuard.
  @Roles(...OPERATOR_ROLES)
  @RequirePermissions('garments.read')
  @Get('garment-types')
  async getGarmentTypes(
    @Query() pagination: PaginationQueryDto,
    @Query('search') search?: string,
    @Query('includeArchived') includeArchived?: string,
  ) {
    const data = await this.configService.getGarmentTypes({
      search,
      page: pagination.page ?? 1,
      limit: pagination.limit ?? 10,
      includeArchived: parseBooleanQueryFlag(includeArchived),
    });
    return success(data);
  }

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions('garments.read')
  @Get('garment-types/:id')
  async getGarmentType(@Param('id') id: string) {
    const data = await this.configService.getGarmentType(id);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('garments.read')
  @Get('garment-stats')
  async getGarmentStats() {
    const data = await this.configService.getGarmentStats();
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('garments.manage')
  @Post('garment-types')
  async createGarmentType(@Body() dto: CreateGarmentTypeDto) {
    const data = await this.configService.createGarmentType(dto);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('garments.manage')
  @Put('garment-types/:id')
  async updateGarmentType(
    @Param('id') id: string,
    @Body() dto: UpdateGarmentTypeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.configService.updateGarmentType(
      id,
      dto,
      req.user.userId,
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('garments.read')
  @Get('garment-types/:id/history')
  async getGarmentPriceHistory(@Param('id') garmentTypeId: string) {
    const data = await this.configService.getGarmentPriceHistory(garmentTypeId);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('garments.manage')
  @Put('garment-types/:id/steps')
  async updateGarmentWorkflowSteps(
    @Param('id') garmentTypeId: string,
    @Body() dto: UpdateGarmentWorkflowStepsDto,
  ) {
    const data = await this.configService.updateGarmentWorkflowSteps(
      garmentTypeId,
      dto,
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('garments.manage')
  @Delete('garment-types/:id')
  async deleteGarmentType(
    @Param('id') id: string,
    @Query('preview') preview?: string,
  ) {
    const data = await this.configService.deleteGarmentType(
      id,
      parseBooleanQueryFlag(preview),
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('garments.manage')
  @Put('garment-types/:id/restore')
  async restoreGarmentType(@Param('id') id: string) {
    const data = await this.configService.restoreGarmentType(id);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('garments.manage')
  @Put('garment-types/:id/steps/:stepKey/restore')
  async restoreGarmentWorkflowStep(
    @Param('id') garmentTypeId: string,
    @Param('stepKey') stepKey: string,
  ) {
    const data = await this.configService.restoreGarmentWorkflowStep(
      garmentTypeId,
      stepKey,
    );
    return success(data);
  }

  // --- Measurement Categories ---
  @Roles(...OPERATOR_ROLES)
  @RequirePermissions('measurements.read')
  @Get('measurement-categories')
  async getMeasurementCategories(
    @Query() pagination: PaginationQueryDto,
    @Query('search') search?: string,
    @Query('includeArchived') includeArchived?: string,
  ) {
    const data = await this.configService.getMeasurementCategories({
      search,
      page: pagination.page ?? 1,
      limit: pagination.limit ?? 10,
      includeArchived: parseBooleanQueryFlag(includeArchived),
    });
    return success(data);
  }

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions('measurements.read')
  @Get('measurement-categories/:id')
  async getMeasurementCategory(
    @Param('id') id: string,
    @Query('includeArchived') includeArchived?: string,
  ) {
    const data = await this.configService.getMeasurementCategory(id, {
      includeArchived: parseBooleanQueryFlag(includeArchived),
    });
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('measurements.read')
  @Get('measurement-stats')
  async getMeasurementStats() {
    const data = await this.configService.getMeasurementStats();
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('measurements.manage')
  @Post('measurement-categories')
  async createMeasurementCategory(@Body() dto: CreateMeasurementCategoryDto) {
    const data = await this.configService.createMeasurementCategory(dto);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('measurements.manage')
  @Put('measurement-categories/:id')
  async updateMeasurementCategory(
    @Param('id') id: string,
    @Body() dto: UpdateMeasurementCategoryDto,
  ) {
    const data = await this.configService.updateMeasurementCategory(id, dto);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('measurements.manage')
  @Post('measurement-categories/:id/sections')
  async addMeasurementSection(
    @Param('id') categoryId: string,
    @Body() dto: CreateMeasurementSectionDto,
  ) {
    const data = await this.configService.addMeasurementSection(categoryId, dto);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('measurements.manage')
  @Put('measurement-sections/:id')
  async updateMeasurementSection(
    @Param('id') sectionId: string,
    @Body() dto: UpdateMeasurementSectionDto,
  ) {
    const data = await this.configService.updateMeasurementSection(sectionId, dto);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('measurements.manage')
  @Delete('measurement-sections/:id')
  async deleteMeasurementSection(
    @Param('id') sectionId: string,
    @Body() dto: DeleteMeasurementSectionDto,
    @Query('preview') preview?: string,
  ) {
    const data = await this.configService.deleteMeasurementSection(
      sectionId,
      dto,
      parseBooleanQueryFlag(preview),
    );
    return success(data);
  }

  // --- Measurement Fields ---
  @Roles(...ADMIN_ROLES)
  @RequirePermissions('measurements.manage')
  @Post('measurement-categories/:id/fields')
  async addMeasurementField(
    @Param('id') categoryId: string,
    @Body() dto: CreateMeasurementFieldDto,
  ) {
    const data = await this.configService.addMeasurementField(categoryId, dto);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('measurements.manage')
  @Put('measurement-fields/:id')
  async updateMeasurementField(
    @Param('id') id: string,
    @Body() dto: UpdateMeasurementFieldDto,
  ) {
    const data = await this.configService.updateMeasurementField(id, dto);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('measurements.manage')
  @Delete('measurement-fields/:id')
  async deleteMeasurementField(
    @Param('id') id: string,
    @Query('preview') preview?: string,
  ) {
    const data = await this.configService.deleteMeasurementField(
      id,
      parseBooleanQueryFlag(preview),
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('measurements.manage')
  @Put('measurement-fields/:id/restore')
  async restoreMeasurementField(@Param('id') id: string) {
    const data = await this.configService.restoreMeasurementField(id);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('measurements.manage')
  @Delete('measurement-categories/:id')
  async deleteMeasurementCategory(
    @Param('id') id: string,
    @Query('preview') preview?: string,
  ) {
    const data = await this.configService.deleteMeasurementCategory(
      id,
      parseBooleanQueryFlag(preview),
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('measurements.manage')
  @Put('measurement-categories/:id/restore')
  async restoreMeasurementCategory(@Param('id') id: string) {
    const data = await this.configService.restoreMeasurementCategory(id);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions('measurements.manage')
  @Put('measurement-sections/:id/restore')
  async restoreMeasurementSection(@Param('id') id: string) {
    const data = await this.configService.restoreMeasurementSection(id);
    return success(data);
  }
}

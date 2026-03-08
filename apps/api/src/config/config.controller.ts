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
import {
  ConfigIncludeArchivedQueryDto,
  ConfigListQueryDto,
  ConfigPreviewQueryDto,
} from './dto/config-query.dto';
import { Roles } from '../common/decorators/auth.decorators';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { ParseCuidPipe } from '../common/pipes/parse-cuid.pipe';
import {
  ADMIN_ROLES,
  OPERATOR_ROLES,
  SUPER_ADMIN_ONLY_ROLES,
  PERMISSION,
} from '@tbms/shared-constants';
import { success } from '../common/utils/response.util';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Roles(...SUPER_ADMIN_ONLY_ROLES)
  @RequirePermissions(PERMISSION['branches.read'])
  @Get('branches')
  async getBranches() {
    const data = await this.configService.getBranches();
    return success(data);
  }

  // --- System Settings ---
  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['settings.read'])
  @Get('settings')
  async getSystemSettings() {
    const data = await this.configService.getSystemSettings();
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['system.manage'])
  @Put('settings')
  async updateSystemSettings(@Body() dto: UpdateSystemSettingsDto) {
    const data = await this.configService.updateSystemSettings(dto);
    return success(data);
  }

  // --- Garment Types ---
  // Operators and above can read garment types; pricing remains branch-scoped via BranchGuard.
  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['garments.read'])
  @Get('garment-types')
  async getGarmentTypes(@Query() query: ConfigListQueryDto) {
    const data = await this.configService.getGarmentTypes({
      search: query.search,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      includeArchived: query.includeArchived ?? false,
    });
    return success(data);
  }

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['garments.read'])
  @Get('garment-types/:id')
  async getGarmentType(@Param('id', ParseCuidPipe) id: string) {
    const data = await this.configService.getGarmentType(id);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['garments.read'])
  @Get('garment-stats')
  async getGarmentStats() {
    const data = await this.configService.getGarmentStats();
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['garments.manage'])
  @Post('garment-types')
  async createGarmentType(@Body() dto: CreateGarmentTypeDto) {
    const data = await this.configService.createGarmentType(dto);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['garments.manage'])
  @Put('garment-types/:id')
  async updateGarmentType(
    @Param('id', ParseCuidPipe) id: string,
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
  @RequirePermissions(PERMISSION['garments.read'])
  @Get('garment-types/:id/history')
  async getGarmentPriceHistory(
    @Param('id', ParseCuidPipe) garmentTypeId: string,
  ) {
    const data = await this.configService.getGarmentPriceHistory(garmentTypeId);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['garments.manage'])
  @Put('garment-types/:id/steps')
  async updateGarmentWorkflowSteps(
    @Param('id', ParseCuidPipe) garmentTypeId: string,
    @Body() dto: UpdateGarmentWorkflowStepsDto,
  ) {
    const data = await this.configService.updateGarmentWorkflowSteps(
      garmentTypeId,
      dto,
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['garments.manage'])
  @Delete('garment-types/:id')
  async deleteGarmentType(
    @Param('id', ParseCuidPipe) id: string,
    @Query() query: ConfigPreviewQueryDto,
  ) {
    const data = await this.configService.deleteGarmentType(
      id,
      query.preview ?? false,
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['garments.manage'])
  @Put('garment-types/:id/restore')
  async restoreGarmentType(@Param('id', ParseCuidPipe) id: string) {
    const data = await this.configService.restoreGarmentType(id);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['garments.manage'])
  @Put('garment-types/:id/steps/:stepKey/restore')
  async restoreGarmentWorkflowStep(
    @Param('id', ParseCuidPipe) garmentTypeId: string,
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
  @RequirePermissions(PERMISSION['measurements.read'])
  @Get('measurement-categories')
  async getMeasurementCategories(@Query() query: ConfigListQueryDto) {
    const data = await this.configService.getMeasurementCategories({
      search: query.search,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      includeArchived: query.includeArchived ?? false,
    });
    return success(data);
  }

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['measurements.read'])
  @Get('measurement-categories/:id')
  async getMeasurementCategory(
    @Param('id', ParseCuidPipe) id: string,
    @Query() query: ConfigIncludeArchivedQueryDto,
  ) {
    const data = await this.configService.getMeasurementCategory(id, {
      includeArchived: query.includeArchived ?? false,
    });
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['measurements.read'])
  @Get('measurement-stats')
  async getMeasurementStats() {
    const data = await this.configService.getMeasurementStats();
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['measurements.manage'])
  @Post('measurement-categories')
  async createMeasurementCategory(@Body() dto: CreateMeasurementCategoryDto) {
    const data = await this.configService.createMeasurementCategory(dto);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['measurements.manage'])
  @Put('measurement-categories/:id')
  async updateMeasurementCategory(
    @Param('id', ParseCuidPipe) id: string,
    @Body() dto: UpdateMeasurementCategoryDto,
  ) {
    const data = await this.configService.updateMeasurementCategory(id, dto);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['measurements.manage'])
  @Post('measurement-categories/:id/sections')
  async addMeasurementSection(
    @Param('id', ParseCuidPipe) categoryId: string,
    @Body() dto: CreateMeasurementSectionDto,
  ) {
    const data = await this.configService.addMeasurementSection(
      categoryId,
      dto,
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['measurements.manage'])
  @Put('measurement-sections/:id')
  async updateMeasurementSection(
    @Param('id', ParseCuidPipe) sectionId: string,
    @Body() dto: UpdateMeasurementSectionDto,
  ) {
    const data = await this.configService.updateMeasurementSection(
      sectionId,
      dto,
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['measurements.manage'])
  @Delete('measurement-sections/:id')
  async deleteMeasurementSection(
    @Param('id', ParseCuidPipe) sectionId: string,
    @Body() dto: DeleteMeasurementSectionDto,
    @Query() query: ConfigPreviewQueryDto,
  ) {
    const data = await this.configService.deleteMeasurementSection(
      sectionId,
      dto,
      query.preview ?? false,
    );
    return success(data);
  }

  // --- Measurement Fields ---
  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['measurements.manage'])
  @Post('measurement-categories/:id/fields')
  async addMeasurementField(
    @Param('id', ParseCuidPipe) categoryId: string,
    @Body() dto: CreateMeasurementFieldDto,
  ) {
    const data = await this.configService.addMeasurementField(categoryId, dto);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['measurements.manage'])
  @Put('measurement-fields/:id')
  async updateMeasurementField(
    @Param('id', ParseCuidPipe) id: string,
    @Body() dto: UpdateMeasurementFieldDto,
  ) {
    const data = await this.configService.updateMeasurementField(id, dto);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['measurements.manage'])
  @Delete('measurement-fields/:id')
  async deleteMeasurementField(
    @Param('id', ParseCuidPipe) id: string,
    @Query() query: ConfigPreviewQueryDto,
  ) {
    const data = await this.configService.deleteMeasurementField(
      id,
      query.preview ?? false,
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['measurements.manage'])
  @Put('measurement-fields/:id/restore')
  async restoreMeasurementField(@Param('id', ParseCuidPipe) id: string) {
    const data = await this.configService.restoreMeasurementField(id);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['measurements.manage'])
  @Delete('measurement-categories/:id')
  async deleteMeasurementCategory(
    @Param('id', ParseCuidPipe) id: string,
    @Query() query: ConfigPreviewQueryDto,
  ) {
    const data = await this.configService.deleteMeasurementCategory(
      id,
      query.preview ?? false,
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['measurements.manage'])
  @Put('measurement-categories/:id/restore')
  async restoreMeasurementCategory(@Param('id', ParseCuidPipe) id: string) {
    const data = await this.configService.restoreMeasurementCategory(id);
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['measurements.manage'])
  @Put('measurement-sections/:id/restore')
  async restoreMeasurementSection(@Param('id', ParseCuidPipe) id: string) {
    const data = await this.configService.restoreMeasurementSection(id);
    return success(data);
  }
}

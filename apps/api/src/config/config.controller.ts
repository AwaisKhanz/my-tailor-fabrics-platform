import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { Controller, Get, Post, Body, Put, Param, Delete, Req, UseGuards, Query } from '@nestjs/common';
import { ConfigService } from './config.service';
import { CreateGarmentTypeDto, UpdateGarmentTypeDto } from './dto/garment-type.dto';
import { CreateMeasurementCategoryDto, UpdateMeasurementCategoryDto, CreateMeasurementFieldDto, UpdateMeasurementFieldDto } from './dto/measurement-category.dto';
import { UpdateSystemSettingsDto } from './dto/system-settings.dto';
import { UpdateGarmentWorkflowStepsDto } from './dto/workflow-step.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BranchGuard } from '../common/guards/branch.guard';
import { Roles } from '../common/decorators/auth.decorators';
import { Role } from '@tbms/shared-types';

@Controller('config')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Roles(Role.SUPER_ADMIN)
  @Get('branches')
  async getBranches() {
    const data = await this.configService.getBranches();
    return { success: true, data };
  }

  // --- System Settings ---
  @Get('settings')
  async getSystemSettings() {
    const data = await this.configService.getSystemSettings();
    return { success: true, data };
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Put('settings')
  async updateSystemSettings(@Body() dto: UpdateSystemSettingsDto) {
    const data = await this.configService.updateSystemSettings(dto);
    return { success: true, data };
  }

  // --- Garment Types ---
  // Any authenticated user can read garment types, but it resolves prices based on their active branch via header
  @Get('garment-types')
  async getGarmentTypes(
      @Query('search') search?: string,
      @Query('page') page?: string,
      @Query('limit') limit?: string
  ) {
    const data = await this.configService.getGarmentTypes({
        search,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10
    });
    return { success: true, data };
  }

  @Get('garment-types/:id')
  async getGarmentType(@Param('id') id: string) {
    const data = await this.configService.getGarmentType(id);
    return { success: true, data };
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('garment-stats')
  async getGarmentStats() {
    const data = await this.configService.getGarmentStats();
    return { success: true, data };
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('garment-types')
  async createGarmentType(@Body() dto: CreateGarmentTypeDto) {
    const data = await this.configService.createGarmentType(dto);
    return { success: true, data };
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put('garment-types/:id')
  async updateGarmentType(@Param('id') id: string, @Body() dto: UpdateGarmentTypeDto, @Req() req: AuthenticatedRequest) {
    const data = await this.configService.updateGarmentType(id, dto, req.user.userId);
    return { success: true, data };
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('garment-types/:id/history')
  async getGarmentPriceHistory(@Param('id') garmentTypeId: string) {
    const data = await this.configService.getGarmentPriceHistory(garmentTypeId);
    return { success: true, data };
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put('garment-types/:id/steps')
  async updateGarmentWorkflowSteps(@Param('id') garmentTypeId: string, @Body() dto: UpdateGarmentWorkflowStepsDto) {
    const data = await this.configService.updateGarmentWorkflowSteps(garmentTypeId, dto);
    return { success: true, data };
  }

  // --- Measurement Categories ---
  @Get('measurement-categories')
  async getMeasurementCategories(
      @Query('search') search?: string,
      @Query('page') page?: string,
      @Query('limit') limit?: string
  ) {
    const data = await this.configService.getMeasurementCategories({
        search,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10
    });
    return { success: true, data };
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('measurement-categories')
  async createMeasurementCategory(@Body() dto: CreateMeasurementCategoryDto) {
    const data = await this.configService.createMeasurementCategory(dto);
    return { success: true, data };
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put('measurement-categories/:id')
  async updateMeasurementCategory(@Param('id') id: string, @Body() dto: UpdateMeasurementCategoryDto) {
    const data = await this.configService.updateMeasurementCategory(id, dto);
    return { success: true, data };
  }

  // --- Measurement Fields ---
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('measurement-categories/:id/fields')
  async addMeasurementField(@Param('id') categoryId: string, @Body() dto: CreateMeasurementFieldDto) {
    const data = await this.configService.addMeasurementField(categoryId, dto);
    return { success: true, data };
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put('measurement-fields/:id')
  async updateMeasurementField(@Param('id') id: string, @Body() dto: UpdateMeasurementFieldDto) {
    const data = await this.configService.updateMeasurementField(id, dto);
    return { success: true, data };
  }

  // Soft delete requested in PRD, but schema does not have deletedAt for measurement field,
  // Using pure delete per PRD section "Soft delete field", maybe actually DELETE if schema lacks soft-delete?
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete('measurement-fields/:id')
  async deleteMeasurementField(@Param('id') id: string) {
    await this.configService.deleteMeasurementField(id);
    return { success: true };
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete('measurement-categories/:id')
  async deleteMeasurementCategory(@Param('id') id: string) {
    await this.configService.deleteMeasurementCategory(id);
    return { success: true };
  }
}

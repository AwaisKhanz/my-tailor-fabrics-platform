import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import { Controller, Get, Post, Body, Put, Param, Delete, Req, UseGuards, Query } from '@nestjs/common';
import { ConfigService } from './config.service';
import { CreateGarmentTypeDto, UpdateGarmentTypeDto, SetBranchPriceDto } from './dto/garment-type.dto';
import { CreateMeasurementCategoryDto, UpdateMeasurementCategoryDto, CreateMeasurementFieldDto, UpdateMeasurementFieldDto } from './dto/measurement-category.dto';
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

  // --- Garment Types ---
  // Any authenticated user can read garment types, but it resolves prices based on their active branch via header
  @Get('garment-types')
  async getGarmentTypes(
      @Req() req: AuthenticatedRequest, 
      @Query('search') search?: string,
      @Query('page') page?: string,
      @Query('limit') limit?: string,
      @Query('branchId') branchIdQuery?: string
  ) {
    // req.branchId is set by BranchGuard. Note SuperAdmins can optionally bypass this
    // If branchId is explicitly passed in query, use that instead of the guard's one
    const activeBranchId = branchIdQuery || req.branchId;
    
    const data = await this.configService.getGarmentTypes({
        branchId: activeBranchId,
        search,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10
    });
    return { success: true, data };
  }

  @Get('garment-types/:id')
  async getGarmentType(@Param('id') id: string, @Req() req: AuthenticatedRequest, @Query('branchId') branchIdQuery?: string) {
    const activeBranchId = branchIdQuery || req.branchId;
    const data = await this.configService.getGarmentType(id, activeBranchId);
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
  async updateGarmentType(@Param('id') id: string, @Body() dto: UpdateGarmentTypeDto) {
    const data = await this.configService.updateGarmentType(id, dto);
    return { success: true, data };
  }

  // --- Branch Price Overrides ---
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('garment-types/:id/branch-prices')
  async getBranchPrices(@Param('id') garmentTypeId: string) {
    const data = await this.configService.getBranchPrices(garmentTypeId);
    return { success: true, data };
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put('garment-types/:id/branch-prices')
  async setBranchPrice(@Param('id') garmentTypeId: string, @Body() body: SetBranchPriceDto, @Req() req: AuthenticatedRequest) {
    const data = await this.configService.setBranchPrice(garmentTypeId, req.branchId, body, req.user.userId);
    return { success: true, data };
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete('garment-types/:id/branch-prices')
  async deleteBranchPrice(@Param('id') garmentTypeId: string, @Req() req: AuthenticatedRequest) {
    await this.configService.deleteBranchPrice(garmentTypeId, req.branchId, req.user.userId);
    return { success: true };
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('garment-types/:id/history')
  async getBranchPriceHistory(@Param('id') garmentTypeId: string, @Req() req: AuthenticatedRequest) {
    const data = await this.configService.getBranchPriceHistory(garmentTypeId, req.branchId);
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

import * as express from 'express';
import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ReceiptService } from './receipt.service';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AddPaymentDto } from './dto/add-payment.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BranchGuard } from '../common/guards/branch.guard';
import { Roles } from '../common/decorators/auth.decorators';
import {
  ADMIN_ROLES,
  DASHBOARD_READ_ROLES,
  OPERATOR_ROLES,
} from '@tbms/shared-constants';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly receiptService: ReceiptService,
  ) {}

  @Roles(...OPERATOR_ROLES)
  @Post()
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.ordersService.create(
      createOrderDto,
      req.branchId,
      req.user.userId,
      req.user.role,
    );
    return { success: true, data };
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('status') status: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('employeeId') employeeId: string,
    @Query('search') search: string,
    @Query('sortBy') sortBy: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc',
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.ordersService.findAll(
      req.branchId,
      Number(page) || 1,
      Number(limit) || 20,
      { status, from, to, employeeId, search, sortBy, sortOrder },
    );
    return { success: true, data };
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @Get('summary')
  async getSummary(
    @Query('status') status: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('employeeId') employeeId: string,
    @Query('search') search: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.ordersService.getSummary(req.branchId, {
      status,
      from,
      to,
      employeeId,
      search,
    });
    return { success: true, data };
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const data = await this.ordersService.findOne(id, req.branchId);
    return { success: true, data };
  }

  @Roles(...OPERATOR_ROLES)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.ordersService.update(
      id,
      req.branchId,
      dto,
      req.user.role,
    );
    return { success: true, data };
  }
  @Roles(...ADMIN_ROLES)
  @Delete(':id')
  async cancel(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const data = await this.ordersService.cancelOrder(
      id,
      req.branchId,
      req.user.userId,
    );
    return { success: true, data };
  }

  @Roles(...OPERATOR_ROLES)
  @Post(':id/items')
  async addItem(
    @Param('id') id: string,
    @Body() dto: OrderItemDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.ordersService.addItem(id, req.branchId, dto);
    return { success: true, data };
  }

  @Roles(...OPERATOR_ROLES)
  @Patch(':id/items/:itemId')
  async updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: { status?: string; employeeId?: string },
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.ordersService.updateItem(
      id,
      itemId,
      req.branchId,
      dto,
    );
    return { success: true, data };
  }

  @Roles(...ADMIN_ROLES)
  @Delete(':id/items/:itemId')
  async removeItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.ordersService.removeItem(id, itemId, req.branchId);
    return { success: true };
  }

  @Roles(...OPERATOR_ROLES)
  @Post(':id/payment')
  async addPayment(
    @Param('id') id: string,
    @Body() addPaymentDto: AddPaymentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.ordersService.addPayment(
      id,
      req.branchId,
      addPaymentDto,
      req.user.userId,
    );
    return { success: true, data };
  }

  @Roles(...OPERATOR_ROLES)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.ordersService.updateStatus(
      id,
      req.branchId,
      updateStatusDto,
      req.user.userId,
    );
    return { success: true, data };
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @Get(':id/receipt')
  async getReceipt(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: express.Response,
  ) {
    const stream = await this.receiptService.generateOrderReceipt(
      id,
      req.branchId,
    );
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=receipt-${id}.pdf`,
    });
    stream.pipe(res);
  }

  /** Generate/regenerate a shareable public link + PIN for the customer */
  @Roles(...OPERATOR_ROLES)
  @Post(':id/share')
  async shareOrder(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const data = await this.ordersService.generateShareLink(id, req.branchId);
    return { success: true, data };
  }
}

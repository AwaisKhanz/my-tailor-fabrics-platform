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
  Delete,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ReceiptService } from './receipt.service';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';
import {
  UpdateOrderDto,
  UpdateOrderItemAssignmentDto,
} from './dto/update-order.dto';
import { AddPaymentDto, ReverseOrderPaymentDto } from './dto/add-payment.dto';
import {
  OrdersListQueryDto,
  OrdersSummaryQueryDto,
} from './dto/order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';
import { Roles } from '../common/decorators/auth.decorators';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { ParseCuidPipe } from '../common/pipes/parse-cuid.pipe';
import { requireBranchScope } from '../common/utils/branch-scope.util';
import { success, successOnly } from '../common/utils/response.util';
import {
  ADMIN_ROLES,
  DASHBOARD_READ_ROLES,
  OPERATOR_ROLES,
  PERMISSION,
} from '@tbms/shared-constants';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly receiptService: ReceiptService,
  ) {}

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['orders.create'])
  @Post()
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.ordersService.create(
      createOrderDto,
      requireBranchScope(req),
      req.user.userId,
      req.user.role,
    );
    return success(data);
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @RequirePermissions(PERMISSION['orders.read'])
  @Get()
  async findAll(
    @Query() query: OrdersListQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.ordersService.findAll(
      req.branchId,
      query.page ?? 1,
      query.limit ?? 20,
      {
        status: query.status,
        from: query.from,
        to: query.to,
        employeeId: query.employeeId,
        search: query.search,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      },
    );
    return success(data);
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @RequirePermissions(PERMISSION['orders.read'])
  @Get('summary')
  async getSummary(
    @Query() query: OrdersSummaryQueryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.ordersService.getSummary(req.branchId, {
      status: query.status,
      from: query.from,
      to: query.to,
      employeeId: query.employeeId,
      search: query.search,
    });
    return success(data);
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @RequirePermissions(PERMISSION['orders.read'])
  @Get(':id')
  async findOne(
    @Param('id', ParseCuidPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.ordersService.findOne(id, req.branchId);
    return success(data);
  }

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['orders.update'])
  @Patch(':id')
  async update(
    @Param('id', ParseCuidPipe) id: string,
    @Body() dto: UpdateOrderDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.ordersService.update(
      id,
      requireBranchScope(req),
      dto,
      req.user.role,
    );
    return success(data);
  }
  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['orders.cancel'])
  @Delete(':id')
  async cancel(
    @Param('id', ParseCuidPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.ordersService.cancelOrder(
      id,
      requireBranchScope(req),
      req.user.userId,
    );
    return success(data);
  }

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['orderItems.manage'])
  @Post(':id/items')
  async addItem(
    @Param('id', ParseCuidPipe) id: string,
    @Body() dto: OrderItemDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.ordersService.addItem(
      id,
      requireBranchScope(req),
      dto,
    );
    return success(data);
  }

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['orderItems.manage'])
  @Patch(':id/items/:itemId')
  async updateItem(
    @Param('id', ParseCuidPipe) id: string,
    @Param('itemId', ParseCuidPipe) itemId: string,
    @Body() dto: UpdateOrderItemAssignmentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.ordersService.updateItem(
      id,
      itemId,
      requireBranchScope(req),
      dto,
    );
    return success(data);
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['orderItems.manage'])
  @Delete(':id/items/:itemId')
  async removeItem(
    @Param('id', ParseCuidPipe) id: string,
    @Param('itemId', ParseCuidPipe) itemId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.ordersService.removeItem(id, itemId, requireBranchScope(req));
    return successOnly();
  }

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['payments.manage'])
  @Post(':id/payment')
  async addPayment(
    @Param('id', ParseCuidPipe) id: string,
    @Body() addPaymentDto: AddPaymentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.ordersService.addPayment(
      id,
      requireBranchScope(req),
      addPaymentDto,
      req.user.userId,
    );
    return success(data);
  }

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['payments.manage'])
  @Post(':id/payments/:paymentId/reverse')
  async reversePayment(
    @Param('id', ParseCuidPipe) id: string,
    @Param('paymentId', ParseCuidPipe) paymentId: string,
    @Body() dto: ReverseOrderPaymentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.ordersService.reversePayment(
      id,
      paymentId,
      requireBranchScope(req),
      req.user.userId,
      dto.note,
    );
    return success(data);
  }

  @Roles(...OPERATOR_ROLES)
  @RequirePermissions(PERMISSION['orders.update'])
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseCuidPipe) id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.ordersService.updateStatus(
      id,
      requireBranchScope(req),
      updateStatusDto,
      req.user.userId,
    );
    return success(data);
  }

  @Roles(...DASHBOARD_READ_ROLES)
  @RequirePermissions(PERMISSION['orders.receipt'])
  @Get(':id/receipt')
  async getReceipt(
    @Param('id', ParseCuidPipe) id: string,
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
  @RequirePermissions(PERMISSION['orders.share'])
  @Post(':id/share')
  async shareOrder(
    @Param('id', ParseCuidPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.ordersService.generateShareLink(
      id,
      requireBranchScope(req),
    );
    return success(data);
  }
}

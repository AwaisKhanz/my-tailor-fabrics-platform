import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ReceiptService } from './receipt.service';

@Module({
  providers: [OrdersService, ReceiptService],
  controllers: [OrdersController]
})
export class OrdersModule {}

import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { Public } from '../common/decorators/auth.decorators';
import { OrdersService } from './orders.service';

@Controller('status')
export class StatusController {
  constructor(private readonly ordersService: OrdersService) {}

  @Public()
  @Get(':token')
  async getStatus(@Param('token') token: string, @Query('pin') pin?: string) {
    if (!pin || !/^\d{4}$/.test(pin)) {
      throw new BadRequestException('A valid 4-digit pin is required');
    }

    const data = await this.ordersService.getPublicOrderStatus(token, pin);
    return { success: true, data };
  }
}

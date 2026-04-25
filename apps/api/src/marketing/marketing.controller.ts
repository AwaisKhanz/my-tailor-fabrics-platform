import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../common/decorators/auth.decorators';
import { success } from '../common/utils/response.util';
import { MarketingService } from './marketing.service';
import { CreateContactInquiryDto } from './dto/create-contact-inquiry.dto';

@Controller('public')
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: 6,
      ttl: 60_000,
      blockDuration: 300_000,
    },
  })
  @Post('contact')
  async submitContactInquiry(@Body() dto: CreateContactInquiryDto) {
    const result = await this.marketingService.submitContactInquiry(dto);

    return success({
      message: 'Inquiry received successfully.',
      ...result,
    });
  }
}

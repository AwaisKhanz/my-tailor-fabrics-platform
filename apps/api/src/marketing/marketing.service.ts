import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { CreateContactInquiryDto } from './dto/create-contact-inquiry.dto';
import { buildMarketingInquiryTemplate } from '../mail/templates';

@Injectable()
export class MarketingService {
  private readonly logger = new Logger(MarketingService.name);

  constructor(private readonly mailService: MailService) {}

  async submitContactInquiry(dto: CreateContactInquiryDto) {
    const payload = {
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      service: dto.service,
      message: dto.message,
      receivedAt: new Date().toISOString(),
    } as const;

    const mailStatus = this.mailService.getStatus();
    const inbox = mailStatus.senderEmail;

    if (!mailStatus.ready || !inbox) {
      this.logger.warn(
        `Marketing inquiry accepted without active mail delivery: ${JSON.stringify(payload)}`,
      );

      return {
        accepted: true,
        delivered: false,
      };
    }

    await this.mailService.sendTemplate(
      inbox,
      buildMarketingInquiryTemplate({
        name: payload.name,
        phone: payload.phone,
        email: payload.email,
        service: payload.service,
        message: payload.message,
        receivedAt: payload.receivedAt,
      }),
    );

    return {
      accepted: true,
      delivered: true,
    };
  }
}

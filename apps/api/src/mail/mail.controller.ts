import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { Roles } from '../common/decorators/auth.decorators';
import { isPublicMailEndpointsEnabled } from '../common/env';
import { SUPER_ADMIN_ONLY_ROLES } from '@tbms/shared-constants';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  private assertPublicAccessEnabled() {
    if (!isPublicMailEndpointsEnabled()) {
      throw new ForbiddenException(
        'Public mail endpoints are disabled in this environment',
      );
    }
  }

  @Roles(...SUPER_ADMIN_ONLY_ROLES)
  @Get('auth-url')
  getAuthUrl() {
    this.assertPublicAccessEnabled();
    try {
      const url = this.mailService.getAuthUrl();
      return {
        success: true,
        message:
          'Visit this URL to generate an authorization code, then exchange that code in the OAuth2 Playground for a Refresh Token.',
        url,
      };
    } catch (error: unknown) {
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  @Roles(...SUPER_ADMIN_ONLY_ROLES)
  @Post('test')
  async sendTestMail(@Body() dto: { to: string }) {
    this.assertPublicAccessEnabled();
    if (!dto.to) {
      throw new BadRequestException('Please provide a "to" email address.');
    }

    try {
      const result = await this.mailService.sendMail(
        dto.to,
        'My Tailor & Fabrics - Test Email',
        'Hello! This is a test email sent from the Gmail API integration using OAuth2 in NestJS.',
        '<h3>Hello!</h3><p>This is a test email sent from the <strong>Gmail API</strong> integration using OAuth2 in NestJS.</p>',
      );
      return {
        success: true,
        message: 'Test email sent successfully!',
        result,
      };
    } catch (error: unknown) {
      throw new InternalServerErrorException((error as Error).message);
    }
  }
}

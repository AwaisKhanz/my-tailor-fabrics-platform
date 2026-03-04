import {
  Controller,
  Get,
  Post,
  Body,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { Roles } from '../common/decorators/auth.decorators';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { isPublicMailEndpointsEnabled } from '../common/env';
import { success, successSpread } from '../common/utils/response.util';
import { SUPER_ADMIN_ONLY_ROLES } from '@tbms/shared-constants';
import { SendTestMailDto } from './dto/send-test-mail.dto';

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
  @RequirePermissions('mail.manage')
  @Get('status')
  getStatus() {
    const data = this.mailService.getStatus();
    return success(data);
  }

  @Roles(...SUPER_ADMIN_ONLY_ROLES)
  @RequirePermissions('mail.manage')
  @Get('auth-url')
  getAuthUrl() {
    this.assertPublicAccessEnabled();
    try {
      const url = this.mailService.getAuthUrl();
      return successSpread({
        message:
          'Visit this URL to generate an authorization code, then exchange that code in the OAuth2 Playground for a Refresh Token.',
        url,
      });
    } catch (error: unknown) {
      throw new InternalServerErrorException((error as Error).message);
    }
  }

  @Roles(...SUPER_ADMIN_ONLY_ROLES)
  @RequirePermissions('mail.manage')
  @Post('test')
  async sendTestMail(@Body() dto: SendTestMailDto) {
    this.assertPublicAccessEnabled();

    try {
      const result = await this.mailService.sendMail(
        dto.to,
        'My Tailor & Fabrics - Test Email',
        'Hello! This is a test email sent from the Gmail API integration using OAuth2 in NestJS.',
        '<h3>Hello!</h3><p>This is a test email sent from the <strong>Gmail API</strong> integration using OAuth2 in NestJS.</p>',
      );
      return successSpread({
        message: 'Test email sent successfully!',
        result,
      });
    } catch (error: unknown) {
      throw new InternalServerErrorException((error as Error).message);
    }
  }
}

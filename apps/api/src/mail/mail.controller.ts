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
import { success } from '../common/utils/response.util';
import { SUPER_ADMIN_ONLY_ROLES, PERMISSION } from '@tbms/shared-constants';
import { SendTestMailDto } from './dto/send-test-mail.dto';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return 'Unexpected mail integration error';
  }

  private assertPublicAccessEnabled() {
    if (!isPublicMailEndpointsEnabled()) {
      throw new ForbiddenException(
        'Public mail endpoints are disabled in this environment',
      );
    }
  }

  @Roles(...SUPER_ADMIN_ONLY_ROLES)
  @RequirePermissions(PERMISSION['mail.manage'])
  @Get('status')
  getStatus() {
    const data = this.mailService.getStatus();
    return success(data);
  }

  @Roles(...SUPER_ADMIN_ONLY_ROLES)
  @RequirePermissions(PERMISSION['mail.manage'])
  @Get('auth-url')
  getAuthUrl() {
    this.assertPublicAccessEnabled();
    try {
      const url = this.mailService.getAuthUrl();
      return success({
        message:
          'Visit this URL to generate an authorization code, then exchange that code in the OAuth2 Playground for a Refresh Token.',
        url,
      });
    } catch (error: unknown) {
      throw new InternalServerErrorException(this.resolveErrorMessage(error));
    }
  }

  @Roles(...SUPER_ADMIN_ONLY_ROLES)
  @RequirePermissions(PERMISSION['mail.manage'])
  @Post('test')
  async sendTestMail(@Body() dto: SendTestMailDto): Promise<unknown> {
    this.assertPublicAccessEnabled();

    try {
      const result = await this.mailService.sendMail(
        dto.to,
        'My Tailor & Fabrics - Test Email',
        'Hello! This is a test email sent from the Gmail API integration using OAuth2 in NestJS.',
        '<h3>Hello!</h3><p>This is a test email sent from the <strong>Gmail API</strong> integration using OAuth2 in NestJS.</p>',
      );
      return success({
        message: 'Test email sent successfully!',
        result,
      });
    } catch (error: unknown) {
      throw new InternalServerErrorException(this.resolveErrorMessage(error));
    }
  }
}

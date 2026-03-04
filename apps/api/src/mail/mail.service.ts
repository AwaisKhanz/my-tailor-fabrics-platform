import { Injectable, Logger } from '@nestjs/common';
import { google, Auth, gmail_v1 } from 'googleapis';
import { isPublicMailEndpointsEnabled } from '../common/env';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private oAuth2Client: Auth.OAuth2Client | null = null;
  private gmailClient: gmail_v1.Gmail | null = null;
  private senderEmail: string | undefined;

  constructor() {
    this.initGmailClient();
  }

  getStatus() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    const senderEmail = process.env.GOOGLE_EMAIL;
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI ||
      'https://developers.google.com/oauthplayground';

    return {
      publicEndpointsEnabled: isPublicMailEndpointsEnabled(),
      ready: Boolean(this.gmailClient),
      senderEmail,
      redirectUri,
      configured: {
        clientId: Boolean(clientId),
        clientSecret: Boolean(clientSecret),
        refreshToken: Boolean(refreshToken),
        senderEmail: Boolean(senderEmail),
      },
    };
  }

  private initGmailClient() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    this.senderEmail = process.env.GOOGLE_EMAIL;

    if (!clientId || !clientSecret) {
      this.logger.warn(
        'Google Client ID or Secret missing. Mail wrapper disabled.',
      );
      return;
    }

    // Google OAuth2 Client to generate URLs if refresh token is missing
    this.oAuth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      process.env.GOOGLE_REDIRECT_URI ||
        'https://developers.google.com/oauthplayground',
    );

    if (refreshToken && this.senderEmail) {
      try {
        this.oAuth2Client.setCredentials({ refresh_token: refreshToken });

        // Initialize the official Gmail REST API client
        this.gmailClient = google.gmail({
          version: 'v1',
          auth: this.oAuth2Client,
        });

        this.logger.log(
          `Mail service fully initialized via official Gmail API for ${this.senderEmail}`,
        );
      } catch (err) {
        this.logger.error('Failed to initialize Gmail Client', err);
      }
    } else {
      this.logger.warn(
        'GOOGLE_REFRESH_TOKEN or GOOGLE_EMAIL missing. You cannot send emails yet.',
      );
    }
  }

  getAuthUrl(): string {
    if (!this.oAuth2Client)
      throw new Error(
        'OAuth2 Client not initialized because ID/Secret missing',
      );
    return this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://mail.google.com/'],
    });
  }

  /**
   * Encodes a string into Base64URL format (required by Gmail API)
   * Replacing '+' with '-', '/' with '_', and removing padding '='
   */
  private encodeBase64Url(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Constructs an RFC 2822 formatted email message
   */
  private createRawMessage(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): string {
    const boundary = `----=_NextPart_${Date.now()}`;
    const date = new Date().toUTCString();

    let message =
      `From: My Tailor & Fabrics <${this.senderEmail}>\n` +
      `To: ${to}\n` +
      `Subject: ${subject}\n` +
      `Date: ${date}\n` +
      `MIME-Version: 1.0\n`;

    if (html) {
      message +=
        `Content-Type: multipart/alternative; boundary="${boundary}"\n\n` +
        `--${boundary}\n` +
        `Content-Type: text/plain; charset="UTF-8"\n\n` +
        `${text}\n\n` +
        `--${boundary}\n` +
        `Content-Type: text/html; charset="UTF-8"\n\n` +
        `${html}\n\n` +
        `--${boundary}--`;
    } else {
      message += `Content-Type: text/plain; charset="UTF-8"\n\n` + `${text}`;
    }

    return message;
  }

  async sendMail(to: string, subject: string, text: string, html?: string) {
    if (!this.gmailClient) {
      throw new Error(
        'Gmail client is not fully initialized. Ensure GOOGLE_REFRESH_TOKEN and GOOGLE_EMAIL are set in .env.',
      );
    }

    // 1. Construct the raw RFC 2822 email string
    const rawMessage = this.createRawMessage(to, subject, text, html);

    // 2. Encode to base64url format
    const encodedMessage = this.encodeBase64Url(rawMessage);

    // 3. Send using the official Google API REST endpoint
    return this.gmailClient.users.messages.send({
      userId: 'me', // Special value meaning "the authenticated user"
      requestBody: {
        raw: encodedMessage,
      },
    });
  }
}

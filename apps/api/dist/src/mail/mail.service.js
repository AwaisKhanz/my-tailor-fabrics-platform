"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const googleapis_1 = require("googleapis");
let MailService = MailService_1 = class MailService {
    logger = new common_1.Logger(MailService_1.name);
    oAuth2Client = null;
    gmailClient = null;
    senderEmail;
    constructor() {
        this.initGmailClient();
    }
    initGmailClient() {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
        this.senderEmail = process.env.GOOGLE_EMAIL;
        if (!clientId || !clientSecret) {
            this.logger.warn('Google Client ID or Secret missing. Mail wrapper disabled.');
            return;
        }
        this.oAuth2Client = new googleapis_1.google.auth.OAuth2(clientId, clientSecret, process.env.GOOGLE_REDIRECT_URI ||
            'https://developers.google.com/oauthplayground');
        if (refreshToken && this.senderEmail) {
            try {
                this.oAuth2Client.setCredentials({ refresh_token: refreshToken });
                this.gmailClient = googleapis_1.google.gmail({
                    version: 'v1',
                    auth: this.oAuth2Client,
                });
                this.logger.log(`Mail service fully initialized via official Gmail API for ${this.senderEmail}`);
            }
            catch (err) {
                this.logger.error('Failed to initialize Gmail Client', err);
            }
        }
        else {
            this.logger.warn('GOOGLE_REFRESH_TOKEN or GOOGLE_EMAIL missing. You cannot send emails yet.');
        }
    }
    getAuthUrl() {
        if (!this.oAuth2Client)
            throw new Error('OAuth2 Client not initialized because ID/Secret missing');
        return this.oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: ['https://mail.google.com/'],
        });
    }
    encodeBase64Url(str) {
        return Buffer.from(str)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }
    createRawMessage(to, subject, text, html) {
        const boundary = `----=_NextPart_${Date.now()}`;
        const date = new Date().toUTCString();
        let message = `From: My Tailor & Fabrics <${this.senderEmail}>\n` +
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
        }
        else {
            message += `Content-Type: text/plain; charset="UTF-8"\n\n` + `${text}`;
        }
        return message;
    }
    async sendMail(to, subject, text, html) {
        if (!this.gmailClient) {
            throw new Error('Gmail client is not fully initialized. Ensure GOOGLE_REFRESH_TOKEN and GOOGLE_EMAIL are set in .env.');
        }
        const rawMessage = this.createRawMessage(to, subject, text, html);
        const encodedMessage = this.encodeBase64Url(rawMessage);
        return this.gmailClient.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage,
            },
        });
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MailService);
//# sourceMappingURL=mail.service.js.map
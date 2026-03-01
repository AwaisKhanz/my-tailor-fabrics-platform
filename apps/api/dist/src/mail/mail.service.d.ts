import { gmail_v1 } from 'googleapis';
export declare class MailService {
    private readonly logger;
    private oAuth2Client;
    private gmailClient;
    private senderEmail;
    constructor();
    private initGmailClient;
    getAuthUrl(): string;
    private encodeBase64Url;
    private createRawMessage;
    sendMail(to: string, subject: string, text: string, html?: string): Promise<import("googleapis-common").GaxiosResponseWithHTTP2<gmail_v1.Schema$Message>>;
}

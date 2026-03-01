import { MailService } from './mail.service';
export declare class MailController {
    private readonly mailService;
    constructor(mailService: MailService);
    getAuthUrl(): {
        success: boolean;
        message: string;
        url: string;
    };
    sendTestMail(dto: {
        to: string;
    }): Promise<{
        success: boolean;
        message: string;
        result: import("googleapis-common").GaxiosResponseWithHTTP2<import("googleapis").gmail_v1.Schema$Message>;
    }>;
}

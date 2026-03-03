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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailController = void 0;
const common_1 = require("@nestjs/common");
const mail_service_1 = require("./mail.service");
const auth_decorators_1 = require("../common/decorators/auth.decorators");
const env_1 = require("../common/env");
let MailController = class MailController {
    mailService;
    constructor(mailService) {
        this.mailService = mailService;
    }
    assertPublicAccessEnabled() {
        if (!(0, env_1.isPublicMailEndpointsEnabled)()) {
            throw new common_1.ForbiddenException('Public mail endpoints are disabled in this environment');
        }
    }
    getAuthUrl() {
        this.assertPublicAccessEnabled();
        try {
            const url = this.mailService.getAuthUrl();
            return {
                success: true,
                message: 'Visit this URL to generate an authorization code, then exchange that code in the OAuth2 Playground for a Refresh Token.',
                url,
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async sendTestMail(dto) {
        this.assertPublicAccessEnabled();
        if (!dto.to) {
            throw new common_1.BadRequestException('Please provide a "to" email address.');
        }
        try {
            const result = await this.mailService.sendMail(dto.to, 'My Tailor & Fabrics - Test Email', 'Hello! This is a test email sent from the Gmail API integration using OAuth2 in NestJS.', '<h3>Hello!</h3><p>This is a test email sent from the <strong>Gmail API</strong> integration using OAuth2 in NestJS.</p>');
            return {
                success: true,
                message: 'Test email sent successfully!',
                result,
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
};
exports.MailController = MailController;
__decorate([
    (0, auth_decorators_1.Public)(),
    (0, common_1.Get)('auth-url'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MailController.prototype, "getAuthUrl", null);
__decorate([
    (0, auth_decorators_1.Public)(),
    (0, common_1.Post)('test'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MailController.prototype, "sendTestMail", null);
exports.MailController = MailController = __decorate([
    (0, common_1.Controller)('mail'),
    __metadata("design:paramtypes", [mail_service_1.MailService])
], MailController);
//# sourceMappingURL=mail.controller.js.map
export interface MailIntegrationStatus {
    publicEndpointsEnabled: boolean;
    ready: boolean;
    senderEmail?: string;
    redirectUri?: string;
    configured: {
        clientId: boolean;
        clientSecret: boolean;
        refreshToken: boolean;
        senderEmail: boolean;
    };
}
export interface SendTestMailInput {
    to: string;
}
export interface MailAuthUrlResponse {
    message: string;
    url: string;
}
export interface MailTestResponse {
    message: string;
}

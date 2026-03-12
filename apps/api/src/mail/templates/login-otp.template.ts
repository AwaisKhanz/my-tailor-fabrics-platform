import type { MailTemplatePayload } from './types';
import {
  buildBrandedHtmlTemplate,
  buildBrandedTextTemplate,
} from './layout';

export interface LoginOtpTemplateInput {
  otpCode: string;
  expiresInMinutes: number;
}

export function buildLoginOtpTemplate(
  input: LoginOtpTemplateInput,
): MailTemplatePayload {
  const subject = 'Your My Tailor & Fabrics verification code';

  const templateInput = {
    preheader: `Your login verification code is ${input.otpCode}.`,
    title: 'Login Verification Required',
    subtitle: 'Use the one-time verification code below to complete sign in.',
    calloutLabel: 'Verification Code',
    calloutValue: input.otpCode,
    bodyParagraphs: [
      `This code expires in ${input.expiresInMinutes} minute${input.expiresInMinutes > 1 ? 's' : ''}.`,
      'If you did not request this login, please contact support immediately.',
    ],
    footerNote:
      'For your security, never share this code with anyone.',
  } as const;

  return {
    subject,
    text: buildBrandedTextTemplate(templateInput),
    html: buildBrandedHtmlTemplate(templateInput),
  };
}


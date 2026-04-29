import type { MailTemplatePayload } from './types';
import { buildBrandedHtmlTemplate, buildBrandedTextTemplate } from './layout';

export function buildTestMailTemplate(): MailTemplatePayload {
  const subject = 'My Tailor & Fabrics - Mail Integration Test';
  const templateInput = {
    preheader: 'Mail integration test was triggered successfully.',
    title: 'Mail Integration Test',
    subtitle: 'Your Gmail API integration is configured and sending messages.',
    bodyParagraphs: [
      'This is a test email from My Tailor & Fabrics.',
      'If you received this message, your sender credentials and transport are working correctly.',
    ],
    footerNote:
      'You can now use this channel for OTP and operational notifications.',
  } as const;

  return {
    subject,
    text: buildBrandedTextTemplate(templateInput),
    html: buildBrandedHtmlTemplate(templateInput),
  };
}

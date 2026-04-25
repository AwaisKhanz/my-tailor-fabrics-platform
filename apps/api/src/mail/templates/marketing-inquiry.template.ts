import type { MailTemplatePayload } from './types';
import {
  buildBrandedHtmlTemplate,
  buildBrandedTextTemplate,
} from './layout';

export interface MarketingInquiryTemplateInput {
  name: string;
  phone: string;
  email?: string;
  service?: string;
  message: string;
  receivedAt: string;
}

export function buildMarketingInquiryTemplate(
  input: MarketingInquiryTemplateInput,
): MailTemplatePayload {
  const serviceLine = input.service ? `Service requested: ${input.service}.` : 'Service requested: Not specified.';
  const emailLine = input.email ? `Email: ${input.email}.` : 'Email: Not provided.';
  const subject = input.service
    ? `New tailoring inquiry: ${input.service}`
    : 'New tailoring inquiry from website';

  const templateInput = {
    preheader: `New public inquiry from ${input.name}.`,
    title: 'New Website Inquiry',
    subtitle: 'A new tailoring inquiry was submitted on the marketing site.',
    calloutLabel: 'Customer Phone',
    calloutValue: input.phone,
    bodyParagraphs: [
      `Customer: ${input.name}.`,
      emailLine,
      serviceLine,
      `Received at: ${input.receivedAt}.`,
      `Message: ${input.message}`,
    ],
    footerNote:
      'Follow up with the customer through WhatsApp or direct contact as soon as possible.',
  } as const;

  return {
    subject,
    text: buildBrandedTextTemplate(templateInput),
    html: buildBrandedHtmlTemplate(templateInput),
  };
}

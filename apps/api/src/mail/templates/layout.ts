import { MY_TAILOR_MAIL_THEME } from './theme';

export interface BrandedMailTemplateInput {
  preheader: string;
  title: string;
  subtitle: string;
  bodyParagraphs: readonly string[];
  calloutLabel?: string;
  calloutValue?: string;
  footerNote?: string;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function buildBrandedTextTemplate(
  input: BrandedMailTemplateInput,
): string {
  const lines: string[] = [
    'My Tailor & Fabrics',
    '',
    input.title,
    input.subtitle,
  ];

  if (input.calloutLabel && input.calloutValue) {
    lines.push('', `${input.calloutLabel}: ${input.calloutValue}`);
  }

  for (const paragraph of input.bodyParagraphs) {
    lines.push('', paragraph);
  }

  if (input.footerNote) {
    lines.push('', input.footerNote);
  }

  lines.push('', 'My Tailor & Fabrics');

  return lines.join('\n');
}

export function buildBrandedHtmlTemplate(
  input: BrandedMailTemplateInput,
): string {
  const theme = MY_TAILOR_MAIL_THEME;
  const safeTitle = escapeHtml(input.title);
  const safeSubtitle = escapeHtml(input.subtitle);
  const safePreheader = escapeHtml(input.preheader);
  const safeParagraphs = input.bodyParagraphs.map((paragraph) =>
    escapeHtml(paragraph),
  );
  const safeFooterNote = input.footerNote ? escapeHtml(input.footerNote) : null;
  const safeCalloutLabel = input.calloutLabel
    ? escapeHtml(input.calloutLabel)
    : null;
  const safeCalloutValue = input.calloutValue
    ? escapeHtml(input.calloutValue)
    : null;

  const bodyParagraphHtml = safeParagraphs
    .map(
      (paragraph) =>
        `<p style="margin: 0 0 12px 0; color: ${theme.textColor}; font-size: 15px; line-height: 1.6;">${paragraph}</p>`,
    )
    .join('');

  const calloutHtml =
    safeCalloutLabel && safeCalloutValue
      ? `
      <div style="margin: 20px 0; border: 1px solid ${theme.borderColor}; border-radius: 10px; background: #0f1320; padding: 14px 16px;">
        <p style="margin: 0 0 8px 0; color: ${theme.mutedTextColor}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;">
          ${safeCalloutLabel}
        </p>
        <p style="margin: 0; color: ${theme.accentColor}; font-size: 28px; letter-spacing: 8px; font-weight: 700;">
          ${safeCalloutValue}
        </p>
      </div>
      `
      : '';

  const footerHtml = safeFooterNote
    ? `<p style="margin: 18px 0 0 0; color: ${theme.mutedTextColor}; font-size: 13px; line-height: 1.5;">${safeFooterNote}</p>`
    : '';

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>${safeTitle}</title>
      </head>
      <body style="margin: 0; padding: 0; background: ${theme.pageBackground}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
        <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
          ${safePreheader}
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 28px 16px; background: ${theme.pageBackground};">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 620px; border: 1px solid ${theme.borderColor}; border-radius: 14px; overflow: hidden; background: ${theme.cardBackground};">
                <tr>
                  <td style="padding: 22px 24px; border-bottom: 1px solid ${theme.borderColor};">
                    <p style="margin: 0; color: ${theme.mutedTextColor}; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700;">
                      My Tailor & Fabrics
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 24px;">
                    <h1 style="margin: 0 0 10px 0; color: ${theme.headingColor}; font-size: 24px; line-height: 1.2;">
                      ${safeTitle}
                    </h1>
                    <p style="margin: 0 0 16px 0; color: ${theme.mutedTextColor}; font-size: 15px; line-height: 1.5;">
                      ${safeSubtitle}
                    </p>
                    ${calloutHtml}
                    ${bodyParagraphHtml}
                    ${footerHtml}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 24px; border-top: 1px solid ${theme.borderColor}; background: #0f1320;">
                    <p style="margin: 0; color: ${theme.mutedTextColor}; font-size: 12px;">
                      Need help? Contact your workspace administrator.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

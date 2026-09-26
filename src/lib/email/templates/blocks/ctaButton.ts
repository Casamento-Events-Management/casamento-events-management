/**
 * Primary CTA Button block for email templates
 */
export function renderCtaButton(label: string, href: string): string {
  return `
    <div style="margin: 28px 0; text-align: center;">
      <a href="${href}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #3A4F1C; color: #F7F3E8; padding: 12px 28px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px; letter-spacing: 0.02em;">
        ${label}
      </a>
    </div>
  `.trim();
}

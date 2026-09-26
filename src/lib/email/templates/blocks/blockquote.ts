/**
 * Editorial blockquote block for email messages & feedback text
 */
export function renderBlockquote(text: string): string {
  const formattedText = text.replace(/\n/g, '<br />');
  return `
    <blockquote style="background-color: #EDE8D5; padding: 16px; border-left: 3px solid #BC6F07; margin: 16px 0; color: #3A4F1C; font-style: italic; font-size: 14px; line-height: 1.6;">
      ${formattedText}
    </blockquote>
  `.trim();
}

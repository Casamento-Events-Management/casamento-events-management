export interface BaseEmailLayoutOptions {
  sectionLabel?: string;
  title: string;
  contentHtml: string;
  isAdminNotification?: boolean;
}

/**
 * Base email layout wrapper for all Casamento Events email templates.
 * Enforces brand system: Deep olive header/footer (#3A4F1C), cream card (#F7F3E8),
 * gold accent dividers (#BC6F07), and web-safe system fonts.
 */
export function renderBaseEmailLayout(options: BaseEmailLayoutOptions): string {
  const { sectionLabel, title, contentHtml, isAdminNotification = false } = options;

  const footerDisclaimer = isAdminNotification
    ? 'This notification was generated automatically by the Casamento Events platform. Reply directly to this email to respond.'
    : 'This is an automated message sent by Casamento Events. You may reply directly to this email — a member of our team will follow up with you. Please do not reply if you did not initiate this request.';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F5F1E6;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    a {
      color: #3A4F1C;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F5F1E6;">
  <!-- Outer Container -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F5F1E6; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Card (600px max) -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #F7F3E8; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- Header Band -->
          <tr>
            <td style="background-color: #3A4F1C; padding: 20px 28px; text-align: left;">
              <span style="color: #F7F3E8; font-size: 18px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">
                Casamento Events
              </span>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 28px; color: #3A4F1C; font-size: 15px; line-height: 1.65;">
              ${
                sectionLabel
                  ? `<div style="font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #BC6F07; margin-bottom: 8px;">
                      ${escapeHtml(sectionLabel)}
                    </div>`
                  : ''
              }
              <h1 style="color: #3A4F1C; font-size: 22px; font-weight: 600; margin: 0 0 16px 0; line-height: 1.3;">
                ${escapeHtml(title)}
              </h1>
              
              <hr style="margin: 0 0 20px 0; border: none; border-top: 2px solid #BC6F07;" />

              ${contentHtml}
            </td>
          </tr>

          <!-- Footer Band -->
          <tr>
            <td style="background-color: #3A4F1C; padding: 24px 28px; color: #F7F3E8;">
              <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; letter-spacing: 0.03em;">
                Casamento Events Management
              </p>
              <p style="margin: 0; font-size: 12px; color: #F7F3E8; line-height: 1.5;">
                ${escapeHtml(footerDisclaimer)}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export interface DataTableRow {
  label: string;
  value: string;
  isHtml?: boolean;
}

/**
 * Data table block for structured key/value pairs in email templates
 */
export function renderDataTable(rows: DataTableRow[]): string {
  const rowHtml = rows
    .map(
      (row, idx) => `
      <tr style="background-color: ${idx % 2 === 0 ? '#F7F3E8' : '#EDE8D5'};">
        <td style="padding: 10px 14px; font-weight: 600; color: #3A4F1C; font-size: 13px; width: 35%; vertical-align: top;">
          ${escapeHtml(row.label)}
        </td>
        <td style="padding: 10px 14px; color: #3A4F1C; font-size: 14px; vertical-align: top;">
          ${row.isHtml ? row.value : escapeHtml(row.value)}
        </td>
      </tr>
    `
    )
    .join('');

  return `
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <tbody>
        ${rowHtml}
      </tbody>
    </table>
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

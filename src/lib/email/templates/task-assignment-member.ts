import type { BookingRecord } from '@/types/booking';
import { renderBaseEmailLayout } from './layouts/base';
import { renderDataTable } from './blocks/dataTable';
import { renderCtaButton } from './blocks/ctaButton';

export interface TaskAssignmentItem {
  title: string;
  due_date?: string | null;
  due_time?: string | null;
  is_new?: boolean;
  is_done?: boolean;
}

export interface TaskAssignmentEmailParams {
  booking: BookingRecord;
  memberName: string;
  assignedBy: string;
  tasks: TaskAssignmentItem[];
}

function formatTaskDue(date?: string | null, time?: string | null): string {
  if (!date && !time) return '<span style="color: #888;">No deadline set</span>';

  let formattedTime = '';
  if (time) {
    try {
      const parts = time.split(':');
      if (parts.length >= 2) {
        const hour = parseInt(parts[0], 10);
        const min = parts[1];
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        formattedTime = ` at ${displayHour}:${min} ${ampm}`;
      } else {
        formattedTime = ` at ${time}`;
      }
    } catch {
      formattedTime = ` at ${time}`;
    }
  }

  const datePart = date ? `<strong>${date}</strong>` : '';
  return `${datePart}${formattedTime}`;
}

/**
 * Builds email template sent to an admin team member when tasks are assigned to them.
 * Consolidates all tasks for that member on this event (both new and previously assigned)
 * into a single unified email.
 */
export function buildTaskAssignmentMemberEmail({
  booking,
  memberName,
  assignedBy,
  tasks,
}: TaskAssignmentEmailParams): { subject: string; html: string } {
  const newTasks = tasks.filter((t) => t.is_new !== false);
  const previousTasks = tasks.filter((t) => t.is_new === false);
  const hasBoth = newTasks.length > 0 && previousTasks.length > 0;

  let subject: string;
  if (hasBoth) {
    subject = `[Task Assignment Update] ${booking.service_title} [${booking.booking_reference}] — ${newTasks.length} New Task${newTasks.length > 1 ? 's' : ''} (${tasks.length} Total)`;
  } else if (newTasks.length > 1) {
    subject = `[Tasks Assigned] ${newTasks.length} New Tasks for ${booking.service_title} [${booking.booking_reference}]`;
  } else if (newTasks.length === 1) {
    subject = `[Task Assigned] ${newTasks[0].title} — ${booking.service_title} [${booking.booking_reference}]`;
  } else {
    subject = `[Tasks Checklist] ${tasks.length} Tasks for ${booking.service_title} [${booking.booking_reference}]`;
  }

  // Event Context Summary
  const eventDetailsHtml = renderDataTable([
    { label: 'Booking Reference', value: `<strong>${booking.booking_reference}</strong>`, isHtml: true },
    { label: 'Event Service', value: `${booking.service_title} (${booking.category_title})` },
    { label: 'Event Date', value: `<strong style="color: #3A4F1C; font-size: 15px;">${booking.event_date}</strong>`, isHtml: true },
    { label: 'Client Name', value: booking.client_full_name },
    { label: 'Venue Location', value: `${booking.venue_city}${booking.venue_address ? `, ${booking.venue_address}` : ''}${booking.event_country_name ? ` (${booking.event_country_name})` : ''}` },
    { label: 'Assigned By', value: `<strong>${assignedBy}</strong>`, isHtml: true },
  ]);

  // Tasks Checklist Table HTML
  const tasksRowsHtml = tasks
    .map((t, idx) => {
      const isNew = t.is_new !== false;
      const badgeHtml = isNew
        ? `<span style="background-color: #3A4F1C; color: #FFFFFF; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-right: 6px;">NEW</span>`
        : `<span style="background-color: #EFECE6; color: #555555; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; margin-right: 6px;">${t.is_done ? 'DONE' : 'PREVIOUS'}</span>`;

      return `
      <tr style="border-bottom: 1px solid #EAE6DF; ${isNew ? 'background-color: #FAF8F2;' : ''}">
        <td style="padding: 10px 12px; font-size: 13px; color: #2B3817; vertical-align: middle;">
          <span style="display: inline-block; width: 22px; font-weight: bold; color: #BC6F07;">${idx + 1}.</span>
          ${badgeHtml}
          <span style="${t.is_done ? 'text-decoration: line-through; color: #888;' : 'font-weight: 500;'}">${t.title}</span>
        </td>
        <td style="padding: 10px 12px; font-size: 12px; color: #555; vertical-align: middle; text-align: right; white-space: nowrap;">
          ${formatTaskDue(t.due_date, t.due_time)}
        </td>
      </tr>
    `;
    })
    .join('');

  const tasksTableHtml = `
    <div style="margin: 20px 0; border: 1px solid #D9D3C7; border-radius: 6px; overflow: hidden; background-color: #FAFAF7;">
      <div style="background-color: #3A4F1C; color: #F7F3E8; padding: 10px 14px; font-size: 13px; font-weight: 600; letter-spacing: 0.02em; display: flex; justify-content: space-between;">
        <span>Assigned Tasks Checklist (${tasks.length} total)</span>
      </div>
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="background-color: #ECE7DC; border-bottom: 1px solid #D9D3C7; font-size: 11px; text-transform: uppercase; color: #666; letter-spacing: 0.04em;">
            <th style="padding: 8px 12px;">Task Description</th>
            <th style="padding: 8px 12px; text-align: right;">Deadline</th>
          </tr>
        </thead>
        <tbody>
          ${tasksRowsHtml}
        </tbody>
      </table>
    </div>
  `;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://casamentoevents.com';
  const ctaButtonHtml = renderCtaButton(
    'Open Event in Calendar',
    `${siteUrl}/admin/bookings?tab=calendar`
  );

  const introText = hasBoth
    ? `<strong>${assignedBy}</strong> has assigned new tasks to you for <strong>${booking.service_title}</strong>. Below is your full updated task checklist containing both your previous and newly assigned tasks:`
    : `<strong>${assignedBy}</strong> has assigned you ${newTasks.length === 1 ? 'a new task' : `<strong>${newTasks.length} tasks</strong>`} for <strong>${booking.service_title}</strong>:`;

  const contentHtml = `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #2B3817; line-height: 1.6;">
      Hello <strong>${memberName}</strong>,
    </p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: #2B3817; line-height: 1.6;">
      ${introText}
    </p>

    ${tasksTableHtml}

    <p style="margin: 16px 0 8px 0; font-size: 13px; font-weight: 600; color: #3A4F1C; text-transform: uppercase; letter-spacing: 0.05em;">
      Event Information:
    </p>

    ${eventDetailsHtml}

    ${ctaButtonHtml}

    <p style="margin: 20px 0 0 0; font-size: 12px; color: #777; line-height: 1.5; text-align: center;">
      Please log in to your Casamento admin portal to update checklists, view client instructions, or mark tasks as completed.
    </p>
  `;

  const html = renderBaseEmailLayout({
    sectionLabel: 'Team Task Assignment',
    title: hasBoth ? 'Updated Task Assignment' : (tasks.length > 1 ? 'New Event Tasks Assigned' : 'New Event Task Assigned'),
    contentHtml,
    isAdminNotification: true,
  });

  return { subject, html };
}

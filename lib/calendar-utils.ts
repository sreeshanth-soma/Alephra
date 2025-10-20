/**
 * Utility functions for generating Google Calendar "Add to Calendar" links
 * No API or OAuth required - works instantly without verification
 */

interface CalendarEventParams {
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  timeZone?: string;
}

/**
 * Generates a Google Calendar "Add to Calendar" URL
 * @param event - Event details
 * @returns URL string that opens Google Calendar with pre-filled event
 * 
 * @example
 * const url = generateGoogleCalendarUrl({
 *   title: "Doctor Appointment",
 *   description: "Annual checkup",
 *   startTime: new Date("2025-10-20T10:00:00"),
 *   endTime: new Date("2025-10-20T11:00:00"),
 * });
 * window.open(url, '_blank');
 */
export function generateGoogleCalendarUrl(event: CalendarEventParams): string {
  const { title, description, location, startTime, endTime } = event;

  // Format dates to Google Calendar format: YYYYMMDDTHHmmss (in UTC) or YYYYMMDDTHHmmssZ
  const formatDateTime = (date: Date): string => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${formatDateTime(startTime)}/${formatDateTime(endTime)}`,
  });

  if (description) {
    params.append('details', description);
  }

  if (location) {
    params.append('location', location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Opens Google Calendar in a new tab with pre-filled event details
 * @param event - Event details
 */
export function openGoogleCalendar(event: CalendarEventParams): void {
  const url = generateGoogleCalendarUrl(event);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Generates an "Add to Calendar" button/link for a medical reminder
 * @param title - Reminder title
 * @param description - Reminder description
 * @param reminderTime - When the reminder should trigger
 * @param duration - Duration in minutes (default: 15)
 */
export function generateMedicalReminderUrl(
  title: string,
  description: string,
  reminderTime: Date,
  duration: number = 15
): string {
  const endTime = new Date(reminderTime.getTime() + duration * 60000);
  
  return generateGoogleCalendarUrl({
    title: `💊 ${title}`,
    description: `Medical Reminder: ${description || title}\n\nCreated by Alephra AI Healthcare Assistant`,
    startTime: reminderTime,
    endTime: endTime,
  });
}

/**
 * Generates an "Add to Calendar" button/link for an appointment
 * @param title - Appointment title
 * @param description - Appointment description
 * @param startTime - Appointment start time
 * @param duration - Duration in minutes (default: 30)
 * @param location - Appointment location (optional)
 */
export function generateAppointmentUrl(
  title: string,
  description: string,
  startTime: Date,
  duration: number = 30,
  location?: string
): string {
  const endTime = new Date(startTime.getTime() + duration * 60000);
  
  return generateGoogleCalendarUrl({
    title: `📅 ${title}`,
    description: `Appointment: ${description || title}\n\nCreated by Alephra AI Healthcare Assistant`,
    startTime: startTime,
    endTime: endTime,
    location: location,
  });
}

/**
 * Downloads an .ics file for calendar import (works with any calendar app)
 * Alternative to Google Calendar link - works with Outlook, Apple Calendar, etc.
 */
export function downloadICSFile(event: CalendarEventParams): void {
  const { title, description, location, startTime, endTime } = event;

  const formatICSDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Alephra//Healthcare Assistant//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@alephra.app`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(startTime)}`,
    `DTEND:${formatICSDate(endTime)}`,
    `SUMMARY:${title}`,
    description ? `DESCRIPTION:${description.replace(/\n/g, '\\n')}` : '',
    location ? `LOCATION:${location}` : '',
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


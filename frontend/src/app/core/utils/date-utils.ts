/**
 * Utilities for parsing and formatting backend timestamps.
 * 
 * Handles:
 * - Spring Boot LocalDateTime (serialized as local ISO strings without timezone, e.g. "2026-09-23T03:01:21")
 * - UTC strings ending with 'Z'
 * - ISO strings with offsets (e.g. "+05:30")
 * - SQL format strings ("2026-09-23 03:01:21")
 * - Jackson numeric array format [year, month, day, hour, min, sec]
 */

export function parseBackendDate(dateInput: any): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? null : dateInput;

  // Handle Jackson array format: [YYYY, MM, DD, HH, mm, ss]
  if (Array.isArray(dateInput)) {
    const [y, m, d, h = 0, min = 0, s = 0] = dateInput;
    const date = new Date(y, m - 1, d, h, min, s);
    return isNaN(date.getTime()) ? null : date;
  }

  // Handle string format
  let str = String(dateInput).trim().replace(' ', 'T');
  // Truncate sub-millisecond nanoseconds (e.g. .123456789 -> .123) for browser compatibility
  str = str.replace(/(\.\d{3})\d+/, '$1');

  const date = new Date(str);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Formats a timestamp for posts, comments, notifications, etc.
 * Combines relative elapsed time with actual 12-hour clock time.
 * Examples:
 * - "just now • 3:01 AM"
 * - "15m ago • 3:01 AM"
 * - "2h ago • 1:15 AM"
 * - "Yesterday • 10:45 PM"
 * - "Sep 20 • 4:15 PM"
 * - "Oct 12, 2025 • 2:30 PM"
 */
export function formatRelativeWithTime(dateInput: any): string {
  const date = parseBackendDate(dateInput);
  if (!date) return '';

  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Format 12-hour time (e.g. "3:01 AM")
  const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

  // Under 60 seconds (or slight clock skew)
  if (diffSec < 60) {
    return `just now • ${timeStr}`;
  }

  const minutes = Math.floor(diffSec / 60);
  if (minutes < 60) {
    return `${minutes}m ago • ${timeStr}`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const isToday = date.getDate() === now.getDate() &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear();
    if (isToday) {
      return `${hours}h ago • ${timeStr}`;
    }
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.getDate() === yesterday.getDate() &&
                      date.getMonth() === yesterday.getMonth() &&
                      date.getFullYear() === yesterday.getFullYear();
  if (isYesterday) {
    return `Yesterday • ${timeStr}`;
  }

  const isSameYear = date.getFullYear() === now.getFullYear();
  const dateStr = date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    ...(isSameYear ? {} : { year: 'numeric' })
  });

  return `${dateStr} • ${timeStr}`;
}

/**
 * Formats timestamps specifically for chat messages (clean time for message bubbles).
 * Examples:
 * - "3:01 AM" (today)
 * - "Yesterday 10:45 PM"
 * - "Sep 20, 4:15 PM"
 */
export function formatMessageTime(dateInput: any): string {
  const date = parseBackendDate(dateInput);
  if (!date) return '';

  const now = new Date();
  const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

  const isToday = date.getDate() === now.getDate() &&
                  date.getMonth() === now.getMonth() &&
                  date.getFullYear() === now.getFullYear();
  if (isToday) {
    return timeStr;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.getDate() === yesterday.getDate() &&
                      date.getMonth() === yesterday.getMonth() &&
                      date.getFullYear() === yesterday.getFullYear();
  if (isYesterday) {
    return `Yesterday ${timeStr}`;
  }

  const isSameYear = date.getFullYear() === now.getFullYear();
  const dateStr = date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    ...(isSameYear ? {} : { year: 'numeric' })
  });

  return `${dateStr}, ${timeStr}`;
}

import { format, parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, addWeeks, subDays, subWeeks, isWithinInterval, isSameDay } from 'date-fns';
import { formatInTimeZone, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

/**
 * Format a date in a specific timezone
 * @param {Date|string} date - The date to format
 * @param {string} timezone - IANA timezone string
 * @param {string} formatStr - date-fns format string
 * @returns {string} Formatted date string
 */
export const formatInTimezone = (date, timezone, formatStr = 'PPpp') => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatInTimeZone(dateObj, timezone, formatStr);
};

/**
 * Convert UTC date to a specific timezone
 * @param {Date|string} utcDate - UTC date
 * @param {string} timezone - Target IANA timezone
 * @returns {Date} Date in target timezone
 */
export const utcToTimezone = (utcDate, timezone) => {
  try {
    // Make sure we have a valid timezone
    const safeTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    // Parse the date if it's a string
    const dateObj = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate;
    // Check if the date is valid
    if (isNaN(dateObj?.getTime())) {
      return new Date(); // Fallback to current date
    }
    return utcToZonedTime(dateObj, safeTimezone);
  } catch (e) {
    console.error('📅 utcToTimezone - Error converting timezone:', e);
    return new Date(); // Fallback to current date
  }
};

/**
 * Convert a date from a specific timezone to UTC
 * @param {Date} date - Date in local timezone
 * @param {string} timezone - Source IANA timezone
 * @returns {Date} Date in UTC
 */
export const timezoneToUtc = (date, timezone) => {
  return zonedTimeToUtc(date, timezone);
};

/**
 * Get user's current timezone from browser
 * @returns {string} IANA timezone string
 */
export const getUserTimezone = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('🌐 getUserTimezone - Browser detected:', tz);
    
    // Verify the timezone is valid
    try {
      Intl.DateTimeFormat(undefined, {timeZone: tz}).format(new Date());
      return tz;
    } catch (e) {
      console.error('🌐 getUserTimezone - Invalid timezone detected:', tz, e);
      return 'UTC'; // Fallback to UTC if browser returns invalid timezone
    }
  } catch (e) {
    console.error('🌐 getUserTimezone - Error detecting timezone:', e);
    return 'UTC'; // Fallback to UTC on error
  }
};

/**
 * Get day boundaries in a specific timezone
 * @param {Date} date - Reference date
 * @param {string} timezone - IANA timezone
 * @returns {Object} { start: Date, end: Date } in UTC
 */
export const getDayBoundaries = (date, timezone) => {
  const zonedDate = utcToZonedTime(date, timezone);
  const start = startOfDay(zonedDate);
  const end = endOfDay(zonedDate);
  
  return {
    start: zonedTimeToUtc(start, timezone),
    end: zonedTimeToUtc(end, timezone),
  };
};

/**
 * Get week boundaries in a specific timezone
 * @param {Date} date - Reference date
 * @param {string} timezone - IANA timezone
 * @param {Object} options - Week start options
 * @returns {Object} { start: Date, end: Date } in UTC
 */
export const getWeekBoundaries = (date, timezone, options = { weekStartsOn: 0 }) => {
  const zonedDate = utcToZonedTime(date, timezone);
  const start = startOfWeek(zonedDate, options);
  const end = endOfWeek(zonedDate, options);
  
  return {
    start: zonedTimeToUtc(start, timezone),
    end: zonedTimeToUtc(end, timezone),
  };
};

/**
 * Get month boundaries in a specific timezone
 * @param {Date} date - Reference date
 * @param {string} timezone - IANA timezone
 * @returns {Object} { start: Date, end: Date } in UTC
 */
export const getMonthBoundaries = (date, timezone) => {
  const zonedDate = utcToZonedTime(date, timezone);
  const start = startOfWeek(startOfMonth(zonedDate), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(zonedDate), { weekStartsOn: 0 });
  
  return {
    start: zonedTimeToUtc(start, timezone),
    end: zonedTimeToUtc(end, timezone),
  };
};

/**
 * Format duration between two dates
 * @param {Date|string} start - Start date
 * @param {Date|string} end - End date
 * @returns {string} Human-readable duration
 */
export const formatDuration = (start, end) => {
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;
  
  const diffMs = endDate - startDate;
  const diffMinutes = Math.floor(diffMs / 60000);
  
  if (diffMinutes < 60) {
    return `${diffMinutes} min`;
  }
  
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  
  if (minutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${minutes} min`;
};

/**
 * Parse ISO 8601 string to Date object
 * @param {string} isoString - ISO 8601 date string
 * @returns {Date} Date object
 */
export const parseISOString = (isoString) => {
  return parseISO(isoString);
};

/**
 * Format date for display in UI
 * @param {Date|string} date - Date to format
 * @param {string} timezone - IANA timezone
 * @returns {string} Formatted date string
 */
export const formatDateForDisplay = (date, timezone) => {
  return formatInTimezone(date, timezone, 'PPP'); // e.g., "April 29, 2023"
};

/**
 * Format time for display in UI
 * @param {Date|string} date - Date to format
 * @param {string} timezone - IANA timezone
 * @returns {string} Formatted time string
 */
export const formatTimeForDisplay = (date, timezone) => {
  if (!date) {
    console.error('formatTimeForDisplay called with invalid date:', date);
    return '—';
  }
  
  try {
    // Use browser timezone if none provided
    const effectiveTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Parse the date if it's a string (assumes ISO format)
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      console.error('formatTimeForDisplay received invalid date:', date);
      return '—';
    }
    
    // Format time with the standard formatter
    const result = formatInTimezone(dateObj, effectiveTimezone, 'p'); // e.g., "5:00 PM"
    
    return result;
  } catch (error) {
    console.error('Error formatting time for display:', error, date, timezone);
    return '—';
  }
};

/**
 * Format date and time for display in UI
 * @param {Date|string} date - Date to format
 * @param {string} timezone - IANA timezone
 * @returns {string} Formatted date-time string
 */
export const formatDateTimeForDisplay = (date, timezone) => {
  return formatInTimezone(date, timezone, 'PPp'); // e.g., "Apr 29, 2023, 5:00 PM"
};

/**
 * Utility functions for date navigation
 */
export const dateNav = {
  addDays,
  addWeeks,
  subDays,
  subWeeks,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  isSameDay,
};

import { format, parseISO, isValid, addDays, startOfDay, endOfDay } from 'date-fns';
import { DATE_FORMATS } from './constants';

export const dateUtils = {
  // Format date for display
  formatDate: (date, formatString = DATE_FORMATS.DISPLAY) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? format(dateObj, formatString) : '';
  },

  // Format date for API
  formatForAPI: (date) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? format(dateObj, DATE_FORMATS.API) : '';
  },

  // Format time
  formatTime: (date) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? format(dateObj, DATE_FORMATS.TIME) : '';
  },

  // Format datetime
  formatDateTime: (date) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? format(dateObj, DATE_FORMATS.DATETIME) : '';
  },

  // Check if date is today
  isToday: (date) => {
    if (!date) return false;
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const today = new Date();
    return format(dateObj, DATE_FORMATS.API) === format(today, DATE_FORMATS.API);
  },

  // Check if date is in the future
  isFuture: (date) => {
    if (!date) return false;
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return dateObj > new Date();
  },

  // Get date range for a week
  getWeekRange: (startDate = new Date()) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(startDate, i));
    }
    return dates;
  },

  // Get start and end of day
  getStartOfDay: (date) => startOfDay(date),
  getEndOfDay: (date) => endOfDay(date),

  // Parse ISO string to Date
  parseISO: (dateString) => {
    try {
      return parseISO(dateString);
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  },
};

export default dateUtils;
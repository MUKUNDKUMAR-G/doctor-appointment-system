// User roles
export const USER_ROLES = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  ADMIN: 'ADMIN',
};

// Appointment status
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  RESCHEDULED: 'RESCHEDULED',
};

// Local storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  THEME_PREFERENCE: 'themePreference',
};

// Time slots configuration
export const TIME_SLOTS = {
  DURATION_MINUTES: 30,
  START_HOUR: 9,
  END_HOUR: 17,
  LUNCH_START: 12,
  LUNCH_END: 13,
};

// Validation rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  API: 'yyyy-MM-dd',
  TIME: 'HH:mm',
  DATETIME: 'MMM dd, yyyy HH:mm',
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  APPOINTMENT_CONFLICT: 'The selected time slot is no longer available.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
};

export default {
  USER_ROLES,
  APPOINTMENT_STATUS,
  STORAGE_KEYS,
  TIME_SLOTS,
  VALIDATION,
  DATE_FORMATS,
  ERROR_MESSAGES,
};
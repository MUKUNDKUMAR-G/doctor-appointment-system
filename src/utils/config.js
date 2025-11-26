// Environment configuration
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  appName: import.meta.env.VITE_APP_NAME || 'Secure Appointment System',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  debug: import.meta.env.VITE_DEBUG === 'true',
};

// API endpoints
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  doctors: {
    list: '/doctors',
    search: '/doctors/search',
    availability: (doctorId) => `/doctors/${doctorId}/availability`,
    profile: (doctorId) => `/doctors/${doctorId}`,
  },
  appointments: {
    list: '/appointments',
    create: '/appointments',
    update: (appointmentId) => `/appointments/${appointmentId}`,
    cancel: (appointmentId) => `/appointments/${appointmentId}`,
    patient: (patientId) => `/appointments/patient/${patientId}`,
  },
  users: {
    profile: '/users/profile',
    update: '/users/profile',
  },
};

export default config;
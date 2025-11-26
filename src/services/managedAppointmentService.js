import appointmentService from './appointmentService';
import { 
  createManagedRequest, 
  createRequestKey, 
  REQUEST_PRESETS 
} from '../utils/requestManagerHelpers';

/**
 * Enhanced appointment service that integrates with useRequestManager
 * This demonstrates how to wrap existing services for request management
 */

/**
 * Create managed versions of appointment service methods
 */
export const createManagedAppointmentService = () => {
  return {
    // Get patient appointments with request management
    getPatientAppointments: createManagedRequest(async (config) => {
      const { patientId, ...options } = config;
      return await appointmentService.getPatientAppointments(patientId, config.signal);
    }),

    // Book appointment with high priority (user action)
    bookAppointment: createManagedRequest(async (config) => {
      const { appointmentData, ...options } = config;
      return await appointmentService.bookAppointment(appointmentData, config.signal);
    }),

    // Update appointment with high priority
    updateAppointment: createManagedRequest(async (config) => {
      const { appointmentId, appointmentData, ...options } = config;
      return await appointmentService.updateAppointment(appointmentId, appointmentData, config.signal);
    }),

    // Cancel appointment with high priority
    cancelAppointment: createManagedRequest(async (config) => {
      const { appointmentId, reason = '', ...options } = config;
      return await appointmentService.cancelAppointment(appointmentId, reason, config.signal);
    }),

    // Get all appointments with normal priority
    getAllAppointments: createManagedRequest(async (config) => {
      const { filters = {}, ...options } = config;
      return await appointmentService.getAllAppointments(filters, config.signal);
    }),

    // Get appointment details with normal priority
    getAppointmentDetails: createManagedRequest(async (config) => {
      const { appointmentId, ...options } = config;
      return await appointmentService.getAppointmentDetails(appointmentId, config.signal);
    }),

    // Reschedule appointment with high priority
    rescheduleAppointment: createManagedRequest(async (config) => {
      const { appointmentId, newAppointmentData, ...options } = config;
      return await appointmentService.rescheduleAppointment(appointmentId, newAppointmentData, config.signal);
    }),

    // Check availability with low priority (background operation)
    checkAvailability: createManagedRequest(async (config) => {
      const { doctorId, dateTime, ...options } = config;
      return await appointmentService.checkAvailability(doctorId, dateTime, config.signal);
    }),

    // Get appointment stats with normal priority
    getAppointmentStats: createManagedRequest(async (config) => {
      const { filters = {}, ...options } = config;
      return await appointmentService.getAppointmentStats(filters, config.signal);
    }),
  };
};

/**
 * Request key generators for consistent naming
 */
export const APPOINTMENT_REQUEST_KEYS = {
  GET_PATIENT_APPOINTMENTS: (patientId) => createRequestKey('appointments', 'getPatient', patientId),
  BOOK_APPOINTMENT: () => createRequestKey('appointments', 'book'),
  UPDATE_APPOINTMENT: (appointmentId) => createRequestKey('appointments', 'update', appointmentId),
  CANCEL_APPOINTMENT: (appointmentId) => createRequestKey('appointments', 'cancel', appointmentId),
  GET_ALL_APPOINTMENTS: (filters) => createRequestKey('appointments', 'getAll', JSON.stringify(filters)),
  GET_APPOINTMENT_DETAILS: (appointmentId) => createRequestKey('appointments', 'details', appointmentId),
  RESCHEDULE_APPOINTMENT: (appointmentId) => createRequestKey('appointments', 'reschedule', appointmentId),
  CHECK_AVAILABILITY: (doctorId, dateTime) => createRequestKey('appointments', 'availability', doctorId, dateTime),
  GET_APPOINTMENT_STATS: (filters) => createRequestKey('appointments', 'stats', JSON.stringify(filters)),
};

/**
 * Request options presets for different appointment operations
 */
export const APPOINTMENT_REQUEST_OPTIONS = {
  // High priority for user actions
  USER_ACTIONS: REQUEST_PRESETS.USER_ACTION,
  
  // Normal priority for data fetching
  DATA_FETCH: REQUEST_PRESETS.DATA_FETCH,
  
  // Low priority for background checks
  BACKGROUND_CHECKS: REQUEST_PRESETS.BACKGROUND,
  
  // Critical operations
  CRITICAL_OPERATIONS: REQUEST_PRESETS.CRITICAL,
};

/**
 * Helper function to execute appointment requests with proper options
 */
export const executeAppointmentRequest = async (requestManager, requestKey, requestFn, options = {}) => {
  return await requestManager.executeRequest(requestKey, requestFn, options);
};

export default {
  createManagedAppointmentService,
  APPOINTMENT_REQUEST_KEYS,
  APPOINTMENT_REQUEST_OPTIONS,
  executeAppointmentRequest
};
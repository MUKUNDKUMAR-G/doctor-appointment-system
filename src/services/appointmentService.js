import api, { withOptimisticUpdate, withRetry } from './api';
import { endpoints } from '../utils/config';
import { APPOINTMENT_STATUS } from '../utils/constants';

export const appointmentService = {
  // Get patient appointments with caching
  getPatientAppointments: async (patientId, cancelToken) => {
    const response = await api.get(endpoints.appointments.patient(patientId), {
      cancelToken,
      skipErrorHandling: false,
    });
    return response.data;
  },

  // Book new appointment with optimistic update support
  bookAppointment: async (appointmentData, cancelToken) => {
    const response = await withRetry(
      () => api.post(endpoints.appointments.create, appointmentData, {
        cancelToken,
        skipErrorHandling: false,
      }),
      2, // Retry up to 2 times for booking conflicts
      1000
    );
    return response.data;
  },

  // Book appointment with optimistic update
  bookAppointmentOptimistic: async (appointmentData, optimisticUpdate, rollbackUpdate) => {
    return withOptimisticUpdate(
      optimisticUpdate,
      () => appointmentService.bookAppointment(appointmentData),
      rollbackUpdate
    );
  },

  // Update appointment with optimistic update support
  updateAppointment: async (appointmentId, appointmentData, cancelToken) => {
    const response = await api.put(
      endpoints.appointments.update(appointmentId), 
      appointmentData,
      {
        cancelToken,
        skipErrorHandling: false,
      }
    );
    return response.data;
  },

  // Update appointment with optimistic update
  updateAppointmentOptimistic: async (appointmentId, appointmentData, optimisticUpdate, rollbackUpdate) => {
    return withOptimisticUpdate(
      optimisticUpdate,
      () => appointmentService.updateAppointment(appointmentId, appointmentData),
      rollbackUpdate
    );
  },

  // Cancel appointment with optimistic update support
  cancelAppointment: async (appointmentId, reason = '', cancelToken) => {
    const response = await api.delete(endpoints.appointments.cancel(appointmentId), {
      data: { cancellationReason: reason },
      cancelToken,
      skipErrorHandling: false,
    });
    return response.data;
  },

  // Cancel appointment with optimistic update
  cancelAppointmentOptimistic: async (appointmentId, reason, optimisticUpdate, rollbackUpdate) => {
    return withOptimisticUpdate(
      optimisticUpdate,
      () => appointmentService.cancelAppointment(appointmentId, reason),
      rollbackUpdate
    );
  },

  // Get all appointments with filtering and pagination
  getAllAppointments: async (filters = {}, cancelToken) => {
    const response = await api.get(endpoints.appointments.list, { 
      params: filters,
      cancelToken,
      skipErrorHandling: false,
    });
    return response.data;
  },

  // Get appointment details
  getAppointmentDetails: async (appointmentId, cancelToken) => {
    const response = await api.get(`${endpoints.appointments.list}/${appointmentId}`, {
      cancelToken,
      skipErrorHandling: false,
    });
    return response.data;
  },

  // Reschedule appointment
  rescheduleAppointment: async (appointmentId, newAppointmentData, cancelToken) => {
    const response = await api.put(
      `/appointments/${appointmentId}/reschedule`,
      newAppointmentData,
      {
        cancelToken,
        skipErrorHandling: false,
      }
    );
    return response.data;
  },

  // Check appointment availability before booking
  checkAvailability: async (doctorId, dateTime, cancelToken) => {
    const response = await api.get(
      `/appointments/availability/check`,
      {
        params: { doctorId, dateTime },
        cancelToken,
        skipLoading: true, // Don't show loading for availability checks
      }
    );
    return response.data;
  },

  // Get appointment statistics for dashboard
  getAppointmentStats: async (filters = {}, cancelToken) => {
    const response = await api.get('/appointments/stats', {
      params: filters,
      cancelToken,
      skipErrorHandling: false,
    });
    return response.data;
  },
};

export default appointmentService;
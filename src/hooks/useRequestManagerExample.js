import { useState, useCallback } from 'react';
import useRequestManager from './useRequestManager';
import { 
  createManagedAppointmentService, 
  APPOINTMENT_REQUEST_KEYS, 
  APPOINTMENT_REQUEST_OPTIONS 
} from '../services/managedAppointmentService';

/**
 * Example hook demonstrating useRequestManager integration
 * This shows how to use the request manager with appointment operations
 */
export const useRequestManagerExample = (patientId) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize request manager
  const requestManager = useRequestManager();
  
  // Create managed appointment service
  const managedAppointmentService = createManagedAppointmentService();

  /**
   * Fetch patient appointments with request management
   */
  const fetchAppointments = useCallback(async () => {
    if (!patientId) return;

    const requestKey = APPOINTMENT_REQUEST_KEYS.GET_PATIENT_APPOINTMENTS(patientId);
    
    try {
      setLoading(true);
      setError(null);

      // Execute request with deduplication and cancellation
      const result = await requestManager.executeRequest(
        requestKey,
        managedAppointmentService.getPatientAppointments,
        {
          ...APPOINTMENT_REQUEST_OPTIONS.DATA_FETCH,
          patientId
        }
      );

      setAppointments(result);
    } catch (err) {
      if (err.message !== 'Request cancelled') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [patientId, requestManager, managedAppointmentService]);

  /**
   * Book appointment with high priority
   */
  const bookAppointment = useCallback(async (appointmentData) => {
    const requestKey = APPOINTMENT_REQUEST_KEYS.BOOK_APPOINTMENT();
    
    try {
      setError(null);

      // Cancel any existing booking requests (high priority)
      requestManager.cancelRequests(requestKey);

      const result = await requestManager.executeRequest(
        requestKey,
        managedAppointmentService.bookAppointment,
        {
          ...APPOINTMENT_REQUEST_OPTIONS.USER_ACTIONS,
          appointmentData
        }
      );

      // Refresh appointments after booking
      await fetchAppointments();
      
      return result;
    } catch (err) {
      if (err.message !== 'Request cancelled') {
        setError(err.message);
        throw err;
      }
    }
  }, [requestManager, managedAppointmentService, fetchAppointments]);

  /**
   * Cancel appointment with optimistic update
   */
  const cancelAppointment = useCallback(async (appointmentId, reason = '') => {
    const requestKey = APPOINTMENT_REQUEST_KEYS.CANCEL_APPOINTMENT(appointmentId);
    
    // Store original appointments for rollback
    const originalAppointments = [...appointments];
    
    try {
      setError(null);

      // Optimistic update - remove appointment immediately
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));

      await requestManager.executeRequest(
        requestKey,
        managedAppointmentService.cancelAppointment,
        {
          ...APPOINTMENT_REQUEST_OPTIONS.USER_ACTIONS,
          appointmentId,
          reason
        }
      );

      // Success - the optimistic update stands
    } catch (err) {
      // Rollback optimistic update on error
      setAppointments(originalAppointments);
      
      if (err.message !== 'Request cancelled') {
        setError(err.message);
        throw err;
      }
    }
  }, [appointments, requestManager, managedAppointmentService]);

  /**
   * Check availability in background
   */
  const checkAvailability = useCallback(async (doctorId, dateTime) => {
    const requestKey = APPOINTMENT_REQUEST_KEYS.CHECK_AVAILABILITY(doctorId, dateTime);
    
    try {
      return await requestManager.executeRequest(
        requestKey,
        managedAppointmentService.checkAvailability,
        {
          ...APPOINTMENT_REQUEST_OPTIONS.BACKGROUND_CHECKS,
          doctorId,
          dateTime
        }
      );
    } catch (err) {
      if (err.message !== 'Request cancelled') {
        console.warn('Availability check failed:', err.message);
      }
      return null;
    }
  }, [requestManager, managedAppointmentService]);

  /**
   * Cancel all pending requests
   */
  const cancelAllRequests = useCallback(() => {
    return requestManager.cancelRequests();
  }, [requestManager]);

  /**
   * Check if there are pending requests
   */
  const hasPendingRequests = useCallback((key) => {
    return requestManager.hasPendingRequests(key);
  }, [requestManager]);

  /**
   * Get request statistics for debugging
   */
  const getRequestStats = useCallback(() => {
    return requestManager.getRequestStats();
  }, [requestManager]);

  return {
    // Data
    appointments,
    loading,
    error,
    
    // Actions
    fetchAppointments,
    bookAppointment,
    cancelAppointment,
    checkAvailability,
    
    // Request management
    cancelAllRequests,
    hasPendingRequests,
    getRequestStats,
    
    // Request manager instance (for advanced usage)
    requestManager
  };
};

export default useRequestManagerExample;
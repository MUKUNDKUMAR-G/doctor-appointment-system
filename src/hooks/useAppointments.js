import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRealTimeSync } from '../contexts/RealTimeSyncContext';
import { useNotification } from '../contexts/NotificationContext';
import { appointmentService } from '../services/appointmentService';
import useApiCall from './useApiCall';

export const useAppointments = (options = {}) => {
  const { autoRefresh = true, refreshInterval = 30000 } = options;
  
  const { user } = useAuth();
  const { getAppointmentStatus, hasRecentUpdates } = useRealTimeSync();
  const { notifyAppointmentCancelled, notifyAppointmentRescheduled } = useNotification();
  
  const [appointments, setAppointments] = useState([]);
  const [optimisticUpdates, setOptimisticUpdates] = useState({});

  // Memoize callbacks to prevent infinite loops
  const handleFetchSuccess = useCallback((data) => {
    setAppointments(data);
  }, []);

  // API call hooks for different operations
  const {
    execute: fetchAppointments,
    isLoading: fetchingAppointments,
    error: fetchError,
  } = useApiCall({
    onSuccess: handleFetchSuccess,
    showErrorMessage: true,
    loadingKey: 'fetch-appointments',
  });

  const handleCancelSuccess = useCallback((result, appointmentId) => {
    // Remove optimistic update
    setOptimisticUpdates(prev => {
      const updated = { ...prev };
      delete updated[appointmentId];
      return updated;
    });
    
    // Update appointments list
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: 'CANCELLED', updatedAt: new Date().toISOString() }
          : apt
      )
    );
    
    // Find appointment for notification
    setAppointments(currentAppointments => {
      const appointment = currentAppointments.find(apt => apt.id === appointmentId);
      if (appointment) {
        notifyAppointmentCancelled({
          ...appointment,
          doctorName: appointment.doctor?.user?.firstName 
            ? `Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`
            : 'Doctor',
          dateTime: new Date(appointment.appointmentDateTime).toLocaleString(),
        });
      }
      return currentAppointments;
    });
  }, [notifyAppointmentCancelled]);

  const handleCancelError = useCallback((error, appointmentId) => {
    // Rollback optimistic update
    setOptimisticUpdates(prev => {
      const updated = { ...prev };
      delete updated[appointmentId];
      return updated;
    });
  }, []);

  const {
    execute: cancelAppointment,
    isLoading: cancellingAppointment,
  } = useApiCall({
    onSuccess: handleCancelSuccess,
    onError: handleCancelError,
    showSuccessMessage: false,
    loadingKey: 'cancel-appointment',
  });

  const handleRescheduleSuccess = useCallback((result, appointmentId) => {
    // Remove optimistic update
    setOptimisticUpdates(prev => {
      const updated = { ...prev };
      delete updated[appointmentId];
      return updated;
    });
    
    // Update appointments list
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...result, updatedAt: new Date().toISOString() }
          : apt
      )
    );
    
    // Notify user
    setAppointments(currentAppointments => {
      const appointment = currentAppointments.find(apt => apt.id === appointmentId);
      if (appointment) {
        notifyAppointmentRescheduled({
          ...result,
          doctorName: appointment.doctor?.user?.firstName 
            ? `Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`
            : 'Doctor',
          newDateTime: new Date(result.appointmentDateTime).toLocaleString(),
        });
      }
      return currentAppointments;
    });
  }, [notifyAppointmentRescheduled]);

  const handleRescheduleError = useCallback((error, appointmentId) => {
    // Rollback optimistic update
    setOptimisticUpdates(prev => {
      const updated = { ...prev };
      delete updated[appointmentId];
      return updated;
    });
  }, []);

  const {
    execute: rescheduleAppointment,
    isLoading: reschedulingAppointment,
  } = useApiCall({
    onSuccess: handleRescheduleSuccess,
    onError: handleRescheduleError,
    showSuccessMessage: false,
    loadingKey: 'reschedule-appointment',
  });

  // Load appointments on mount and when user changes
  useEffect(() => {
    // Only fetch appointments for patients
    if (user?.id && user?.role === 'PATIENT') {
      fetchAppointments(() => appointmentService.getPatientAppointments(user.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role]);

  // Auto-refresh appointments
  useEffect(() => {
    // Only auto-refresh for patients
    if (!autoRefresh || !user?.id || user?.role !== 'PATIENT') return;

    const interval = setInterval(() => {
      fetchAppointments(() => appointmentService.getPatientAppointments(user.id));
    }, refreshInterval);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, refreshInterval, user?.id, user?.role]);

  // Merge appointments with real-time updates and optimistic updates
  const getEnhancedAppointments = useCallback(() => {
    return appointments.map(appointment => {
      // Check for optimistic updates
      const optimisticUpdate = optimisticUpdates[appointment.id];
      if (optimisticUpdate) {
        return { ...appointment, ...optimisticUpdate, isOptimistic: true };
      }

      // Check for real-time updates
      const realtimeStatus = getAppointmentStatus(appointment.id);
      if (realtimeStatus) {
        return { 
          ...appointment, 
          ...realtimeStatus,
          hasRecentUpdate: hasRecentUpdates(appointment.id),
        };
      }

      return appointment;
    });
  }, [appointments, optimisticUpdates, getAppointmentStatus, hasRecentUpdates]);

  // Cancel appointment with optimistic update
  const handleCancelAppointment = useCallback(async (appointmentId, reason = '') => {
    // Apply optimistic update
    setOptimisticUpdates(prev => ({
      ...prev,
      [appointmentId]: {
        status: 'CANCELLED',
        updatedAt: new Date().toISOString(),
      }
    }));

    // Execute API call
    await cancelAppointment(
      () => appointmentService.cancelAppointment(appointmentId, reason),
      appointmentId
    );
  }, [cancelAppointment]);

  // Reschedule appointment with optimistic update
  const handleRescheduleAppointment = useCallback(async (appointmentId, newDateTime) => {
    // Apply optimistic update
    setOptimisticUpdates(prev => ({
      ...prev,
      [appointmentId]: {
        appointmentDateTime: newDateTime,
        status: 'RESCHEDULED',
        updatedAt: new Date().toISOString(),
      }
    }));

    // Execute API call
    await rescheduleAppointment(
      () => appointmentService.rescheduleAppointment(appointmentId, { appointmentDateTime: newDateTime }),
      appointmentId
    );
  }, [rescheduleAppointment]);

  // Refresh appointments manually
  const refreshAppointments = useCallback(() => {
    if (user?.id) {
      fetchAppointments(() => appointmentService.getPatientAppointments(user.id));
    }
  }, [user?.id, fetchAppointments]);

  // Get appointments by status
  const getAppointmentsByStatus = useCallback((status) => {
    return getEnhancedAppointments().filter(appointment => appointment.status === status);
  }, [getEnhancedAppointments]);

  // Get upcoming appointments
  const getUpcomingAppointments = useCallback(() => {
    const now = new Date();
    return getEnhancedAppointments()
      .filter(appointment => 
        new Date(appointment.appointmentDateTime) > now && 
        appointment.status === 'SCHEDULED'
      )
      .sort((a, b) => new Date(a.appointmentDateTime) - new Date(b.appointmentDateTime));
  }, [getEnhancedAppointments]);

  return {
    appointments: getEnhancedAppointments(),
    loading: fetchingAppointments || cancellingAppointment || reschedulingAppointment,
    error: fetchError,
    
    // Actions
    cancelAppointment: handleCancelAppointment,
    rescheduleAppointment: handleRescheduleAppointment,
    refreshAppointments,
    
    // Utilities
    getAppointmentsByStatus,
    getUpcomingAppointments,
    
    // Loading states
    fetchingAppointments,
    cancellingAppointment,
    reschedulingAppointment,
  };
};

export default useAppointments;
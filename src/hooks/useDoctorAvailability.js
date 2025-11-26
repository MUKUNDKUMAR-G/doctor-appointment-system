import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

/**
 * Hook for managing doctor availability with recurring schedules
 * Fetches and manages availability slots, recurring schedules, and bulk operations
 * 
 * @param {number} doctorId - The ID of the doctor
 * @param {Object} options - Configuration options { autoLoad, dateRange }
 * @returns {Object} Availability data and management functions
 */
export const useDoctorAvailability = (doctorId, options = {}) => {
  const { autoLoad = true, dateRange = null } = options;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [scheduleTemplates, setScheduleTemplates] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  
  // Track if component is mounted
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch availability for a specific date or date range
  const fetchAvailability = useCallback(async (date = null, endDate = null) => {
    if (!doctorId) return;

    try {
      setLoading(true);
      setError(null);

      let response;
      
      if (date && endDate) {
        // Fetch calendar view for range
        const startStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
        const endStr = typeof endDate === 'string' ? endDate : endDate.toISOString().split('T')[0];
        
        response = await api.get(`/doctor-availability/doctor/${doctorId}/calendar`, {
          params: { startDate: startStr, endDate: endStr },
        });
      } else if (date) {
        // Fetch single date
        const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
        
        response = await api.get(`/doctor-availability/doctor/${doctorId}/date/${dateStr}`);
      } else {
        // Fetch all availability (recurring + specific dates)
        response = await api.get(`/doctor-availability/doctor/${doctorId}`);
      }

      if (!isMountedRef.current) return;

      const availabilityData = response.data;
      setAvailability(Array.isArray(availabilityData) ? availabilityData : [availabilityData]);
    } catch (err) {
      console.error('Error fetching availability:', err);
      if (isMountedRef.current) {
        setError('Failed to load availability');
        setAvailability([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [doctorId]);

  // Fetch schedule templates
  const fetchScheduleTemplates = useCallback(async () => {
    if (!doctorId) return;

    try {
      const response = await api.get(`/doctors/${doctorId}/availability/templates`);
      
      if (!isMountedRef.current) return;
      
      setScheduleTemplates(response.data || []);
    } catch (err) {
      console.error('Error fetching schedule templates:', err);
      if (isMountedRef.current) {
        setScheduleTemplates([]);
      }
    }
  }, [doctorId]);

  // Add or update availability slot
  const updateAvailabilitySlot = useCallback(async (slotData) => {
    if (!doctorId) throw new Error('Doctor ID is required');

    const previousAvailability = availability;

    try {
      // Optimistic update
      if (slotData.id) {
        // Update existing slot
        if (isMountedRef.current) {
          setAvailability(prev =>
            prev.map(slot =>
              slot.id === slotData.id ? { ...slot, ...slotData } : slot
            )
          );
        }
      } else {
        // Add new slot
        const tempId = `temp_${Date.now()}`;
        const optimisticSlot = { ...slotData, id: tempId, isOptimistic: true };
        
        if (isMountedRef.current) {
          setAvailability(prev => [...prev, optimisticSlot]);
        }
      }

      // Submit to server
      const response = slotData.id
        ? await api.put(`/doctor-availability/${slotData.id}`, null, {
            params: {
              startTime: slotData.startTime,
              endTime: slotData.endTime,
              isAvailable: slotData.isAvailable,
              slotDurationMinutes: slotData.slotDurationMinutes
            }
          })
        : slotData.isRecurring
        ? await api.post('/doctor-availability/recurring', null, {
            params: {
              doctorId: doctorId,
              dayOfWeek: slotData.dayOfWeek,
              startTime: slotData.startTime,
              endTime: slotData.endTime,
              slotDurationMinutes: slotData.slotDurationMinutes || 30
            }
          })
        : await api.post('/doctor-availability/specific-date', null, {
            params: {
              doctorId: doctorId,
              availableDate: slotData.availableDate,
              startTime: slotData.startTime,
              endTime: slotData.endTime,
              slotDurationMinutes: slotData.slotDurationMinutes || 30
            }
          });

      if (!isMountedRef.current) return response.data;

      // Update with actual data
      if (slotData.id) {
        setAvailability(prev =>
          prev.map(slot =>
            slot.id === slotData.id ? response.data : slot
          )
        );
      } else {
        setAvailability(prev =>
          prev.map(slot =>
            slot.isOptimistic ? response.data : slot
          )
        );
      }

      return response.data;
    } catch (err) {
      // Rollback on error
      if (isMountedRef.current) {
        setAvailability(previousAvailability);
      }
      throw err;
    }
  }, [doctorId, availability]);

  // Delete availability slot
  const deleteAvailabilitySlot = useCallback(async (slotId) => {
    if (!doctorId) throw new Error('Doctor ID is required');

    const previousAvailability = availability;

    try {
      // Optimistic update
      if (isMountedRef.current) {
        setAvailability(prev => prev.filter(slot => slot.id !== slotId));
      }

      // Submit to server
      await api.delete(`/doctor-availability/${slotId}`);
    } catch (err) {
      // Rollback on error
      if (isMountedRef.current) {
        setAvailability(previousAvailability);
      }
      throw err;
    }
  }, [doctorId, availability]);

  // Bulk update availability
  const bulkUpdateAvailability = useCallback(async (bulkData) => {
    if (!doctorId) throw new Error('Doctor ID is required');

    try {
      setLoading(true);
      setError(null);

      const response = await api.post(
        `/doctors/${doctorId}/availability/bulk`,
        bulkData
      );

      if (!isMountedRef.current) return response.data;

      // Refresh availability after bulk update
      await fetchAvailability(bulkData.startDate, bulkData.endDate);

      return response.data;
    } catch (err) {
      console.error('Error bulk updating availability:', err);
      if (isMountedRef.current) {
        setError('Failed to update availability');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [doctorId, fetchAvailability]);

  // Apply schedule template to date range
  const applyScheduleTemplate = useCallback(async (templateId, startDate, endDate) => {
    if (!doctorId) throw new Error('Doctor ID is required');

    try {
      setLoading(true);
      setError(null);

      const response = await api.post(
        `/doctors/${doctorId}/availability/apply-template`,
        {
          templateId,
          startDate: typeof startDate === 'string' ? startDate : startDate.toISOString().split('T')[0],
          endDate: typeof endDate === 'string' ? endDate : endDate.toISOString().split('T')[0],
        }
      );

      if (!isMountedRef.current) return response.data;

      // Refresh availability after applying template
      await fetchAvailability(startDate, endDate);

      return response.data;
    } catch (err) {
      console.error('Error applying schedule template:', err);
      if (isMountedRef.current) {
        setError('Failed to apply schedule template');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [doctorId, fetchAvailability]);

  // Check for conflicts in availability
  const checkConflicts = useCallback(async (startDate, endDate) => {
    if (!doctorId) return;

    try {
      const response = await api.get(`/doctors/${doctorId}/availability/conflicts`, {
        params: {
          startDate: typeof startDate === 'string' ? startDate : startDate.toISOString().split('T')[0],
          endDate: typeof endDate === 'string' ? endDate : endDate.toISOString().split('T')[0],
        },
      });

      if (!isMountedRef.current) return;

      setConflicts(response.data || []);
      return response.data;
    } catch (err) {
      console.error('Error checking conflicts:', err);
      if (isMountedRef.current) {
        setConflicts([]);
      }
      return [];
    }
  }, [doctorId]);

  // Get available time slots for a specific date
  const getAvailableSlots = useCallback(async (date) => {
    if (!doctorId) return [];

    try {
      const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
      
      const response = await api.get(`/doctor-availability/doctor/${doctorId}/slots/${dateStr}`);

      return response.data || [];
    } catch (err) {
      console.error('Error fetching available slots:', err);
      return [];
    }
  }, [doctorId]);

  // Refresh availability
  const refresh = useCallback(async () => {
    if (dateRange) {
      await fetchAvailability(dateRange.start, dateRange.end);
    } else {
      await fetchAvailability();
    }
    await fetchScheduleTemplates();
  }, [fetchAvailability, fetchScheduleTemplates, dateRange]);

  // Reset state
  const reset = useCallback(() => {
    setAvailability([]);
    setScheduleTemplates([]);
    setConflicts([]);
    setError(null);
  }, []);

  // Initial fetch
  useEffect(() => {
    if (doctorId && autoLoad) {
      if (dateRange) {
        fetchAvailability(dateRange.start, dateRange.end);
      } else {
        fetchAvailability();
      }
      fetchScheduleTemplates();
    }
  }, [doctorId, autoLoad]); // Only depend on doctorId and autoLoad

  return {
    loading,
    error,
    availability,
    scheduleTemplates,
    conflicts,
    fetchAvailability,
    fetchScheduleTemplates,
    updateAvailabilitySlot,
    deleteAvailabilitySlot,
    bulkUpdateAvailability,
    applyScheduleTemplate,
    checkConflicts,
    getAvailableSlots,
    refresh,
    reset,
  };
};

export default useDoctorAvailability;

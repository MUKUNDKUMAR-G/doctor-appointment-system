import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import { appointmentService } from '../services/appointmentService';
import { doctorService } from '../services/doctorService';

const RealTimeSyncContext = createContext();

export const useRealTimeSync = () => {
  const context = useContext(RealTimeSyncContext);
  if (!context) {
    throw new Error('useRealTimeSync must be used within a RealTimeSyncProvider');
  }
  return context;
};

const RealTimeSyncProvider = ({ children }) => {
  const [syncStatus, setSyncStatus] = useState('disconnected');
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [appointmentUpdates, setAppointmentUpdates] = useState({});
  const [availabilityUpdates, setAvailabilityUpdates] = useState({});
  
  const { user, isAuthenticated } = useAuth();
  const { 
    notifyAppointmentBooked, 
    notifyAppointmentCancelled, 
    notifyAppointmentRescheduled,
    notifyAvailabilityUpdate 
  } = useNotification();
  
  const syncIntervalRef = useRef(null);
  const lastSyncRef = useRef(null);
  const subscribedDoctorsRef = useRef([]);

  // Sync appointment status with backend
  const syncAppointmentStatus = useCallback(async () => {
    if (!user || !isAuthenticated) return;

    try {
      setSyncStatus('syncing');
      
      // Get latest appointments for the user
      const appointments = await appointmentService.getPatientAppointments(user.id);
      
      // Check for status changes
      appointments.forEach(appointment => {
        setAppointmentUpdates(prev => {
          const previousStatus = prev[appointment.id]?.status;
          const currentStatus = appointment.status;
          
          if (previousStatus && previousStatus !== currentStatus) {
            // Status changed, notify user
            switch (currentStatus) {
              case 'CONFIRMED':
                if (previousStatus === 'PENDING') {
                  notifyAppointmentBooked(appointment);
                }
                break;
              case 'CANCELLED':
                notifyAppointmentCancelled(appointment);
                break;
              case 'RESCHEDULED':
                notifyAppointmentRescheduled(appointment);
                break;
            }
          }
          
          // Update local state
          return {
            ...prev,
            [appointment.id]: {
              ...appointment,
              lastUpdated: new Date(),
            }
          };
        });
      });
      
      setLastSyncTime(new Date());
      setSyncStatus('connected');
      
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
    }
  }, [user, isAuthenticated, notifyAppointmentBooked, notifyAppointmentCancelled, notifyAppointmentRescheduled]);

  // Sync doctor availability
  const syncDoctorAvailability = useCallback(async (doctorIds = []) => {
    if (!doctorIds.length) return;

    try {
      const availabilityPromises = doctorIds.map(async (doctorId) => {
        try {
          const today = new Date();
          const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          
          const availability = await doctorService.getDoctorAvailabilityRange(
            doctorId, 
            today, 
            nextWeek
          );
          
          // Check for new available slots and update state
          setAvailabilityUpdates(prev => {
            const previousAvailability = prev[doctorId];
            if (previousAvailability) {
              const newSlots = availability.filter(slot => 
                !previousAvailability.some(prevSlot => 
                  prevSlot.dateTime === slot.dateTime
                )
              );
              
              if (newSlots.length > 0) {
                // Get doctor info for notification
                doctorService.getDoctorProfile(doctorId)
                  .then(doctor => notifyAvailabilityUpdate(doctor, newSlots))
                  .catch(err => console.error('Error fetching doctor profile:', err));
              }
            }
            
            return {
              ...prev,
              [doctorId]: availability
            };
          });
          
        } catch (error) {
          console.error(`Error syncing availability for doctor ${doctorId}:`, error);
        }
      });
      
      await Promise.all(availabilityPromises);
      
    } catch (error) {
      console.error('Availability sync error:', error);
    }
  }, [notifyAvailabilityUpdate]);

  // Manual sync trigger
  const triggerSync = useCallback(async () => {
    await Promise.all([
      syncAppointmentStatus(),
      // Only sync availability for doctors the user has shown interest in
      syncDoctorAvailability(subscribedDoctorsRef.current)
    ]);
  }, [syncAppointmentStatus, syncDoctorAvailability]);

  // Subscribe to doctor availability updates
  const subscribeToDoctor = useCallback((doctorId) => {
    if (!subscribedDoctorsRef.current.includes(doctorId)) {
      subscribedDoctorsRef.current = [...subscribedDoctorsRef.current, doctorId];
    }
    setAvailabilityUpdates(prev => ({
      ...prev,
      [doctorId]: prev[doctorId] || []
    }));
  }, []);

  // Unsubscribe from doctor availability updates
  const unsubscribeFromDoctor = useCallback((doctorId) => {
    subscribedDoctorsRef.current = subscribedDoctorsRef.current.filter(id => id !== doctorId);
    setAvailabilityUpdates(prev => {
      const updated = { ...prev };
      delete updated[doctorId];
      return updated;
    });
  }, []);

  // Get real-time appointment status
  const getAppointmentStatus = useCallback((appointmentId) => {
    return appointmentUpdates[appointmentId] || null;
  }, [appointmentUpdates]);

  // Get real-time doctor availability
  const getDoctorAvailability = useCallback((doctorId) => {
    return availabilityUpdates[doctorId] || [];
  }, [availabilityUpdates]);

  // Check if appointment has recent updates
  const hasRecentUpdates = useCallback((appointmentId, minutes = 5) => {
    const appointment = appointmentUpdates[appointmentId];
    if (!appointment?.lastUpdated) return false;
    
    const now = new Date();
    const updateTime = new Date(appointment.lastUpdated);
    const diffMinutes = (now - updateTime) / (1000 * 60);
    
    return diffMinutes <= minutes;
  }, [appointmentUpdates]);

  // Set up periodic sync - DISABLED to prevent infinite loops
  // Users can manually trigger sync using triggerSync() if needed
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setSyncStatus('disconnected');
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      return;
    }

    // Set status to connected but don't auto-sync
    setSyncStatus('connected');

    // Cleanup interval if it exists
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);

  const value = {
    syncStatus,
    lastSyncTime,
    appointmentUpdates,
    availabilityUpdates,
    triggerSync,
    subscribeToDoctor,
    unsubscribeFromDoctor,
    getAppointmentStatus,
    getDoctorAvailability,
    hasRecentUpdates,
  };

  return (
    <RealTimeSyncContext.Provider value={value}>
      {children}
    </RealTimeSyncContext.Provider>
  );
};

export { RealTimeSyncProvider };
export default RealTimeSyncContext;
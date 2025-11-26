import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import websocketService from '../services/websocketService';
import { getSystemStats, getRecentActivity } from '../services/adminService';

const AdminRealTimeContext = createContext();

export const useAdminRealTime = () => {
  const context = useContext(AdminRealTimeContext);
  if (!context) {
    throw new Error('useAdminRealTime must be used within an AdminRealTimeProvider');
  }
  return context;
};

export const AdminRealTimeProvider = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [stats, setStats] = useState(null);
  const [userUpdates, setUserUpdates] = useState([]);
  const [doctorUpdates, setDoctorUpdates] = useState([]);
  const [appointmentUpdates, setAppointmentUpdates] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  const { user, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  
  const pollingIntervalRef = useRef(null);
  const isAdminRef = useRef(false);

  // Check if user is admin
  useEffect(() => {
    isAdminRef.current = user?.role === 'ADMIN';
  }, [user]);

  // Handle connection status changes
  const handleConnectionStatus = useCallback((status) => {
    setConnectionStatus(status);
    
    if (status === 'failed') {
      // Fall back to polling
      console.log('WebSocket failed, falling back to polling');
      startPolling();
    } else if (status === 'connected') {
      // Stop polling if WebSocket connects
      stopPolling();
    }
  }, []);

  // Start polling as fallback
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return;
    
    console.log('Starting polling fallback');
    
    // Poll every 30 seconds
    pollingIntervalRef.current = setInterval(async () => {
      if (!isAdminRef.current) return;
      
      try {
        const statsData = await getSystemStats();
        setStats(statsData);
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 30000);
    
    // Initial fetch
    if (isAdminRef.current) {
      getSystemStats().then(setStats).catch(console.error);
    }
  }, []);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      console.log('Stopped polling');
    }
  }, []);

  // Subscribe to stats updates
  const subscribeToStats = useCallback(() => {
    return websocketService.subscribe('/topic/admin/stats', (update) => {
      if (update.type === 'STATS' && update.data) {
        setStats(update.data);
      }
    });
  }, []);

  // Subscribe to user updates
  const subscribeToUsers = useCallback(() => {
    return websocketService.subscribe('/topic/admin/users', (update) => {
      if (update.type === 'USER') {
        setUserUpdates(prev => [update, ...prev].slice(0, 50)); // Keep last 50 updates
        
        // Show notification for important updates
        if (update.action === 'STATUS_CHANGED') {
          showNotification(`User status updated`, 'info');
        }
      }
    });
  }, [showNotification]);

  // Subscribe to doctor updates
  const subscribeToDoctors = useCallback(() => {
    return websocketService.subscribe('/topic/admin/doctors', (update) => {
      if (update.type === 'DOCTOR') {
        setDoctorUpdates(prev => [update, ...prev].slice(0, 50));
        
        // Show notification for verification updates
        if (update.action === 'VERIFICATION_CHANGED') {
          showNotification(`Doctor verification updated`, 'info');
        }
      }
    });
  }, [showNotification]);

  // Subscribe to appointment updates
  const subscribeToAppointments = useCallback(() => {
    return websocketService.subscribe('/topic/admin/appointments', (update) => {
      if (update.type === 'APPOINTMENT') {
        setAppointmentUpdates(prev => [update, ...prev].slice(0, 50));
        
        // Show notification for new appointments
        if (update.action === 'CREATED') {
          showNotification(`New appointment created`, 'info');
        }
      }
    });
  }, [showNotification]);

  // Subscribe to notifications
  const subscribeToNotifications = useCallback(() => {
    return websocketService.subscribe('/topic/admin/notifications', (update) => {
      if (update.type === 'NOTIFICATION') {
        setNotifications(prev => [update.data, ...prev].slice(0, 100));
        showNotification(update.data.message || 'New notification', update.data.severity || 'info');
      }
    });
  }, [showNotification]);

  // Initialize WebSocket connection for admin users
  useEffect(() => {
    if (!isAuthenticated || !isAdminRef.current) {
      return;
    }

    // Add connection listener
    websocketService.addConnectionListener(handleConnectionStatus);

    // Connect to WebSocket
    websocketService.connect(
      () => {
        console.log('Admin WebSocket connected, subscribing to topics...');
        
        // Subscribe to all admin topics
        subscribeToStats();
        subscribeToUsers();
        subscribeToDoctors();
        subscribeToAppointments();
        subscribeToNotifications();
      },
      (error) => {
        console.error('WebSocket connection error:', error);
        // Will automatically fall back to polling via handleConnectionStatus
      }
    );

    // Cleanup
    return () => {
      websocketService.removeConnectionListener(handleConnectionStatus);
      websocketService.unsubscribe('/topic/admin/stats');
      websocketService.unsubscribe('/topic/admin/users');
      websocketService.unsubscribe('/topic/admin/doctors');
      websocketService.unsubscribe('/topic/admin/appointments');
      websocketService.unsubscribe('/topic/admin/notifications');
      stopPolling();
    };
  }, [
    isAuthenticated,
    handleConnectionStatus,
    subscribeToStats,
    subscribeToUsers,
    subscribeToDoctors,
    subscribeToAppointments,
    subscribeToNotifications,
    stopPolling,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
      if (isAdminRef.current) {
        websocketService.disconnect();
      }
    };
  }, [stopPolling]);

  const value = {
    connectionStatus,
    stats,
    userUpdates,
    doctorUpdates,
    appointmentUpdates,
    notifications,
    isConnected: connectionStatus === 'connected',
    isPolling: pollingIntervalRef.current !== null,
  };

  return (
    <AdminRealTimeContext.Provider value={value}>
      {children}
    </AdminRealTimeContext.Provider>
  );
};

export default AdminRealTimeContext;

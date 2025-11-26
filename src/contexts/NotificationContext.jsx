import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useError } from './ErrorContext';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const { addSuccess, addInfo } = useError();

  // Add a new notification
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      read: false,
      type: 'info',
      ...notification,
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show toast notification for important updates
    if (notification.showToast !== false) {
      switch (notification.type) {
        case 'appointment_booked':
          addSuccess('Appointment booked successfully!');
          break;
        case 'appointment_cancelled':
          addInfo('Appointment has been cancelled');
          break;
        case 'appointment_rescheduled':
          addInfo('Appointment has been rescheduled');
          break;
        case 'appointment_reminder':
          addInfo(notification.message || 'You have an upcoming appointment');
          break;
        default:
          if (notification.message) {
            addInfo(notification.message);
          }
      }
    }

    return newNotification.id;
  }, [addSuccess, addInfo]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  }, []);

  // Remove notification
  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Get notifications by type
  const getNotificationsByType = useCallback((type) => {
    return notifications.filter(notification => notification.type === type);
  }, [notifications]);

  // Appointment-specific notification helpers
  const notifyAppointmentBooked = useCallback((appointment) => {
    addNotification({
      type: 'appointment_booked',
      title: 'Appointment Booked',
      message: `Your appointment with Dr. ${appointment.doctorName} has been confirmed for ${appointment.dateTime}`,
      data: appointment,
      priority: 'high',
    });
  }, [addNotification]);

  const notifyAppointmentCancelled = useCallback((appointment) => {
    addNotification({
      type: 'appointment_cancelled',
      title: 'Appointment Cancelled',
      message: `Your appointment with Dr. ${appointment.doctorName} on ${appointment.dateTime} has been cancelled`,
      data: appointment,
      priority: 'medium',
    });
  }, [addNotification]);

  const notifyAppointmentRescheduled = useCallback((appointment) => {
    addNotification({
      type: 'appointment_rescheduled',
      title: 'Appointment Rescheduled',
      message: `Your appointment with Dr. ${appointment.doctorName} has been rescheduled to ${appointment.newDateTime}`,
      data: appointment,
      priority: 'medium',
    });
  }, [addNotification]);

  const notifyAppointmentReminder = useCallback((appointment) => {
    addNotification({
      type: 'appointment_reminder',
      title: 'Upcoming Appointment',
      message: `Reminder: You have an appointment with Dr. ${appointment.doctorName} tomorrow at ${appointment.time}`,
      data: appointment,
      priority: 'medium',
    });
  }, [addNotification]);

  const notifyAvailabilityUpdate = useCallback((doctor, availableSlots) => {
    addNotification({
      type: 'availability_update',
      title: 'New Availability',
      message: `Dr. ${doctor.name} has new available slots`,
      data: { doctor, availableSlots },
      priority: 'low',
      showToast: false, // Don't show toast for availability updates
    });
  }, [addNotification]);

  // Simulate real-time updates (in a real app, this would be WebSocket or Server-Sent Events)
  useEffect(() => {
    if (!user) return;

    // Simulate periodic availability updates
    const availabilityInterval = setInterval(() => {
      // This would be replaced with actual WebSocket/SSE implementation
      // For now, we'll just simulate occasional updates
      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        // Simulate availability update
        console.log('Simulating availability update...');
      }
    }, 30000);

    // Simulate appointment reminders
    const reminderInterval = setInterval(() => {
      // Check for appointments in the next 24 hours and send reminders
      // This would be handled by the backend in a real implementation
      console.log('Checking for appointment reminders...');
    }, 60000 * 60); // Check every hour

    return () => {
      clearInterval(availabilityInterval);
      clearInterval(reminderInterval);
    };
  }, [user]);

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
    getNotificationsByType,
    // Appointment-specific helpers
    notifyAppointmentBooked,
    notifyAppointmentCancelled,
    notifyAppointmentRescheduled,
    notifyAppointmentReminder,
    notifyAvailabilityUpdate,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
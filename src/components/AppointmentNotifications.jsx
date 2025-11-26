import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Button,
  Chip,
  Alert,
  Badge,
  Collapse,
  Divider,
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  Schedule,
  CheckCircle,
  Cancel,
  Edit,
  Close,
  ExpandMore,
  ExpandLess,
  CalendarToday,
} from '@mui/icons-material';
import { format, parseISO, differenceInHours, differenceInDays, isToday, isTomorrow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { appointmentService } from '../services/appointmentService';
import { dateUtils } from '../utils/dateUtils';
import { APPOINTMENT_STATUS } from '../utils/constants';

const AppointmentNotifications = ({ compact = false }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [expanded, setExpanded] = useState(!compact);
  const [loading, setLoading] = useState(true);

  // Generate notifications from appointments
  const generateNotifications = (appointments) => {
    const now = new Date();
    const notificationList = [];

    appointments.forEach(appointment => {
      if (appointment.status !== APPOINTMENT_STATUS.SCHEDULED) return;

      const appointmentDate = parseISO(appointment.appointmentDateTime);
      const hoursUntil = differenceInHours(appointmentDate, now);
      const daysUntil = differenceInDays(appointmentDate, now);

      const doctorName = appointment.doctorName 
        ? `Dr. ${appointment.doctorName}`
        : 'Unknown Doctor';

      // Upcoming appointment reminders
      if (hoursUntil > 0) {
        let notificationType = 'info';
        let message = '';
        let priority = 0;

        if (hoursUntil <= 2) {
          // 2 hours or less
          notificationType = 'urgent';
          message = `Appointment with ${doctorName} in ${hoursUntil} hour${hoursUntil !== 1 ? 's' : ''}`;
          priority = 3;
        } else if (hoursUntil <= 24) {
          // Today
          notificationType = 'today';
          message = `Appointment with ${doctorName} today at ${dateUtils.formatTime(appointmentDate)}`;
          priority = 2;
        } else if (daysUntil === 1) {
          // Tomorrow
          notificationType = 'tomorrow';
          message = `Appointment with ${doctorName} tomorrow at ${dateUtils.formatTime(appointmentDate)}`;
          priority = 1;
        } else if (daysUntil <= 7) {
          // This week
          notificationType = 'week';
          message = `Appointment with ${doctorName} on ${format(appointmentDate, 'EEEE')} at ${dateUtils.formatTime(appointmentDate)}`;
          priority = 0;
        }

        if (message) {
          notificationList.push({
            id: `reminder-${appointment.id}`,
            type: notificationType,
            message,
            appointment,
            priority,
            timestamp: now,
            read: false,
          });
        }
      }
    });

    // Sort by priority (highest first) then by appointment date
    notificationList.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      const dateA = parseISO(a.appointment.appointmentDateTime);
      const dateB = parseISO(b.appointment.appointmentDateTime);
      return dateA.getTime() - dateB.getTime();
    });

    return notificationList;
  };

  // Fetch appointments and generate notifications
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const appointments = await appointmentService.getPatientAppointments(user.id);
        const generatedNotifications = generateNotifications(appointments);
        setNotifications(generatedNotifications);
      } catch (error) {
        console.error('Failed to fetch appointments for notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchAppointments();
      
      // Refresh notifications every 5 minutes
      const interval = setInterval(fetchAppointments, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  // Get notification icon and color
  const getNotificationStyle = (type) => {
    switch (type) {
      case 'urgent':
        return { icon: NotificationsActive, color: 'error.main', bgcolor: 'error.50' };
      case 'today':
        return { icon: Schedule, color: 'warning.main', bgcolor: 'warning.50' };
      case 'tomorrow':
        return { icon: CalendarToday, color: 'info.main', bgcolor: 'info.50' };
      case 'week':
        return { icon: Notifications, color: 'primary.main', bgcolor: 'primary.50' };
      default:
        return { icon: Notifications, color: 'text.secondary', bgcolor: 'grey.50' };
    }
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Dismiss notification
  const dismissNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.type === 'urgent' && !n.read).length;

  if (loading) {
    return null;
  }

  if (notifications.length === 0) {
    return compact ? null : (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Notifications sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          No appointment notifications
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ overflow: 'hidden' }}>
      {/* Header */}
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="space-between" 
        p={2}
        sx={{ 
          bgcolor: urgentCount > 0 ? 'error.50' : unreadCount > 0 ? 'warning.50' : 'grey.50',
          cursor: compact ? 'pointer' : 'default'
        }}
        onClick={compact ? () => setExpanded(!expanded) : undefined}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Badge badgeContent={unreadCount} color="error">
            <Notifications color={urgentCount > 0 ? 'error' : 'primary'} />
          </Badge>
          <Typography variant="h6">
            Appointment Reminders
          </Typography>
        </Box>
        
        {compact && (
          <IconButton size="small">
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        )}
      </Box>

      {/* Notifications List */}
      <Collapse in={expanded}>
        <List sx={{ p: 0 }}>
          {notifications.slice(0, compact ? 3 : notifications.length).map((notification, index) => {
            const style = getNotificationStyle(notification.type);
            const IconComponent = style.icon;

            return (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    bgcolor: notification.read ? 'transparent' : style.bgcolor,
                    opacity: notification.read ? 0.7 : 1,
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon>
                    <IconComponent sx={{ color: style.color }} />
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={notification.message}
                    secondary={
                      <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                        <Chip
                          label={notification.appointment.doctorSpecialty || 'General'}
                          size="small"
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary" component="span">
                          {dateUtils.formatDateTime(notification.appointment.appointmentDateTime)}
                        </Typography>
                      </Box>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />

                  <Box display="flex" gap={0.5}>
                    {!notification.read && (
                      <IconButton
                        size="small"
                        onClick={() => markAsRead(notification.id)}
                        title="Mark as read"
                      >
                        <CheckCircle fontSize="small" />
                      </IconButton>
                    )}
                    
                    <IconButton
                      size="small"
                      onClick={() => dismissNotification(notification.id)}
                      title="Dismiss"
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItem>
                
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            );
          })}
        </List>

        {compact && notifications.length > 3 && (
          <Box p={2} textAlign="center">
            <Button size="small" onClick={() => setExpanded(false)}>
              View All ({notifications.length})
            </Button>
          </Box>
        )}
      </Collapse>

      {/* Urgent Alert */}
      {urgentCount > 0 && (
        <Alert severity="error" sx={{ m: 2, mt: 0 }}>
          <Typography variant="body2">
            You have {urgentCount} appointment{urgentCount !== 1 ? 's' : ''} in the next 2 hours!
          </Typography>
        </Alert>
      )}
    </Paper>
  );
};

export default AppointmentNotifications;
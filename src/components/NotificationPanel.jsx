import { useState } from 'react';
import {
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Event as EventIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationPanel = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification 
  } = useNotification();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment_booked':
        return <CheckCircleIcon color="success" />;
      case 'appointment_cancelled':
        return <CancelIcon color="error" />;
      case 'appointment_rescheduled':
        return <ScheduleIcon color="warning" />;
      case 'appointment_reminder':
        return <EventIcon color="primary" />;
      case 'availability_update':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'appointment_booked':
        return 'success';
      case 'appointment_cancelled':
        return 'error';
      case 'appointment_rescheduled':
        return 'warning';
      case 'appointment_reminder':
        return 'primary';
      case 'availability_update':
        return 'info';
      default:
        return 'default';
    }
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ ml: 1 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 400, maxHeight: 500 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6">
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                onClick={markAllAsRead}
                sx={{ textTransform: 'none' }}
              >
                Mark all as read
              </Button>
            )}
          </Box>

          {notifications.length === 0 ? (
            <Box textAlign="center" py={3}>
              <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No notifications yet
              </Typography>
            </Box>
          ) : (
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {notifications.map((notification, index) => (
                <Box key={notification.id}>
                  <ListItem
                    button
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      backgroundColor: notification.read ? 'transparent' : 'action.hover',
                      borderRadius: 1,
                      mb: 0.5,
                    }}
                  >
                    <ListItemIcon>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle2" component="span">
                            {notification.title}
                          </Typography>
                          {!notification.read && (
                            <Chip
                              label="New"
                              size="small"
                              color={getNotificationColor(notification.type)}
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationPanel;
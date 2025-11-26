import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Badge,
  Drawer,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Chip,
} from '@mui/material';
import {
  Notifications,
  Close,
  Info,
  Warning,
  Error as ErrorIcon,
  CheckCircle,
  Delete,
  DoneAll,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { colors } from '../../../theme/colors';

const NotificationButton = styled(IconButton)(({ theme }) => ({
  color: colors.text.primary,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: colors.primary[50],
    color: colors.primary.main,
  },
}));

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 2.5),
  borderBottom: `1px solid ${colors.grey[200]}`,
}));

const DrawerTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 700,
  color: colors.text.primary,
}));

const DrawerContent = styled(Box)(({ theme }) => ({
  width: 400,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down('sm')]: {
    width: '100vw',
  },
}));

const NotificationList = styled(List)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: 0,
}));

const NotificationItem = styled(ListItem)(({ theme, read }) => ({
  padding: theme.spacing(2, 2.5),
  backgroundColor: read ? 'transparent' : colors.primary[50],
  borderBottom: `1px solid ${colors.grey[100]}`,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: colors.grey[50],
  },
}));

const NotificationIconWrapper = styled(Box)(({ theme, severity }) => {
  const severityColors = {
    info: colors.info.main,
    warning: colors.warning.main,
    error: colors.error.main,
    success: colors.success.main,
  };
  
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: '10px',
    backgroundColor: `${severityColors[severity]}15`,
    color: severityColors[severity],
  };
});

const NotificationTime = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: colors.text.secondary,
  marginTop: theme.spacing(0.5),
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6, 3),
  textAlign: 'center',
}));

const EmptyIcon = styled(Notifications)(({ theme }) => ({
  fontSize: '4rem',
  color: colors.grey[300],
  marginBottom: theme.spacing(2),
}));

const ActionsBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  padding: theme.spacing(2, 2.5),
  borderTop: `1px solid ${colors.grey[200]}`,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  flex: 1,
  textTransform: 'none',
  fontWeight: 600,
}));

const severityIcons = {
  info: Info,
  warning: Warning,
  error: ErrorIcon,
  success: CheckCircle,
};

/**
 * NotificationCenter - Notification panel with unread counts
 * 
 * @param {Array} notifications - Array of notification objects
 * @param {Function} onDismiss - Callback to dismiss a notification
 * @param {Function} onDismissAll - Callback to dismiss all notifications
 * @param {Function} onMarkAllRead - Callback to mark all as read
 */
const NotificationCenter = ({
  notifications = [],
  onDismiss,
  onDismissAll,
  onMarkAllRead,
}) => {
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleToggle = () => {
    setOpen(!open);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleNotificationClick = (notification) => {
    if (notification.onClick) {
      notification.onClick();
    }
    if (!notification.read && onDismiss) {
      onDismiss(notification.id);
    }
  };

  const handleMarkAllRead = () => {
    if (onMarkAllRead) {
      onMarkAllRead();
    }
  };

  const handleDismissAll = () => {
    if (onDismissAll) {
      onDismissAll();
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now - notificationTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notificationTime.toLocaleDateString();
  };

  return (
    <>
      <NotificationButton
        onClick={handleToggle}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Badge badgeContent={unreadCount} color="error">
          <Notifications />
        </Badge>
      </NotificationButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        aria-label="Notification center"
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Notifications</DrawerTitle>
            <IconButton onClick={handleClose} aria-label="Close notifications">
              <Close />
            </IconButton>
          </DrawerHeader>

          {notifications.length === 0 ? (
            <EmptyState>
              <EmptyIcon />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No notifications
              </Typography>
              <Typography variant="body2" color="textSecondary">
                You're all caught up!
              </Typography>
            </EmptyState>
          ) : (
            <>
              <NotificationList>
                {notifications.map((notification) => {
                  const Icon = severityIcons[notification.severity] || Info;
                  return (
                    <NotificationItem
                      key={notification.id}
                      read={notification.read}
                      onClick={() => handleNotificationClick(notification)}
                      role="button"
                      aria-label={`${notification.read ? 'Read' : 'Unread'} notification: ${notification.message}`}
                    >
                      <ListItemIcon>
                        <NotificationIconWrapper severity={notification.severity}>
                          <Icon />
                        </NotificationIconWrapper>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" fontWeight={notification.read ? 400 : 600}>
                              {notification.message}
                            </Typography>
                            {!notification.read && (
                              <Chip
                                label="New"
                                size="small"
                                color="primary"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <NotificationTime>
                            {formatTime(notification.timestamp)}
                          </NotificationTime>
                        }
                      />
                    </NotificationItem>
                  );
                })}
              </NotificationList>

              {notifications.length > 0 && (
                <ActionsBar>
                  {unreadCount > 0 && (
                    <ActionButton
                      variant="outlined"
                      startIcon={<DoneAll />}
                      onClick={handleMarkAllRead}
                      aria-label="Mark all as read"
                    >
                      Mark all read
                    </ActionButton>
                  )}
                  <ActionButton
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={handleDismissAll}
                    aria-label="Clear all notifications"
                  >
                    Clear all
                  </ActionButton>
                </ActionsBar>
              )}
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default NotificationCenter;

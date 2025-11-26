import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Badge,
  Divider,
  ListItemIcon,
  ListItemText,
  useScrollTrigger,
} from '@mui/material';
import {
  AccountCircle,
  Dashboard,
  LocalHospital,
  CalendarToday,
  ExitToApp,
  Notifications,
  Settings,
  Person,
  AdminPanelSettings,
  Assessment,
  History,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { USER_ROLES } from '../../../utils/constants';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);

  // Detect scroll for backdrop blur effect
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const getNavigationItems = () => {
    if (!isAuthenticated) return [];

    const baseItems = [
      { label: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
    ];

    if (user?.role === USER_ROLES.PATIENT) {
      return [
        ...baseItems,
        { label: 'Find Doctors', path: '/doctors', icon: <LocalHospital /> },
        { label: 'My Appointments', path: '/appointments', icon: <CalendarToday /> },
        { label: 'Profile', path: '/profile', icon: <AccountCircle /> },
      ];
    }

    if (user?.role === USER_ROLES.DOCTOR) {
      return [
        { label: 'Doctor Dashboard', path: '/doctor-dashboard', icon: <Dashboard /> },
        { label: 'Profile', path: '/doctor/profile', icon: <AccountCircle /> },
      ];
    }

    if (user?.role === USER_ROLES.ADMIN) {
      return [
        { label: 'Dashboard', path: '/admin-dashboard', icon: <AdminPanelSettings /> },
        { label: 'Users', path: '/admin/users', icon: <Person /> },
        { label: 'Doctors', path: '/admin/doctors', icon: <LocalHospital /> },
        { label: 'Appointments', path: '/admin/appointments', icon: <CalendarToday /> },
        { label: 'Reports', path: '/admin/reports', icon: <Assessment /> },
        { label: 'Audit Log', path: '/admin/audit-logs', icon: <History /> },
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  if (!isAuthenticated) {
    return (
      <AppBar
        position="fixed"
        elevation={trigger ? 4 : 0}
        sx={{
          backgroundColor: trigger ? 'rgba(255, 255, 255, 0.9)' : 'primary.main',
          backdropFilter: trigger ? 'blur(10px)' : 'none',
          transition: 'all 0.3s ease',
          color: trigger ? 'text.primary' : 'white',
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              background: trigger ? 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)' : 'white',
              WebkitBackgroundClip: trigger ? 'text' : 'unset',
              WebkitTextFillColor: trigger ? 'transparent' : 'white',
            }}
          >
            Healthcare System
          </Typography>
          <Button
            color="inherit"
            onClick={() => navigate('/login')}
            sx={{ mr: 1 }}
          >
            Login
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/register')}
            sx={{
              backgroundColor: trigger ? 'primary.main' : 'white',
              color: trigger ? 'white' : 'primary.main',
              '&:hover': {
                backgroundColor: trigger ? 'primary.dark' : 'rgba(255, 255, 255, 0.9)',
              },
            }}
          >
            Register
          </Button>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <>
      <AppBar
        position="fixed"
        elevation={trigger ? 4 : 0}
        sx={{
          backgroundColor: trigger ? 'rgba(255, 255, 255, 0.95)' : 'white',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }}>
          {/* Logo */}
          <Box
            component="button"
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
            }}
            onClick={() => handleNavigation('/dashboard')}
            aria-label="Healthcare - Go to dashboard"
          >
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mr: 4,
              }}
            >
              Healthcare
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexGrow: 1,
              gap: 1,
            }}
          >
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Box key={item.path} sx={{ position: 'relative' }}>
                  <Button
                    color="inherit"
                    startIcon={item.icon}
                    onClick={() => handleNavigation(item.path)}
                    aria-label={`${item.label}${isActive ? ' (current page)' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    sx={{
                      px: 2,
                      py: 1,
                      color: isActive ? 'primary.main' : 'text.secondary',
                      fontWeight: isActive ? 600 : 400,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        color: 'primary.main',
                        backgroundColor: 'rgba(37, 99, 235, 0.04)',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        exit={{ scaleX: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: 3,
                          background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)',
                          borderRadius: '3px 3px 0 0',
                        }}
                      />
                    )}
                  </AnimatePresence>
                </Box>
              );
            })}
          </Box>

          <Box sx={{ flexGrow: { xs: 1, md: 0 } }} />

          {/* Notification Bell */}
          <IconButton
            size="large"
            aria-label={`show ${unreadCount} new notifications`}
            color="inherit"
            onClick={handleNotificationOpen}
            sx={{
              mr: 1,
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                backgroundColor: 'rgba(37, 99, 235, 0.04)',
              },
            }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="body2"
              sx={{
                mr: 1,
                display: { xs: 'none', sm: 'block' },
                fontWeight: 500,
                color: 'text.primary',
              }}
            >
              {user?.firstName} {user?.lastName}
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(37, 99, 235, 0.04)',
                },
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                  fontWeight: 600,
                }}
              >
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Notification Menu */}
      <Menu
        id="notification-menu"
        anchorEl={notificationAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 320,
            maxWidth: 400,
            maxHeight: 400,
            borderRadius: 2,
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
        </Box>
        {notifications && notifications.length > 0 ? (
          notifications.slice(0, 5).map((notification, index) => (
            <MenuItem
              key={notification.id || index}
              onClick={handleNotificationClose}
              sx={{
                py: 1.5,
                px: 2,
                backgroundColor: notification.read ? 'transparent' : 'rgba(37, 99, 235, 0.04)',
                '&:hover': {
                  backgroundColor: 'rgba(37, 99, 235, 0.08)',
                },
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {notification.timestamp instanceof Date 
                    ? formatDistanceToNow(notification.timestamp, { addSuffix: true })
                    : notification.timestamp}
                </Typography>
              </Box>
            </MenuItem>
          ))
        ) : (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        )}
        {notifications && notifications.length > 5 && (
          <>
            <Divider />
            <MenuItem
              onClick={() => {
                handleNotificationClose();
                navigate('/notifications');
              }}
              sx={{ justifyContent: 'center', color: 'primary.main', fontWeight: 600 }}
            >
              View All Notifications
            </MenuItem>
          </>
        )}
      </Menu>

      {/* User Menu */}
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        {/* Mobile navigation items */}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          {navigationItems.map((item) => (
            <MenuItem
              key={item.path}
              onClick={() => {
                handleNavigation(item.path);
                handleMenuClose();
              }}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText>{item.label}</ListItemText>
            </MenuItem>
          ))}
          <Divider sx={{ my: 1 }} />
        </Box>

        <MenuItem
          onClick={() => {
            handleNavigation('/profile');
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleNavigation('/settings');
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <ExitToApp fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Logout</ListItemText>
        </MenuItem>
      </Menu>

      {/* Spacer for fixed header */}
      <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }} />
    </>
  );
};

export default Header;

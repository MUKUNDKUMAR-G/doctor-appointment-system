import { useNavigate, useLocation } from 'react-router-dom';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Dashboard,
  LocalHospital,
  CalendarToday,
  AccountCircle,
  Menu as MenuIcon,
  Close,
  AdminPanelSettings,
  Person,
  Settings,
  ExitToApp,
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { USER_ROLES } from '../../../utils/constants';
import { motion, AnimatePresence } from 'framer-motion';

const MobileNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = async () => {
    setDrawerOpen(false);
    await logout();
    navigate('/login');
  };

  const getBottomNavItems = () => {
    if (user?.role === USER_ROLES.PATIENT) {
      return [
        { label: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
        { label: 'Doctors', path: '/doctors', icon: <LocalHospital /> },
        { label: 'Appointments', path: '/appointments', icon: <CalendarToday /> },
        { label: 'Profile', path: '/profile', icon: <AccountCircle /> },
      ];
    }

    if (user?.role === USER_ROLES.DOCTOR) {
      return [
        { label: 'Dashboard', path: '/doctor-dashboard', icon: <Dashboard /> },
        { label: 'Profile', path: '/doctor/profile', icon: <AccountCircle /> },
      ];
    }

    if (user?.role === USER_ROLES.ADMIN) {
      return [
        { label: 'Dashboard', path: '/admin-dashboard', icon: <AdminPanelSettings /> },
        { label: 'Users', path: '/admin/users', icon: <Person /> },
        { label: 'Doctors', path: '/admin/doctors', icon: <LocalHospital /> },
        { label: 'Appointments', path: '/admin/appointments', icon: <CalendarToday /> },
      ];
    }

    return [];
  };

  const getDrawerItems = () => {
    const items = [
      { label: 'Settings', path: '/settings', icon: <Settings /> },
    ];

    if (user?.role === USER_ROLES.PATIENT) {
      items.unshift(
        { label: 'Notifications', path: '/notifications', icon: <CalendarToday /> }
      );
    }

    return items;
  };

  const bottomNavItems = getBottomNavItems();
  const drawerItems = getDrawerItems();

  // Get current value for bottom navigation
  const getCurrentValue = () => {
    const currentItem = bottomNavItems.find(item => location.pathname === item.path);
    return currentItem ? currentItem.path : false;
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: { xs: 'block', md: 'none' },
          zIndex: 1200,
          borderTop: '1px solid',
          borderColor: 'divider',
          boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.05)',
        }}
        elevation={3}
      >
        <BottomNavigation
          value={getCurrentValue()}
          onChange={(event, newValue) => {
            handleNavigation(newValue);
          }}
          showLabels
          sx={{
            height: 64,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              padding: '6px 12px 8px',
              '&.Mui-selected': {
                color: 'primary.main',
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.75rem',
                  fontWeight: 600,
                },
              },
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.7rem',
              marginTop: '4px',
            },
          }}
        >
          {bottomNavItems.map((item) => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              value={item.path}
              icon={item.icon}
              sx={{
                '& .MuiSvgIcon-root': {
                  fontSize: '1.5rem',
                },
              }}
            />
          ))}
        </BottomNavigation>
      </Paper>

      {/* Hamburger Menu Button (Fixed in top-right) */}
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          display: { xs: 'block', md: 'none' },
          zIndex: 1300,
        }}
      >
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            backgroundColor: 'white',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      </Box>

      {/* Swipeable Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          },
        }}
      >
        <AnimatePresence>
          {drawerOpen && (
            <motion.div
              initial={{ x: 280 }}
              animate={{ x: 0 }}
              exit={{ x: 280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              {/* Drawer Header */}
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                  color: 'white',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      fontWeight: 600,
                    }}
                  >
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {user?.firstName} {user?.lastName}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      {user?.email}
                    </Typography>
                  </Box>
                </Box>
                <IconButton
                  onClick={handleDrawerToggle}
                  sx={{ color: 'white' }}
                >
                  <Close />
                </IconButton>
              </Box>

              <Divider />

              {/* Drawer Items */}
              <List sx={{ pt: 2 }}>
                {drawerItems.map((item) => (
                  <ListItem key={item.path} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        handleNavigation(item.path);
                        setDrawerOpen(false);
                      }}
                      selected={location.pathname === item.path}
                      sx={{
                        py: 1.5,
                        px: 2,
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(37, 99, 235, 0.08)',
                          borderLeft: '3px solid',
                          borderColor: 'primary.main',
                          '& .MuiListItemIcon-root': {
                            color: 'primary.main',
                          },
                          '& .MuiListItemText-primary': {
                            color: 'primary.main',
                            fontWeight: 600,
                          },
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(37, 99, 235, 0.04)',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 40,
                          color: 'text.secondary',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: '0.95rem',
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ mt: 'auto' }} />

              {/* Logout Button */}
              <List>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={handleLogout}
                    sx={{
                      py: 1.5,
                      px: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(239, 68, 68, 0.04)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: 'error.main',
                      }}
                    >
                      <ExitToApp />
                    </ListItemIcon>
                    <ListItemText
                      primary="Logout"
                      primaryTypographyProps={{
                        fontSize: '0.95rem',
                        color: 'error.main',
                        fontWeight: 500,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            </motion.div>
          )}
        </AnimatePresence>
      </Drawer>

      {/* Spacer for bottom navigation */}
      <Box sx={{ height: 64, display: { xs: 'block', md: 'none' } }} />
    </>
  );
};

export default MobileNav;

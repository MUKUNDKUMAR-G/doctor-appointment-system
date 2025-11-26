import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Divider,
} from '@mui/material';
import {
  AccountCircle,
  Dashboard,
  LocalHospital,
  CalendarToday,
  ExitToApp,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { USER_ROLES } from '../utils/constants';

const Navigation = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
      { label: 'Profile', path: '/profile', icon: <AccountCircle /> },
    ];

    if (user?.role === USER_ROLES.PATIENT) {
      return [
        ...baseItems,
        { label: 'Find Doctors', path: '/doctors', icon: <LocalHospital /> },
        { label: 'My Appointments', path: '/appointments', icon: <CalendarToday /> },
      ];
    }

    if (user?.role === USER_ROLES.DOCTOR) {
      return [
        { label: 'Doctor Dashboard', path: '/doctor-dashboard', icon: <Dashboard /> },
        { label: 'Profile', path: '/profile', icon: <AccountCircle /> },
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  if (!isAuthenticated) {
    return (
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Secure Appointment System
          </Typography>
          <Button 
            color="inherit" 
            onClick={() => navigate('/login')}
            sx={{ mr: 1 }}
          >
            Login
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/register')}
          >
            Register
          </Button>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Secure Appointment System
        </Typography>

        {/* Navigation items */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 2 }}>
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              onClick={() => handleNavigation(item.path)}
              sx={{
                mx: 0.5,
                backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* User menu */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Avatar>
          </IconButton>
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
                >
                  {item.icon}
                  <Typography sx={{ ml: 1 }}>{item.label}</Typography>
                </MenuItem>
              ))}
              <Divider />
            </Box>

            <MenuItem onClick={() => {
              handleNavigation('/profile');
              handleMenuClose();
            }}>
              <AccountCircle sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
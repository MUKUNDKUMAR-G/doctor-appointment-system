import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { USER_ROLES } from '../utils/constants';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  fallbackPath = '/login',
  loadingComponent = null 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return loadingComponent || (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: 2,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check role-based access if required
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect based on user role
    const redirectPath = getRedirectPathForRole(user?.role);
    return (
      <Navigate 
        to={redirectPath} 
        replace 
      />
    );
  }

  // User is authenticated and has required role
  return children;
};

// Helper function to determine redirect path based on user role
const getRedirectPathForRole = (userRole) => {
  switch (userRole) {
    case USER_ROLES.DOCTOR:
      return '/doctor-dashboard';
    case USER_ROLES.ADMIN:
      return '/admin-dashboard';
    case USER_ROLES.PATIENT:
    default:
      return '/dashboard';
  }
};

// Higher-order component for role-based protection
export const withRoleProtection = (Component, requiredRole) => {
  return (props) => (
    <ProtectedRoute requiredRole={requiredRole}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Specific role-based route components
export const PatientRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole={USER_ROLES.PATIENT} {...props}>
    {children}
  </ProtectedRoute>
);

export const DoctorRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole={USER_ROLES.DOCTOR} {...props}>
    {children}
  </ProtectedRoute>
);

export const AdminRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole={USER_ROLES.ADMIN} {...props}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;
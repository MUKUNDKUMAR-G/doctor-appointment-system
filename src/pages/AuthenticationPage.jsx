import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useResponsive } from '../hooks/useResponsive';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { AnimatedBackground, GlassmorphicCard, AuthFormSwitcher } from '../components/auth';
import SkipNavigation from '../components/common/SkipNavigation/SkipNavigation';

/**
 * @typedef {Object} AuthenticationPageProps
 * @property {'login' | 'register'} [initialMode='login'] - Initial form mode
 */

/**
 * AuthenticationPage component
 * @param {AuthenticationPageProps} props
 */
const AuthenticationPage = ({ initialMode = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { isMobile, isTablet, isTouchDevice } = useResponsive();
  const prefersReducedMotion = useReducedMotion();
  
  const containerRef = useRef(null);
  const [announcement, setAnnouncement] = useState('');
  const [touchFeedback, setTouchFeedback] = useState(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state?.from?.pathname]);

  // Touch feedback for mobile interactions
  const handleTouchStart = (event) => {
    if (!isTouchDevice) return;

    const touch = event.touches[0];
    const target = event.target;
    
    // Only add feedback for interactive elements
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'A' ||
      target.closest('button') ||
      target.closest('a')
    ) {
      const rect = target.getBoundingClientRect();
      setTouchFeedback({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
        element: target,
      });

      // Clear feedback after animation
      setTimeout(() => {
        setTouchFeedback(null);
      }, 600);
    }
  };

  // Get redirect path based on user role
  const getRedirectPathForRole = (userRole) => {
    switch (userRole) {
      case 'DOCTOR':
        return '/doctor-dashboard';
      case 'ADMIN':
        return '/admin-dashboard';
      case 'PATIENT':
      default:
        return '/dashboard';
    }
  };

  // Handle authentication success
  const handleAuthSuccess = () => {
    // If there's a "from" location, use it; otherwise, redirect based on role
    const from = location.state?.from?.pathname;
    
    // Get the user role from localStorage (it's set by AuthContext after login/register)
    const userData = localStorage.getItem('userData');
    let redirectPath = '/dashboard'; // default
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        redirectPath = getRedirectPathForRole(user.role);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    // Use "from" location if it exists, otherwise use role-based redirect
    const finalPath = from || redirectPath;
    
    setAnnouncement('Authentication successful. Redirecting to dashboard.');
    navigate(finalPath, { replace: true });
  };

  // Announce form mode changes to screen readers
  const handleModeChange = (mode) => {
    setAnnouncement(
      mode === 'login' 
        ? 'Switched to login form' 
        : 'Switched to registration form'
    );
  };

  // Calculate animation intensity based on device capabilities
  const animationIntensity = isMobile ? 'low' : isTablet ? 'medium' : 'high';
  
  // Reduce particle count on mobile for performance
  const particleCount = prefersReducedMotion 
    ? 0 
    : isMobile 
      ? 20 
      : isTablet 
        ? 40 
        : undefined; // Let AnimatedBackground decide

  return (
    <>
      {/* Skip Navigation Link */}
      <SkipNavigation targetId="auth-form-container" text="Skip to authentication form" />
      
      <Box
        ref={containerRef}
        onTouchStart={handleTouchStart}
        sx={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          overflowX: 'hidden',
          overflowY: 'auto',
          paddingTop: isMobile ? 2 : 4,
          paddingBottom: isMobile ? 2 : 4,
          paddingLeft: isMobile ? 2 : 3,
          paddingRight: isMobile ? 2 : 3,
        }}
        role="main"
        aria-label="Authentication page"
      >
        {/* Animated Background */}
        <AnimatedBackground
          variant="combined"
          intensity={animationIntensity}
          colors={['#667eea', '#764ba2', '#f093fb', '#4facfe']}
          enableParallax={!isMobile && !prefersReducedMotion}
          particleCount={particleCount}
          reduceMotion={prefersReducedMotion}
        />
        
        {/* Authentication Form Container */}
        <Container 
          maxWidth="sm" 
          sx={{ 
            position: 'relative', 
            zIndex: 1,
            width: '100%',
            padding: isMobile ? 1 : 2,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
          id="auth-form-container"
        >
          <GlassmorphicCard 
            blur={isMobile ? 15 : 20}
            opacity={isMobile ? 0.85 : 0.75}
            elevation={isMobile ? 2 : 3}
            maxWidth={isMobile ? 400 : 500}
            padding={isMobile ? 2.5 : 3.5}
            sx={{
              paddingBottom: `${isMobile ? 2.5 : 3.5} !important`,
              marginBottom: 0,
            }}
          >
            <AuthFormSwitcher
              initialMode={initialMode}
              onLoginSuccess={handleAuthSuccess}
              onRegisterSuccess={handleAuthSuccess}
              onModeChange={handleModeChange}
            />
          </GlassmorphicCard>
        </Container>
      </Box>
    </>
  );
};

export default AuthenticationPage;
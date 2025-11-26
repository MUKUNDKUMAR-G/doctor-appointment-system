import { useState } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box,
  Alert,
  Skeleton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import {
  Calendar,
  Users,
  Activity,
  TrendingUp,
  Plus,
  Search,
  FileText,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAppointments } from '../hooks/useAppointments';
import LazyAppointmentBooking from '../components/LazyAppointmentBooking';
import ModernCard from '../components/common/ModernCard';
import StatCard from '../components/common/StatCard';
import TimelineAppointment from '../components/common/TimelineAppointment';
import AnimatedButton from '../components/common/AnimatedButton';
import { PageContainer, CollapsibleSection } from '../components/layout/index';
import { useResponsive } from '../hooks/useResponsive';
import { colors } from '../theme/colors';
import { animations } from '../theme/animations';

// Styled Components
const WelcomeHeader = styled(Box)(({ theme }) => ({
  background: colors.gradients.primary,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  color: '#ffffff',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    right: '-10%',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-30%',
    left: '-5%',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.08)',
  },
}));

const QuickActionCard = styled(ModernCard)(({ theme }) => ({
  height: '100%',
  cursor: 'pointer',
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: theme.spacing(2),
  transition: `all ${animations.duration.standard}ms ${animations.easing.easeInOut}`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
}));

const IconWrapper = styled(Box)(({ gradient }) => ({
  width: 64,
  height: 64,
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: gradient,
  color: '#ffffff',
  '& svg': {
    width: 32,
    height: 32,
  },
}));

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(6, 2),
}));

const EmptyStateIcon = styled(Box)(({ theme }) => ({
  width: 120,
  height: 120,
  margin: '0 auto',
  marginBottom: theme.spacing(3),
  borderRadius: '50%',
  background: colors.primary[50],
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& svg': {
    width: 60,
    height: 60,
    color: colors.primary.main,
  },
}));

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { appointments, loading, error, getUpcomingAppointments } = useAppointments();
  const [bookingOpen, setBookingOpen] = useState(false);
  const { isMobile, isTablet } = useResponsive();

  const upcomingAppointments = getUpcomingAppointments().slice(0, 3);
  const completedAppointments = appointments.filter(apt => apt.status === 'COMPLETED');
  const uniqueDoctors = new Set(appointments.map(apt => apt.doctorId)).size;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleAppointmentAction = (action, appointment) => {
    console.log('Action:', action, 'Appointment:', appointment);
    // Handle different actions
    switch (action) {
      case 'reschedule':
      case 'cancel':
        navigate('/appointments');
        break;
      case 'viewDetails':
        navigate('/appointments');
        break;
      default:
        break;
    }
  };

  return (
    <PageContainer maxWidth="lg" component="main" id="main-content">
      {/* Welcome Header with Personalized Greeting */}
      <WelcomeHeader
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box position="relative" zIndex={1}>
          <Typography 
            variant={isMobile ? 'h4' : 'h3'} 
            component="h1" 
            sx={{ fontWeight: 700, mb: 1 }}
          >
            {getGreeting()}, {user?.firstName || 'Patient'}!
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
            Here's your health dashboard overview
          </Typography>
          
          {/* Quick Stats in Header */}
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box>
                <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 700 }}>
                  {upcomingAppointments.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Upcoming
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box>
                <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 700 }}>
                  {completedAppointments.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Completed
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box>
                <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 700 }}>
                  {uniqueDoctors}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Doctors
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box>
                <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 700 }}>
                  {appointments.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Total
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </WelcomeHeader>

      {/* Two-Column Layout: Appointments Timeline + Quick Actions */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Left Column: Upcoming Appointments Timeline */}
        <Grid item xs={12} lg={8}>
          <CollapsibleSection
            title="Upcoming Appointments"
            defaultExpanded={true}
            elevation={1}
            sx={{ mb: 3 }}
          >
            <Box display="flex" alignItems="center" justifyContent="flex-end" mb={2}>
              <AnimatedButton
                variant="text"
                size="small"
                onClick={() => navigate('/appointments')}
              >
                View All
              </AnimatedButton>
            </Box>

            {loading ? (
              <Box>
                {[1, 2, 3].map((i) => (
                  <Box key={i} mb={2}>
                    <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                  </Box>
                ))}
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : upcomingAppointments.length === 0 ? (
              <EmptyStateContainer>
                <EmptyStateIcon>
                  <Calendar />
                </EmptyStateIcon>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  No upcoming appointments
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                  Start your healthcare journey by booking an appointment with one of our qualified doctors
                </Typography>
                <AnimatedButton
                  variant="contained"
                  size="large"
                  icon={<Plus size={20} />}
                  onClick={() => setBookingOpen(true)}
                >
                  Book Your First Appointment
                </AnimatedButton>
              </EmptyStateContainer>
            ) : (
              <Box>
                {upcomingAppointments.map((appointment) => (
                  <TimelineAppointment
                    key={appointment.id}
                    appointment={{
                      ...appointment,
                      doctorName: appointment.doctorName 
                        ? `Dr. ${appointment.doctorName}`
                        : 'Unknown Doctor',
                    }}
                    onAction={handleAppointmentAction}
                    expandable={true}
                  />
                ))}
              </Box>
            )}
          </CollapsibleSection>
        </Grid>

        {/* Right Column: Quick Actions Grid */}
        <Grid item xs={12} lg={4}>
          <CollapsibleSection
            title="Quick Actions"
            defaultExpanded={true}
            elevation={1}
          >
            <Grid container spacing={2}>
            <Grid item xs={6} lg={12}>
              <QuickActionCard
                variant="elevated"
                hover={true}
                onClick={() => setBookingOpen(true)}
                component={motion.div}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <IconWrapper gradient={colors.gradients.primary}>
                  <Plus />
                </IconWrapper>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Book Appointment
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Schedule with a doctor
                  </Typography>
                </Box>
              </QuickActionCard>
            </Grid>

            <Grid item xs={6} lg={12}>
              <QuickActionCard
                variant="elevated"
                hover={true}
                onClick={() => navigate('/doctors')}
                component={motion.div}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <IconWrapper gradient={colors.gradients.secondary}>
                  <Search />
                </IconWrapper>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Find Doctors
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Browse specialists
                  </Typography>
                </Box>
              </QuickActionCard>
            </Grid>

            <Grid item xs={6} lg={12}>
              <QuickActionCard
                variant="elevated"
                hover={true}
                onClick={() => navigate('/appointments')}
                component={motion.div}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <IconWrapper gradient={colors.gradients.info}>
                  <FileText />
                </IconWrapper>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    My Appointments
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    View history
                  </Typography>
                </Box>
              </QuickActionCard>
            </Grid>

            <Grid item xs={6} lg={12}>
              <QuickActionCard
                variant="elevated"
                hover={true}
                onClick={() => navigate('/profile')}
                component={motion.div}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <IconWrapper gradient={colors.gradients.success}>
                  <User />
                </IconWrapper>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    My Profile
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Update info
                  </Typography>
                </Box>
              </QuickActionCard>
            </Grid>
          </Grid>
          </CollapsibleSection>
        </Grid>
      </Grid>

      {/* Health Summary Section at Bottom */}
      <Box mt={4}>
        <CollapsibleSection
          title="Health Summary"
          defaultExpanded={true}
          elevation={1}
        >
          <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              value={appointments.length}
              label="Total Appointments"
              icon={<Calendar />}
              color="primary"
              animated={true}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              value={completedAppointments.length}
              label="Completed Visits"
              icon={<Activity />}
              color="success"
              animated={true}
              trend={completedAppointments.length > 0 ? 12 : undefined}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              value={upcomingAppointments.length}
              label="Upcoming Appointments"
              icon={<TrendingUp />}
              color="warning"
              animated={true}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              value={uniqueDoctors}
              label="Doctors Consulted"
              icon={<Users />}
              color="secondary"
              animated={true}
            />
          </Grid>
        </Grid>
        </CollapsibleSection>
      </Box>

      {/* Appointment Booking Dialog */}
      <LazyAppointmentBooking
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        onBookingComplete={() => {
          setBookingOpen(false);
        }}
      />
    </PageContainer>
  );
};

export default DashboardPage;
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  Button,
  IconButton,
  LinearProgress,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  CalendarToday,
  Person,
  AccessTime,
  CheckCircle,
  Cancel,
  Schedule,
  Dashboard,
  Star,
  VerifiedUser,
  TrendingUp,
  Edit,
  Settings,
  Add,
  Notifications,
  EventAvailable,
  Assessment,
  RateReview,
  CardMembership,
  ArrowForward,
  CheckCircleOutline,
  WarningAmber,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useDoctorProfile } from '../hooks/useDoctorProfile';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { staggerContainer, staggerItem, getAccessibleVariants } from '../theme/animations';
import ModernCard from '../components/common/ModernCard';
import StatCard from '../components/common/StatCard';
import {
  DoctorProfileHeader,
  DoctorCredentialsSection,
  DoctorReviewsSection,
  DoctorStatisticsCard,
  DoctorAvailabilityCalendar,
  DoctorProfileEditForm,
  DoctorCredentialManager,
  DoctorAvailabilityManager,
  DoctorReviewResponseForm,
} from '../components/features/DoctorProfile';

const DoctorDashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctorId, setDoctorId] = useState(null);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    upcomingAppointments: 0,
    completedToday: 0,
    totalPatients: 0,
  });
  const prefersReducedMotion = useReducedMotion();

  // Use the doctor profile hook
  const {
    profile,
    credentials,
    reviews,
    statistics,
    availability,
    profileCompleteness,
    uploadAvatar,
    loading: profileLoading,
  } = useDoctorProfile(doctorId);

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get the doctor ID from the doctors endpoint
      const doctorsResponse = await api.get('/doctors');
      const doctors = doctorsResponse.data || [];
      
      // Find the doctor record for the current user by email
      const doctorRecord = doctors.find(d => d.email === user.email);
      
      if (!doctorRecord) {
        console.error('Doctor not found. User:', user, 'Doctors:', doctors);
        throw new Error('Doctor profile not found. Please contact administrator.');
      }

      setDoctorId(doctorRecord.id);

      // Fetch doctor's appointments
      const response = await api.get(`/appointments/doctor/${doctorRecord.id}`);
      const allAppointments = response.data || [];

      // Filter and sort appointments
      const now = new Date();
      const upcomingAppointments = allAppointments
        .filter(apt => new Date(apt.appointmentDateTime) >= now && apt.status === 'SCHEDULED')
        .sort((a, b) => new Date(a.appointmentDateTime) - new Date(b.appointmentDateTime));

      setAppointments(upcomingAppointments.slice(0, 5)); // Show next 5 appointments

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = allAppointments.filter(apt => 
        apt.appointmentDateTime?.startsWith(today)
      );
      const completedToday = todayAppointments.filter(apt => apt.status === 'COMPLETED');
      const uniquePatients = new Set(allAppointments.map(apt => apt.patientId));

      setStats({
        todayAppointments: todayAppointments.length,
        upcomingAppointments: upcomingAppointments.length,
        completedToday: completedToday.length,
        totalPatients: uniquePatients.size,
      });
    } catch (err) {
      console.error('Error fetching doctor data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    try {
      await uploadAvatar(file);
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      alert('Failed to upload avatar. Please try again.');
    }
  };

  // Calculate profile completeness details
  const getProfileCompletenessDetails = () => {
    if (!profile) return { percentage: 0, missingFields: [] };
    
    const missingFields = [];
    
    if (!profile.bio || profile.bio.trim() === '') {
      missingFields.push({ field: 'bio', label: 'Professional Bio', priority: 'high' });
    }
    if (!profile.education || profile.education.length === 0) {
      missingFields.push({ field: 'education', label: 'Education Details', priority: 'high' });
    }
    if (!profile.avatarUrl) {
      missingFields.push({ field: 'avatar', label: 'Profile Photo', priority: 'medium' });
    }
    if (!credentials || credentials.length === 0) {
      missingFields.push({ field: 'credentials', label: 'Professional Credentials', priority: 'high' });
    }
    if (!availability || availability.length === 0) {
      missingFields.push({ field: 'availability', label: 'Availability Schedule', priority: 'high' });
    }
    
    const totalFields = 5;
    const completedFields = totalFields - missingFields.length;
    const percentage = Math.round((completedFields / totalFields) * 100);
    
    return { percentage, missingFields };
  };

  const completenessDetails = getProfileCompletenessDetails();

  const getAppointmentTimeLabel = (appointmentDateTime) => {
    const date = parseISO(appointmentDateTime);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM dd');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'primary';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  if (loading || profileLoading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        mt: 4, 
        mb: 4,
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Welcome Header with Glassmorphism */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          mb: 4,
          p: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Welcome back, Dr. {profile?.lastName || user?.name || 'Doctor'}! 👋
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Here's what's happening with your practice today
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Notifications">
              <IconButton
                sx={{
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                  '&:hover': { bgcolor: 'background.paper', boxShadow: 4 },
                }}
              >
                <Badge badgeContent={4} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      <Grid 
        container 
        spacing={3}
        component={motion.div}
        variants={getAccessibleVariants(staggerContainer, prefersReducedMotion)}
        initial="initial"
        animate="animate"
      >
        {/* Left Column - Main Content */}
        <Grid item xs={12} lg={8}>
          {/* Quick Stats Row */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={6} md={3}>
              <StatCard
                value={stats.todayAppointments}
                label="Today's Appointments"
                icon={<CalendarToday />}
                color="primary"
                animated
              />
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <StatCard
                value={stats.upcomingAppointments}
                label="Upcoming"
                icon={<Schedule />}
                color="warning"
                animated
              />
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <StatCard
                value={stats.completedToday}
                label="Completed Today"
                icon={<CheckCircle />}
                color="success"
                animated
              />
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <StatCard
                value={stats.totalPatients}
                label="Total Patients"
                icon={<Person />}
                color="info"
                animated
              />
            </Grid>
          </Grid>

          {/* Statistics Overview */}
          {statistics && (
            <Box
              component={motion.div}
              variants={getAccessibleVariants(staggerItem, prefersReducedMotion)}
              sx={{ mb: 3 }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  Performance Analytics
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForward />}
                  href="/doctor/profile"
                  sx={{ textTransform: 'none' }}
                >
                  View Details
                </Button>
              </Box>
              <DoctorStatisticsCard statistics={statistics} />
            </Box>
          )}

          {/* Upcoming Appointments */}
          <ModernCard
            component={motion.div}
            variants={getAccessibleVariants(staggerItem, prefersReducedMotion)}
            sx={{ mb: 3 }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight={600}>
                  Upcoming Appointments
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForward />}
                  href="/appointments"
                  sx={{ textTransform: 'none' }}
                >
                  View All
                </Button>
              </Box>

              {appointments.length === 0 ? (
                <Box textAlign="center" py={6}>
                  <CalendarToday sx={{ fontSize: 64, color: 'text.disabled', mb: 2, opacity: 0.3 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No upcoming appointments
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your schedule is clear for now
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {appointments.map((appointment, index) => (
                    <React.Fragment key={appointment.id}>
                      <ListItem 
                        sx={{ 
                          px: 0,
                          py: 2,
                          '&:hover': {
                            bgcolor: 'action.hover',
                            borderRadius: 2,
                            px: 2,
                          },
                          transition: 'all 0.2s',
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar 
                            sx={{ 
                              bgcolor: 'primary.main',
                              width: 48,
                              height: 48,
                            }}
                          >
                            <Person />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {appointment.patientName || 'Unknown Patient'}
                              </Typography>
                              <Chip 
                                label={appointment.status} 
                                size="small" 
                                color={getStatusColor(appointment.status)}
                                sx={{ height: 24 }}
                              />
                            </Box>
                          }
                          secondary={
                            <Box component="span">
                              <Box component="span" display="flex" alignItems="center" gap={1} mb={0.5}>
                                <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary" component="span">
                                  {getAppointmentTimeLabel(appointment.appointmentDateTime)} at{' '}
                                  {format(parseISO(appointment.appointmentDateTime), 'h:mm a')}
                                </Typography>
                              </Box>
                              {appointment.reason && (
                                <Typography variant="body2" color="text.secondary" component="span" display="block">
                                  Reason: {appointment.reason}
                                </Typography>
                              )}
                            </Box>
                          }
                          secondaryTypographyProps={{ component: 'div' }}
                        />
                      </ListItem>
                      {index < appointments.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </ModernCard>
        </Grid>

        {/* Right Column - Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Profile Completeness Widget */}
          <ModernCard
            component={motion.div}
            variants={getAccessibleVariants(staggerItem, prefersReducedMotion)}
            sx={{ mb: 3 }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: completenessDetails.percentage === 100 ? 'success.50' : 'warning.50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {completenessDetails.percentage === 100 ? (
                    <CheckCircleOutline sx={{ color: 'success.main', fontSize: 28 }} />
                  ) : (
                    <WarningAmber sx={{ color: 'warning.main', fontSize: 28 }} />
                  )}
                </Box>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight={600}>
                    Profile Completeness
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    {completenessDetails.percentage}%
                  </Typography>
                </Box>
              </Box>

              <LinearProgress
                variant="determinate"
                value={completenessDetails.percentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  mb: 2,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)',
                  },
                }}
              />

              {completenessDetails.missingFields.length > 0 && (
                <>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Complete these sections to improve your profile:
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    {completenessDetails.missingFields.map((field) => (
                      <Box
                        key={field.field}
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          bgcolor: 'grey.50',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography variant="body2" fontWeight={500}>
                          {field.label}
                        </Typography>
                        <Chip
                          label={field.priority}
                          size="small"
                          color={field.priority === 'high' ? 'error' : 'warning'}
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </Box>
                    ))}
                  </Box>
                </>
              )}

              {completenessDetails.percentage === 100 && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'success.50',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="body2" color="success.dark" fontWeight={600}>
                    🎉 Your profile is complete!
                  </Typography>
                </Box>
              )}
            </CardContent>
          </ModernCard>

          {/* Quick Actions Panel */}
          <ModernCard
            component={motion.div}
            variants={getAccessibleVariants(staggerItem, prefersReducedMotion)}
            sx={{ mb: 3 }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={1.5}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => window.location.href = '/doctor/profile?tab=0'}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: 1.5,
                    borderRadius: 2,
                  }}
                >
                  Edit Profile
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<EventAvailable />}
                  onClick={() => window.location.href = '/doctor/profile?tab=2'}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: 1.5,
                    borderRadius: 2,
                  }}
                >
                  Manage Availability
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CardMembership />}
                  onClick={() => window.location.href = '/doctor/profile?tab=1'}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: 1.5,
                    borderRadius: 2,
                  }}
                >
                  Manage Credentials
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RateReview />}
                  onClick={() => window.location.href = '/doctor/profile?tab=3'}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: 1.5,
                    borderRadius: 2,
                  }}
                >
                  View Reviews
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Assessment />}
                  onClick={() => window.location.href = '/doctor/profile?tab=4'}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    py: 1.5,
                    borderRadius: 2,
                  }}
                >
                  View Analytics
                </Button>
              </Box>
            </CardContent>
          </ModernCard>

          {/* Recent Reviews */}
          {reviews && reviews.length > 0 && (
            <ModernCard
              component={motion.div}
              variants={getAccessibleVariants(staggerItem, prefersReducedMotion)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight={600}>
                    Recent Reviews
                  </Typography>
                  <Button
                    size="small"
                    endIcon={<ArrowForward />}
                    href="/doctor/reviews"
                    sx={{ textTransform: 'none' }}
                  >
                    View All
                  </Button>
                </Box>
                <Box display="flex" flexDirection="column" gap={2}>
                  {reviews.slice(0, 3).map((review) => (
                    <Box
                      key={review.id}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'grey.50',
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Box display="flex" alignItems="center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              sx={{
                                fontSize: 16,
                                color: i < review.rating ? 'warning.main' : 'grey.300',
                              }}
                            />
                          ))}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {review.patientName}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {review.comment || 'No comment provided'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </ModernCard>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default DoctorDashboardPage;

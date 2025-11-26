import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Button,
  Grid,
  Divider,
  Rating,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ArrowBack,
  School,
  Work,
  Star,
  Schedule,
  Phone,
  Email,
  LocationOn,
  CalendarToday,
} from '@mui/icons-material';
import { doctorService } from '../services/doctorService';
import AvailabilityCalendar from './AvailabilityCalendar';
import AppointmentBooking from './AppointmentBooking';

const DoctorProfile = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const doctorData = await doctorService.getDoctorProfile(doctorId);
        setDoctor(doctorData);
      } catch (err) {
        setError(err.message || 'Failed to fetch doctor profile');
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctorProfile();
    }
  }, [doctorId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleBookAppointment = () => {
    setBookingOpen(true);
  };

  const handleBookingComplete = (appointment) => {
    setBookingOpen(false);
    // Navigate to appointments page or show success message
    navigate('/appointments');
  };

  // Generate initials for avatar if no image
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={handleBack} startIcon={<ArrowBack />}>
          Go Back
        </Button>
      </Box>
    );
  }

  if (!doctor) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Doctor not found
        </Alert>
        <Button onClick={handleBack} startIcon={<ArrowBack />}>
          Go Back
        </Button>
      </Box>
    );
  }

  // Mock data for demonstration
  const mockRating = 4.2 + (doctor.id % 10) * 0.1;
  const mockReviewCount = 15 + (doctor.id % 20);
  const mockConsultationFee = 150 + (doctor.id % 5) * 25;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Back Button */}
      <Box display="flex" alignItems="center" mb={3}>
        <Button 
          onClick={handleBack} 
          startIcon={<ArrowBack />}
          sx={{ mr: 2 }}
        >
          Back to Search
        </Button>
        <Typography variant="h4" component="h1">
          Doctor Profile
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Doctor Information */}
        <Grid item xs={12} md={8}>
          {/* Main Profile Card */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="flex-start" mb={3}>
              <Avatar
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mr: 3,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                }}
              >
                {doctor.profileImage ? (
                  <img 
                    src={doctor.profileImage} 
                    alt={`Dr. ${doctor.user.firstName} ${doctor.user.lastName}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  getInitials(doctor.user.firstName, doctor.user.lastName)
                )}
              </Avatar>
              
              <Box flexGrow={1}>
                <Typography variant="h4" component="h2" gutterBottom>
                  Dr. {doctor.user.firstName} {doctor.user.lastName}
                </Typography>
                
                <Chip 
                  label={doctor.specialty} 
                  color="primary" 
                  sx={{ mb: 2 }}
                />
                
                <Box display="flex" alignItems="center" mb={2}>
                  <Rating 
                    value={mockRating} 
                    precision={0.1} 
                    readOnly 
                  />
                  <Typography variant="body1" color="text.secondary" ml={1}>
                    {mockRating.toFixed(1)} ({mockReviewCount} reviews)
                  </Typography>
                </Box>

                <Typography variant="h6" color="primary" gutterBottom>
                  Consultation Fee: ${mockConsultationFee}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Professional Details */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <School color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Qualifications
                    </Typography>
                    <Typography variant="body1">
                      {doctor.qualifications}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Work color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Experience
                    </Typography>
                    <Typography variant="body1">
                      {doctor.experienceYears} years
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Contact Information */}
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Email color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={doctor.user.email}
                  secondary="Email"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Phone color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={doctor.user.phoneNumber}
                  secondary="Phone"
                />
              </ListItem>
            </List>
          </Paper>

          {/* About Section */}
          {doctor.bio && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                About Dr. {doctor.user.lastName}
              </Typography>
              <Typography variant="body1" paragraph>
                {doctor.bio}
              </Typography>
            </Paper>
          )}

          {/* Specializations and Services */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Specializations & Services
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              <Chip label={doctor.specialty} color="primary" />
              {/* Mock additional specializations */}
              <Chip label="General Consultation" variant="outlined" />
              <Chip label="Preventive Care" variant="outlined" />
              <Chip label="Health Screening" variant="outlined" />
            </Box>
          </Paper>
        </Grid>

        {/* Right Column - Booking and Availability */}
        <Grid item xs={12} md={4}>
          {/* Quick Booking Card */}
          <Card sx={{ mb: 3, position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Book Appointment
              </Typography>
              
              <Box display="flex" alignItems="center" mb={2}>
                <Schedule color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Available slots today
                </Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleBookAppointment}
                startIcon={<CalendarToday />}
                sx={{ mb: 2 }}
              >
                Book Now
              </Button>

              <Typography variant="body2" color="text.secondary" textAlign="center">
                Next available: Today 2:00 PM
              </Typography>
            </CardContent>
          </Card>

          {/* Availability Calendar */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Availability
            </Typography>
            <AvailabilityCalendar doctorId={doctorId} />
          </Paper>
        </Grid>
      </Grid>

      {/* Appointment Booking Dialog */}
      <AppointmentBooking
        doctorId={doctorId}
        doctorInfo={doctor}
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        onBookingComplete={handleBookingComplete}
      />
    </Box>
  );
};

export default DoctorProfile;
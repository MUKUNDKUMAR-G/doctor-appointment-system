import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Grid,
  Avatar,
  Chip,
  Rating,
  Button,
  Divider,
  Paper,
  Stack,
  Card,
  CardContent,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Badge,
  CircularProgress,
} from '@mui/material';
import {
  CalendarToday,
  LocationOn,
  WorkOutline,
  School,
  Language,
  Star,
  Verified,
  ArrowBack,
  CheckCircle,
  EmojiEvents,
  People,
  TrendingUp,
  Schedule,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { doctorService } from '../services/doctorService';
import useApiCall from '../hooks/useApiCall';
import ModernCard from '../components/common/ModernCard';
import DoctorCardSkeleton from '../components/features/DoctorCard/DoctorCardSkeleton';

const DoctorDetailPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  const {
    execute: fetchDoctorProfile,
    isLoading: loadingProfile,
    error: profileError,
  } = useApiCall({
    onSuccess: (data) => {
      setDoctor(data);
    },
    showErrorMessage: true,
  });

  const {
    execute: fetchReviews,
    isLoading: loadingReviews,
  } = useApiCall({
    onSuccess: (data) => {
      // Ensure reviews is always an array
      setReviews(Array.isArray(data) ? data : []);
    },
  });

  useEffect(() => {
    if (doctorId) {
      fetchDoctorProfile(() => doctorService.getDoctorProfile(doctorId));
      // Fetch reviews with error handling
      fetchReviews(() => doctorService.getDoctorReviews(doctorId)).catch(() => {
        // If reviews fail to load, just set empty array
        setReviews([]);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  const handleBookAppointment = () => {
    navigate('/appointments', { state: { selectedDoctorId: doctorId } });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loadingProfile) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <DoctorCardSkeleton />
      </Container>
    );
  }

  if (profileError || !doctor) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          {profileError || 'Doctor not found'}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/doctors')}
          sx={{ mt: 2 }}
        >
          Back to Doctors
        </Button>
      </Container>
    );
  }

  const fullName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
  const education = doctor.education ? JSON.parse(doctor.education) : [];
  const languages = doctor.languagesSpoken ? JSON.parse(doctor.languagesSpoken) : [];
  const awards = doctor.awards ? JSON.parse(doctor.awards) : [];

  return (
    <Container component="main" id="main-content" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/doctors')}
        sx={{ mb: 3 }}
      >
        Back to Doctors
      </Button>

      {/* Doctor Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <ModernCard variant="elevated" sx={{ mb: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3}>
              {/* Avatar and Basic Info */}
              <Grid item xs={12} md={4}>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      doctor.isVerified ? (
                        <Tooltip title="Verified Professional" arrow>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              bgcolor: 'success.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '4px solid',
                              borderColor: 'background.paper',
                              boxShadow: 3,
                            }}
                          >
                            <Verified sx={{ fontSize: 24, color: 'white' }} />
                          </Box>
                        </Tooltip>
                      ) : null
                    }
                  >
                    <Avatar
                      src={doctor.avatarUrl}
                      alt={fullName}
                      sx={{
                        width: 160,
                        height: 160,
                        bgcolor: 'primary.main',
                        fontSize: '4rem',
                        fontWeight: 600,
                        border: '4px solid',
                        borderColor: 'background.paper',
                        boxShadow: 4,
                      }}
                    >
                      {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                    </Avatar>
                  </Badge>

                  {/* Rating */}
                  {doctor.rating && (
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={1}
                      mt={2}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'warning.50',
                        border: '2px solid',
                        borderColor: 'warning.200',
                      }}
                    >
                      <Star sx={{ fontSize: 24, color: 'warning.main' }} />
                      <Typography variant="h6" color="warning.dark" fontWeight={700}>
                        {doctor.rating.toFixed(1)}
                      </Typography>
                      {doctor.reviewCount && (
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          ({doctor.reviewCount} reviews)
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Doctor Information */}
              <Grid item xs={12} md={8}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography variant="h4" fontWeight={700}>
                    {fullName}
                  </Typography>
                  {doctor.isVerified && (
                    <Tooltip title="Verified Professional" arrow>
                      <Verified sx={{ fontSize: 28, color: 'success.main' }} />
                    </Tooltip>
                  )}
                </Box>

                <Chip
                  label={doctor.specialty}
                  color="primary"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    height: 32,
                    mb: 2,
                  }}
                />

                {/* Bio */}
                {doctor.bio && (
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {doctor.bio}
                  </Typography>
                )}

                {/* Quick Stats */}
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {doctor.experienceYears && (
                    <Grid item xs={6} sm={3}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          bgcolor: 'primary.50',
                          border: '1px solid',
                          borderColor: 'primary.100',
                        }}
                      >
                        <Typography variant="h5" fontWeight={700} color="primary.main">
                          {doctor.experienceYears}+
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Years Experience
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                  {doctor.statistics?.totalPatients && (
                    <Grid item xs={6} sm={3}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          bgcolor: 'success.50',
                          border: '1px solid',
                          borderColor: 'success.100',
                        }}
                      >
                        <Typography variant="h5" fontWeight={700} color="success.main">
                          {doctor.statistics.totalPatients > 1000
                            ? `${(doctor.statistics.totalPatients / 1000).toFixed(1)}k`
                            : doctor.statistics.totalPatients}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Patients Treated
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                  {doctor.statistics?.completedAppointments && (
                    <Grid item xs={6} sm={3}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          bgcolor: 'info.50',
                          border: '1px solid',
                          borderColor: 'info.100',
                        }}
                      >
                        <Typography variant="h5" fontWeight={700} color="info.main">
                          {doctor.statistics.completedAppointments > 1000
                            ? `${(doctor.statistics.completedAppointments / 1000).toFixed(1)}k`
                            : doctor.statistics.completedAppointments}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Appointments
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                  <Grid item xs={6} sm={3}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: 'warning.50',
                        border: '1px solid',
                        borderColor: 'warning.100',
                      }}
                    >
                      <Typography variant="h5" fontWeight={700} color="warning.dark">
                        ₹{doctor.consultationFee?.toLocaleString('en-IN') || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Consultation Fee
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Book Appointment CTA */}
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<CalendarToday />}
                  onClick={handleBookAppointment}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    boxShadow: 3,
                    background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
                    '&:hover': {
                      boxShadow: 6,
                      background: 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  Book Appointment Now
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </ModernCard>
      </motion.div>

      {/* Tabs Section */}
      <ModernCard variant="elevated">
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
              },
            }}
          >
            <Tab label="About" />
            <Tab label="Education & Credentials" />
            <Tab label={`Reviews (${reviews.length})`} />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {/* About Tab */}
          {activeTab === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Stack spacing={3}>
                {/* Professional Details */}
                <Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Professional Details
                  </Typography>
                  <Grid container spacing={2}>
                    {doctor.qualifications && (
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" gap={1.5}>
                          <School sx={{ color: 'primary.main', mt: 0.5 }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Qualifications
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {doctor.qualifications}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}
                    {doctor.experienceYears && (
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" gap={1.5}>
                          <WorkOutline sx={{ color: 'primary.main', mt: 0.5 }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Experience
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {doctor.experienceYears} years
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}
                    {doctor.location && (
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" gap={1.5}>
                          <LocationOn sx={{ color: 'primary.main', mt: 0.5 }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Location
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {doctor.location}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}
                    {languages.length > 0 && (
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" gap={1.5}>
                          <Language sx={{ color: 'primary.main', mt: 0.5 }} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Languages
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {languages.join(', ')}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Box>

                {/* Consultation Details */}
                <Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Consultation Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          bgcolor: 'grey.50',
                          border: '1px solid',
                          borderColor: 'grey.200',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Consultation Fee
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color="primary.main">
                          ₹{doctor.consultationFee?.toLocaleString('en-IN') || 'Not specified'}
                        </Typography>
                      </Paper>
                    </Grid>
                    {doctor.consultationDuration && (
                      <Grid item xs={12} sm={6}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            bgcolor: 'grey.50',
                            border: '1px solid',
                            borderColor: 'grey.200',
                          }}
                        >
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Consultation Duration
                          </Typography>
                          <Typography variant="h6" fontWeight={700}>
                            {doctor.consultationDuration} minutes
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </Box>

                {/* Awards */}
                {awards.length > 0 && (
                  <Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Awards & Recognition
                    </Typography>
                    <List>
                      {awards.map((award, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <EmojiEvents sx={{ color: 'warning.main', mr: 2 }} />
                          <ListItemText
                            primary={award.title || award}
                            secondary={award.year ? `Year: ${award.year}` : null}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Stack>
            </motion.div>
          )}

          {/* Education & Credentials Tab */}
          {activeTab === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Stack spacing={3}>
                {/* Education */}
                {education.length > 0 && (
                  <Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Education
                    </Typography>
                    <List>
                      {education.map((edu, index) => (
                        <ListItem
                          key={index}
                          sx={{
                            px: 0,
                            py: 2,
                            borderBottom: index < education.length - 1 ? '1px solid' : 'none',
                            borderColor: 'divider',
                          }}
                        >
                          <School sx={{ color: 'primary.main', mr: 2, fontSize: 32 }} />
                          <ListItemText
                            primary={
                              <Typography variant="body1" fontWeight={600}>
                                {edu.degree}
                              </Typography>
                            }
                            secondary={
                              <>
                                <Typography variant="body2" color="text.secondary">
                                  {edu.institution}
                                </Typography>
                                {edu.year && (
                                  <Typography variant="caption" color="text.secondary">
                                    Year: {edu.year}
                                  </Typography>
                                )}
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Credentials */}
                {doctor.credentials && doctor.credentials.length > 0 && (
                  <Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Professional Credentials
                    </Typography>
                    <Grid container spacing={2}>
                      {doctor.credentials
                        .filter((cred) => cred.verificationStatus === 'VERIFIED')
                        .map((credential) => (
                          <Grid item xs={12} sm={6} key={credential.id}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                bgcolor: 'success.50',
                                border: '2px solid',
                                borderColor: 'success.200',
                              }}
                            >
                              <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <CheckCircle sx={{ color: 'success.main' }} />
                                <Typography variant="body1" fontWeight={600}>
                                  {credential.credentialType}
                                </Typography>
                              </Box>
                              {credential.issuingAuthority && (
                                <Typography variant="body2" color="text.secondary">
                                  Issued by: {credential.issuingAuthority}
                                </Typography>
                              )}
                              {credential.issueDate && (
                                <Typography variant="caption" color="text.secondary">
                                  Date: {new Date(credential.issueDate).toLocaleDateString()}
                                </Typography>
                              )}
                            </Paper>
                          </Grid>
                        ))}
                    </Grid>
                  </Box>
                )}
              </Stack>
            </motion.div>
          )}

          {/* Reviews Tab */}
          {activeTab === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {loadingReviews ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : reviews.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" color="text.secondary">
                    No reviews yet
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={3}>
                  {Array.isArray(reviews) && reviews.map((review) => (
                    <Paper
                      key={review.id}
                      elevation={0}
                      sx={{
                        p: 3,
                        bgcolor: 'grey.50',
                        border: '1px solid',
                        borderColor: 'grey.200',
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {review.patientName || 'Anonymous'}
                          </Typography>
                          <Rating value={review.rating} readOnly size="small" sx={{ mt: 0.5 }} />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      {review.comment && (
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {review.comment}
                        </Typography>
                      )}
                      {review.doctorResponse && (
                        <Box
                          sx={{
                            mt: 2,
                            p: 2,
                            bgcolor: 'primary.50',
                            borderLeft: '4px solid',
                            borderColor: 'primary.main',
                          }}
                        >
                          <Typography variant="caption" fontWeight={600} color="primary.main">
                            Doctor's Response:
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {review.doctorResponse}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  ))}
                </Stack>
              )}
            </motion.div>
          )}
        </CardContent>
      </ModernCard>

      {/* Floating Book Button for Mobile */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          left: 0,
          right: 0,
          px: 2,
          display: { xs: 'block', md: 'none' },
          zIndex: 1000,
        }}
      >
        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<CalendarToday />}
          onClick={handleBookAppointment}
          sx={{
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '1rem',
            boxShadow: 6,
            background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
            '&:hover': {
              boxShadow: 8,
              background: 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)',
            },
          }}
        >
          Book Appointment
        </Button>
      </Box>
    </Container>
  );
};

export default DoctorDetailPage;

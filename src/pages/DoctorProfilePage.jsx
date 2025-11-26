import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Tooltip,
  Chip,
  Divider,
} from '@mui/material';
import {
  Edit,
  Visibility,
  Save,
  Cancel,
  VerifiedUser,
  Star,
  CalendarToday,
  CardMembership,
  Assessment,
  Settings,
  ArrowBack,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDoctorProfile } from '../hooks/useDoctorProfile';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { staggerContainer, staggerItem, getAccessibleVariants } from '../theme/animations';
import ModernCard from '../components/common/ModernCard';
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
import api from '../services/api';

const DoctorProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReviewResponse, setShowReviewResponse] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Handle tab query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam !== null) {
      const tabIndex = parseInt(tabParam);
      if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex <= 5) {
        setActiveTab(tabIndex);
      }
    }
  }, []);

  // Use the doctor profile hook
  const {
    profile,
    credentials,
    reviews,
    statistics,
    availability,
    profileCompleteness,
    uploadAvatar,
    updateProfile,
    refresh,
    loading: profileLoading,
  } = useDoctorProfile(doctorId);

  useEffect(() => {
    fetchDoctorId();
  }, []);

  const fetchDoctorId = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the doctor ID from the doctors endpoint
      const doctorsResponse = await api.get('/doctors');
      const doctors = doctorsResponse.data || [];
      
      // Find the doctor record for the current user by email
      const doctorRecord = doctors.find(d => d.email === user.email);
      
      if (!doctorRecord) {
        throw new Error('Doctor profile not found. Please contact administrator.');
      }

      setDoctorId(doctorRecord.id);
    } catch (err) {
      console.error('Error fetching doctor ID:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setEditMode(false); // Exit edit mode when switching tabs
  };

  const handleAvatarUpload = async (file) => {
    try {
      await uploadAvatar(file);
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      alert('Failed to upload avatar. Please try again.');
    }
  };

  const handleSaveProfile = async (profileData) => {
    try {
      await updateProfile(profileData);
      setEditMode(false);
      await refresh();
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile. Please try again.');
    }
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
    setPreviewMode(false);
  };

  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
    setEditMode(false);
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

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
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
      {/* Header with Actions */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{ mb: 4 }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={() => navigate('/doctor/dashboard')}>
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                My Profile
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your professional profile and settings
              </Typography>
            </Box>
          </Box>

          <Box display="flex" gap={1}>
            {!editMode && !previewMode && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<Visibility />}
                  onClick={togglePreviewMode}
                  sx={{ textTransform: 'none' }}
                >
                  Preview
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={toggleEditMode}
                  sx={{ textTransform: 'none' }}
                >
                  Edit Profile
                </Button>
              </>
            )}
            {(editMode || previewMode) && (
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => {
                  setEditMode(false);
                  setPreviewMode(false);
                }}
                sx={{ textTransform: 'none' }}
              >
                Exit {editMode ? 'Edit' : 'Preview'} Mode
              </Button>
            )}
          </Box>
        </Box>

        {/* Mode Indicator */}
        <AnimatePresence>
          {(editMode || previewMode) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert
                severity={editMode ? 'info' : 'success'}
                sx={{ mb: 3 }}
                icon={editMode ? <Edit /> : <Visibility />}
              >
                {editMode
                  ? 'You are in edit mode. Make changes and save when done.'
                  : 'You are viewing your profile as patients see it.'}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Profile Header */}
      {profile && (
        <Box
          component={motion.div}
          variants={getAccessibleVariants(staggerItem, prefersReducedMotion)}
          sx={{ mb: 4 }}
        >
          <DoctorProfileHeader
            doctor={profile}
            onAvatarUpload={handleAvatarUpload}
            profileCompleteness={profileCompleteness}
            showEditButton={false}
            isPreviewMode={previewMode}
          />
        </Box>
      )}

      {/* Navigation Tabs */}
      <ModernCard sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              minHeight: 64,
            },
          }}
        >
          <Tab icon={<VerifiedUser />} label="Profile Information" iconPosition="start" />
          <Tab icon={<CardMembership />} label="Credentials" iconPosition="start" />
          <Tab icon={<CalendarToday />} label="Availability" iconPosition="start" />
          <Tab icon={<Star />} label="Reviews" iconPosition="start" />
          <Tab icon={<Assessment />} label="Statistics" iconPosition="start" />
          <Tab icon={<Settings />} label="Settings" iconPosition="start" />
        </Tabs>
      </ModernCard>

      {/* Tab Content */}
      <Box
        component={motion.div}
        variants={getAccessibleVariants(staggerContainer, prefersReducedMotion)}
        initial="initial"
        animate="animate"
      >
        {/* Profile Information Tab */}
        {activeTab === 0 && (
          <ModernCard
            component={motion.div}
            variants={getAccessibleVariants(staggerItem, prefersReducedMotion)}
          >
            <Box sx={{ p: 3 }}>
              {editMode ? (
                <DoctorProfileEditForm
                  doctorProfile={profile}
                  onSave={handleSaveProfile}
                  onCancel={() => setEditMode(false)}
                />
              ) : (
                <Grid container spacing={3}>
                  {/* Professional Bio */}
                  <Grid item xs={12}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Professional Bio
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {profile?.bio || 'No bio provided yet.'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider />
                  </Grid>

                  {/* Specialization */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Specialization
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {profile?.specialty || 'Not specified'}
                    </Typography>
                  </Grid>

                  {/* Experience */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Years of Experience
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {profile?.experienceYears || 0} years
                    </Typography>
                  </Grid>

                  {/* Consultation Fee */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Consultation Fee
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      ₹{profile?.consultationFee || 0}
                    </Typography>
                  </Grid>

                  {/* Consultation Duration */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Consultation Duration
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {profile?.consultationDuration || 30} minutes
                    </Typography>
                  </Grid>

                  {/* Languages */}
                  {profile?.languagesSpoken && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Languages Spoken
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {(() => {
                          try {
                            const languagesData = profile.languagesSpoken;
                            // Handle if it's already an array
                            if (Array.isArray(languagesData)) {
                              return languagesData.length > 0
                                ? languagesData.map((lang, index) => (
                                    <Chip key={index} label={lang} size="small" />
                                  ))
                                : null;
                            }
                            // Handle if it's a string
                            if (typeof languagesData === 'string' && languagesData.trim() !== '') {
                              const languages = JSON.parse(languagesData);
                              return Array.isArray(languages) && languages.length > 0
                                ? languages.map((lang, index) => (
                                    <Chip key={index} label={lang} size="small" />
                                  ))
                                : null;
                            }
                            return null;
                          } catch (e) {
                            return null;
                          }
                        })()}
                      </Box>
                    </Grid>
                  )}

                  {/* Education */}
                  {profile?.education && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Education
                      </Typography>
                      <Box display="flex" flexDirection="column" gap={1}>
                        {(() => {
                          try {
                            const educationData = profile.education;
                            // Handle if it's already an array
                            if (Array.isArray(educationData)) {
                              return educationData.length > 0
                                ? educationData.map((edu, index) => (
                                    <Box key={index}>
                                      <Typography variant="body1" fontWeight={600}>
                                        {edu.degree}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {edu.institution} • {edu.year}
                                      </Typography>
                                    </Box>
                                  ))
                                : null;
                            }
                            // Handle if it's a string
                            if (typeof educationData === 'string' && educationData.trim() !== '') {
                              const education = JSON.parse(educationData);
                              return Array.isArray(education) && education.length > 0
                                ? education.map((edu, index) => (
                                    <Box key={index}>
                                      <Typography variant="body1" fontWeight={600}>
                                        {edu.degree}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {edu.institution} • {edu.year}
                                      </Typography>
                                    </Box>
                                  ))
                                : null;
                            }
                            return null;
                          } catch (e) {
                            return null;
                          }
                        })()}
                      </Box>
                    </Grid>
                  )}

                  {/* Verification Status */}
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: profile?.isVerified ? 'success.50' : 'warning.50',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <VerifiedUser
                        sx={{
                          color: profile?.isVerified ? 'success.main' : 'warning.main',
                          fontSize: 32,
                        }}
                      />
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {profile?.isVerified ? 'Verified Profile' : 'Verification Pending'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {profile?.isVerified
                            ? 'Your profile has been verified by our team'
                            : 'Your profile is under review'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </Box>
          </ModernCard>
        )}

        {/* Credentials Tab */}
        {activeTab === 1 && (
          <ModernCard
            component={motion.div}
            variants={getAccessibleVariants(staggerItem, prefersReducedMotion)}
          >
            <Box sx={{ p: 3 }}>
              {editMode ? (
                <DoctorCredentialManager
                  doctorId={doctorId}
                  credentials={credentials || []}
                  onUpdate={refresh}
                />
              ) : (
                <DoctorCredentialsSection
                  credentials={credentials || []}
                  isVerified={profile?.isVerified}
                />
              )}
            </Box>
          </ModernCard>
        )}

        {/* Availability Tab */}
        {activeTab === 2 && (
          <ModernCard
            component={motion.div}
            variants={getAccessibleVariants(staggerItem, prefersReducedMotion)}
          >
            <Box sx={{ p: 3 }}>
              {editMode ? (
                <DoctorAvailabilityManager
                  doctorId={doctorId}
                  consultationDuration={profile?.consultationDuration || 30}
                />
              ) : (
                <DoctorAvailabilityCalendar
                  doctorId={doctorId}
                  availability={availability || []}
                />
              )}
            </Box>
          </ModernCard>
        )}

        {/* Reviews Tab */}
        {activeTab === 3 && (
          <Box
            component={motion.div}
            variants={getAccessibleVariants(staggerItem, prefersReducedMotion)}
          >
            {showReviewResponse && selectedReview ? (
              <ModernCard>
                <Box sx={{ p: 3 }}>
                  <DoctorReviewResponseForm
                    review={selectedReview}
                    onSubmit={() => {
                      setShowReviewResponse(false);
                      setSelectedReview(null);
                      refresh();
                    }}
                    onCancel={() => {
                      setShowReviewResponse(false);
                      setSelectedReview(null);
                    }}
                  />
                </Box>
              </ModernCard>
            ) : (
              <DoctorReviewsSection
                reviews={reviews || []}
                totalReviews={(reviews || []).length}
                averageRating={profile?.rating || 0}
                ratingDistribution={{}}
                onRespondToReview={(review) => {
                  setSelectedReview(review);
                  setShowReviewResponse(true);
                }}
              />
            )}
          </Box>
        )}

        {/* Statistics Tab */}
        {activeTab === 4 && statistics && (
          <Box
            component={motion.div}
            variants={getAccessibleVariants(staggerItem, prefersReducedMotion)}
          >
            <DoctorStatisticsCard statistics={statistics} />
          </Box>
        )}

        {/* Settings Tab */}
        {activeTab === 5 && (
          <ModernCard
            component={motion.div}
            variants={getAccessibleVariants(staggerItem, prefersReducedMotion)}
          >
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Profile Settings
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Additional settings and preferences will be available here.
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={2} mt={3}>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => {
                    setActiveTab(0);
                    setEditMode(true);
                  }}
                  sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                >
                  Edit Profile Information
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CardMembership />}
                  onClick={() => {
                    setActiveTab(1);
                    setEditMode(true);
                  }}
                  sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                >
                  Manage Credentials
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CalendarToday />}
                  onClick={() => {
                    setActiveTab(2);
                    setEditMode(true);
                  }}
                  sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                >
                  Update Availability
                </Button>
              </Box>
            </Box>
          </ModernCard>
        )}
      </Box>
    </Container>
  );
};

export default DoctorProfilePage;

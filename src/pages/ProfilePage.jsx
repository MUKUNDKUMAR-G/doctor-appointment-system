import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { useAppointments } from '../hooks/useAppointments';
import api from '../services/api';
import { ProfileSummaryCard } from '../components/features/ProfileSummaryCard';
import { ProfileInfoCard } from '../components/features/ProfileInfoCard';
import { AccountStatistics } from '../components/features/AccountStatistics';
import { AccountSettings } from '../components/features/AccountSettings';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { appointments } = useAppointments();
  const [profileLoading, setProfileLoading] = useState(true);

  // Fetch complete user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setProfileLoading(true);
        const profileData = await authService.getCurrentUser();
        updateUser(profileData);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      } finally {
        setProfileLoading(false);
      }
    };

    if (user?.id) {
      fetchUserProfile();
    } else {
      setProfileLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleProfileSave = async (formData) => {
    const updatedUser = await authService.updateProfile(formData);
    updateUser(updatedUser);
  };

  const handlePasswordChange = async (passwordData) => {
    await authService.changePassword(passwordData);
  };

  const handleAvatarUpload = async (file) => {
    try {
      console.log('Uploading avatar:', file);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload to backend
      const response = await api.post('/users/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Avatar uploaded successfully:', response.data);
      console.log('Avatar URL from upload:', response.data.avatarUrl);
      
      // Update user context with new avatar URL
      if (response.data.avatarUrl) {
        // Refresh user profile from backend
        const updatedProfile = await authService.getCurrentUser();
        console.log('Updated profile from backend:', updatedProfile);
        console.log('Avatar URL in updated profile:', updatedProfile.avatarUrl);
        updateUser(updatedProfile);
        console.log('User context updated');
      }
      
      return response.data;
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw error;
    }
  };

  // Calculate statistics
  const completedAppointments = appointments.filter(apt => apt.status === 'COMPLETED').length;
  const upcomingAppointments = appointments.filter(apt => {
    const appointmentDate = new Date(apt.appointmentDateTime);
    return appointmentDate > new Date() && apt.status === 'SCHEDULED';
  }).length;
  const cancelledAppointments = appointments.filter(apt => apt.status === 'CANCELLED').length;
  const uniqueDoctors = new Set(appointments.map(apt => apt.doctorId).filter(id => id)).size;

  const stats = {
    total: appointments.length,
    completed: completedAppointments,
    upcoming: upcomingAppointments,
    cancelled: cancelledAppointments,
    doctors: uniqueDoctors,
  };

  if (profileLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" id="main-content" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
            My Profile
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your personal information and account settings
          </Typography>
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {/* Left Column - Profile Summary */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <ProfileSummaryCard
              user={user}
              stats={stats}
              onAvatarUpload={handleAvatarUpload}
            />
          </motion.div>
        </Grid>

        {/* Right Column - Profile Info and Settings */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <ProfileInfoCard user={user} onSave={handleProfileSave} />
            </motion.div>

            {/* Account Statistics */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <AccountStatistics stats={stats} />
            </motion.div>

            {/* Account Settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <AccountSettings onPasswordChange={handlePasswordChange} />
            </motion.div>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;
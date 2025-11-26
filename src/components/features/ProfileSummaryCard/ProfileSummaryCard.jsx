import React, { useState, useRef } from 'react';
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  CircularProgress,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  CameraAlt,
  Person,
  CalendarToday,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import ModernCard from '../../common/ModernCard';
import toast from 'react-hot-toast';

const ProfileSummaryCard = ({ user, stats, onAvatarUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  const getInitials = () => {
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload file
      if (onAvatarUpload) {
        await onAvatarUpload(file);
        toast.success('Profile picture updated successfully');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error(error.message || 'Failed to upload profile picture');
      setAvatarPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      })
    : 'N/A';

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    let completed = 0;
    const total = 5;
    
    if (user?.firstName) completed++;
    if (user?.lastName) completed++;
    if (user?.email) completed++;
    if (user?.phoneNumber) completed++;
    if (avatarPreview || user?.avatarUrl) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const completionPercentage = calculateCompletion();

  return (
    <ModernCard variant="elevated" hover={false}>
      <Box sx={{ p: 3 }}>
        {/* Avatar Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Box
              sx={{
                position: 'relative',
                mb: 2,
              }}
            >
              <Avatar
                src={avatarPreview || user?.avatarUrl}
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: 'primary.main',
                  fontSize: '2.5rem',
                  fontWeight: 600,
                  border: (theme) => `4px solid ${theme.palette.background.paper}`,
                  boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                {!avatarPreview && !user?.avatarUrl && getInitials()}
              </Avatar>
              
              {/* Upload Button Overlay */}
              <Tooltip title="Upload profile picture">
                <IconButton
                  onClick={handleAvatarClick}
                  disabled={uploading}
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 40,
                    height: 40,
                    '&:hover': {
                      bgcolor: 'primary.dark',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s',
                    boxShadow: 2,
                  }}
                >
                  {uploading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <CameraAlt fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </Box>
          </motion.div>

          {/* User Info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <Typography
              variant="h5"
              fontWeight={600}
              textAlign="center"
              gutterBottom
            >
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mb: 2 }}
            >
              {user?.role === 'PATIENT' ? 'Patient' : user?.role}
            </Typography>
          </motion.div>

          {/* Member Since */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              borderRadius: 2,
            }}
          >
            <CalendarToday fontSize="small" color="primary" />
            <Typography variant="body2" color="text.secondary">
              Member since {memberSince}
            </Typography>
          </Box>
        </Box>

        {/* Stats Section */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 2,
            mb: 3,
          }}
        >
          {[
            { label: 'Total', value: stats?.total || 0, color: 'primary' },
            { label: 'Completed', value: stats?.completed || 0, color: 'success' },
            { label: 'Upcoming', value: stats?.upcoming || 0, color: 'warning' },
            { label: 'Doctors', value: stats?.doctors || 0, color: 'info' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.05, duration: 0.3 }}
            >
              <Box
                sx={{
                  textAlign: 'center',
                  p: 2,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette[stat.color].main, 0.1),
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette[stat.color].main, 0.15),
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Typography
                  variant="h4"
                  fontWeight={700}
                  color={`${stat.color}.main`}
                  sx={{ mb: 0.5 }}
                >
                  <CountUp
                    end={stat.value}
                    duration={1.5}
                    delay={0.3 + index * 0.1}
                  />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </motion.div>
          ))}
        </Box>

        {/* Profile Completion */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                Profile Completion
              </Typography>
              <Typography variant="body2" fontWeight={600} color="primary">
                {completionPercentage}%
              </Typography>
            </Box>
            
            <Box sx={{ position: 'relative', display: 'inline-flex', width: '100%' }}>
              <Box
                sx={{
                  width: '100%',
                  height: 8,
                  borderRadius: 4,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ delay: 0.6, duration: 1, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)',
                    borderRadius: 4,
                  }}
                />
              </Box>
            </Box>
            
            {completionPercentage < 100 && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: 'block' }}
              >
                Complete your profile to unlock all features
              </Typography>
            )}
          </Box>
        </motion.div>
      </Box>
    </ModernCard>
  );
};

export default ProfileSummaryCard;

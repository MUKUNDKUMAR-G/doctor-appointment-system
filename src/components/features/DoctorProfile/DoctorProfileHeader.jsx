import { memo, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Chip,
  Stack,
  CircularProgress,
  Tooltip,
  Badge,
  LinearProgress,
} from '@mui/material';
import {
  CameraAlt,
  Verified,
  Edit,
  Star,
  LocationOn,
  WorkOutline,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { slideUp, fadeIn, getAccessibleVariants } from '../../../theme/animations';

const DoctorProfileHeader = memo(({
  doctor,
  onAvatarUpload,
  onEditProfile,
  showEditButton = true,
  profileCompleteness = null,
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const {
    id,
    firstName,
    lastName,
    email,
    specialty,
    avatarUrl,
    rating = 0,
    reviewCount = 0,
    isVerified = false,
    experienceYears = 0,
    location,
  } = doctor || {};

  const fullName = `Dr. ${firstName} ${lastName}`;
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`;

  // Handle avatar upload
  const handleAvatarClick = () => {
    if (onAvatarUpload && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !onAvatarUpload) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      await onAvatarUpload(file);
    } catch (error) {
      console.error('Avatar upload failed:', error);
      alert('Failed to upload avatar. Please try again.');
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Get completeness color
  const getCompletenessColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'warning';
    return 'error';
  };

  return (
    <Box
      component={motion.div}
      variants={getAccessibleVariants(slideUp, prefersReducedMotion)}
      initial="initial"
      animate="animate"
      sx={{
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        mb: 3,
      }}
    >
      {/* Background with gradient */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: { xs: 120, sm: 150, md: 180 },
          background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
          },
        }}
      />

      {/* Glassmorphism card */}
      <Box
        sx={{
          position: 'relative',
          mt: { xs: 8, sm: 10, md: 12 },
          mx: { xs: 2, sm: 3, md: 4 },
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 2, md: 4 }}
          alignItems={{ xs: 'center', md: 'flex-start' }}
        >
          {/* Avatar Section */}
          <Box
            sx={{
              position: 'relative',
              flexShrink: 0,
            }}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                isVerified ? (
                  <Tooltip title="Verified Professional" arrow>
                    <Verified
                      sx={{
                        fontSize: 32,
                        color: 'primary.main',
                        bgcolor: 'background.paper',
                        borderRadius: '50%',
                        p: 0.5,
                      }}
                    />
                  </Tooltip>
                ) : null
              }
            >
              <Avatar
                src={avatarUrl}
                alt={fullName}
                sx={{
                  width: { xs: 120, sm: 140, md: 160 },
                  height: { xs: 120, sm: 140, md: 160 },
                  bgcolor: 'primary.main',
                  fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                  fontWeight: 700,
                  border: '4px solid',
                  borderColor: 'background.paper',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  cursor: onAvatarUpload ? 'pointer' : 'default',
                  transition: 'transform 0.2s',
                  '&:hover': onAvatarUpload ? {
                    transform: 'scale(1.05)',
                  } : {},
                }}
                onClick={onAvatarUpload ? handleAvatarClick : undefined}
              >
                {uploading ? (
                  <CircularProgress size={60} sx={{ color: 'white' }} />
                ) : (
                  initials
                )}
              </Avatar>
            </Badge>

            {/* Camera icon for upload */}
            {onAvatarUpload && !uploading && (
              <IconButton
                onClick={handleAvatarClick}
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
                  },
                  boxShadow: 2,
                }}
                aria-label="Upload profile photo"
              >
                <CameraAlt fontSize="small" />
              </IconButton>
            )}

            {/* Hidden file input */}
            {onAvatarUpload && (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                aria-label="Upload avatar file"
              />
            )}
          </Box>

          {/* Profile Info Section */}
          <Box
            sx={{
              flexGrow: 1,
              textAlign: { xs: 'center', md: 'left' },
              width: { xs: '100%', md: 'auto' },
            }}
          >
            {/* Name and Edit Button */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent={{ xs: 'center', md: 'space-between' }}
              flexWrap="wrap"
              gap={2}
              mb={1}
            >
              <Typography
                variant="h4"
                component="h1"
                fontWeight={700}
                sx={{
                  color: 'text.primary',
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                }}
              >
                {fullName}
              </Typography>

              {showEditButton && onEditProfile && (
                <IconButton
                  onClick={onEditProfile}
                  sx={{
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.100',
                    },
                  }}
                  aria-label="Edit profile"
                >
                  <Edit />
                </IconButton>
              )}
            </Box>

            {/* Specialty Chip */}
            <Chip
              label={specialty}
              color="primary"
              sx={{
                fontWeight: 600,
                fontSize: '0.875rem',
                height: 32,
                mb: 2,
              }}
            />

            {/* Key Metrics */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1.5, sm: 3 }}
              divider={
                <Box
                  sx={{
                    display: { xs: 'none', sm: 'block' },
                    width: 1,
                    height: 40,
                    bgcolor: 'divider',
                  }}
                />
              }
              sx={{ mb: 2 }}
            >
              {/* Rating */}
              <Box display="flex" alignItems="center" gap={1} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                <Star sx={{ color: '#FFA500', fontSize: 24 }} />
                <Box>
                  <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                    {rating > 0 ? rating.toFixed(1) : 'N/A'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                  </Typography>
                </Box>
              </Box>

              {/* Experience */}
              <Box display="flex" alignItems="center" gap={1} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                <WorkOutline sx={{ color: 'primary.main', fontSize: 24 }} />
                <Box>
                  <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                    {experienceYears}+
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Years Experience
                  </Typography>
                </Box>
              </Box>

              {/* Location */}
              {location && (
                <Box display="flex" alignItems="center" gap={1} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                  <LocationOn sx={{ color: 'primary.main', fontSize: 24 }} />
                  <Box>
                    <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
                      {location}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Location
                    </Typography>
                  </Box>
                </Box>
              )}
            </Stack>

            {/* Profile Completeness */}
            {profileCompleteness !== null && (
              <Box
                component={motion.div}
                variants={getAccessibleVariants(fadeIn, prefersReducedMotion)}
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'grey.50',
                  border: '1px solid',
                  borderColor: 'grey.200',
                }}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" fontWeight={600} color="text.secondary">
                    Profile Completeness
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color={`${getCompletenessColor(profileCompleteness)}.main`}
                  >
                    {profileCompleteness}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={profileCompleteness}
                  color={getCompletenessColor(profileCompleteness)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'grey.200',
                  }}
                />
                {profileCompleteness < 100 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Complete your profile to improve visibility
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
});

DoctorProfileHeader.displayName = 'DoctorProfileHeader';

export default DoctorProfileHeader;

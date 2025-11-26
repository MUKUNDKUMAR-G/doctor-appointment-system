import { memo } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Box,
  Typography,
  Avatar,
  Chip,
  Rating,
  Button,
  Divider,
  Stack,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  CalendarToday,
  LocationOn,
  WorkOutline,
  School,
  CheckCircle,
  Schedule,
  Verified,
  Star,
  People,
  TrendingUp,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import ModernCard from '../../common/ModernCard';

const DoctorCard = memo(({ doctor, onBookAppointment, onViewProfile }) => {
  const {
    id,
    firstName,
    lastName,
    specialty,
    qualifications,
    experienceYears,
    consultationFee,
    location,
    rating,
    reviewCount,
    avatar,
    isAvailable,
    nextAvailableDate,
    isVerified,
    totalPatients,
    completedAppointments,
    languages,
  } = doctor;

  const fullName = `Dr. ${firstName} ${lastName}`;

  // Format consultation fee
  const formatFee = (fee) => {
    if (!fee) return 'Not specified';
    return `₹${fee.toLocaleString('en-IN')}`;
  };

  // Format availability
  const getAvailabilityText = () => {
    if (isAvailable) {
      return 'Available Today';
    }
    if (nextAvailableDate) {
      const date = new Date(nextAvailableDate);
      const today = new Date();
      const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'Available Tomorrow';
      if (diffDays <= 7) return `Available in ${diffDays} days`;
      return `Next: ${date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
    }
    return 'Schedule on request';
  };

  const getAvailabilityColor = () => {
    if (isAvailable) return 'success';
    if (nextAvailableDate) {
      const date = new Date(nextAvailableDate);
      const today = new Date();
      const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
      if (diffDays <= 3) return 'warning';
    }
    return 'default';
  };

  return (
    <ModernCard
      variant="elevated"
      hover
      component={motion.div}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Doctor Header */}
        <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
          {/* Avatar with Verification Badge */}
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              isVerified ? (
                <Tooltip title="Verified Professional" arrow placement="top">
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: 'success.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '3px solid',
                      borderColor: 'background.paper',
                      boxShadow: 2,
                    }}
                  >
                    <Verified sx={{ fontSize: 16, color: 'white' }} />
                  </Box>
                </Tooltip>
              ) : null
            }
          >
            <Avatar
              src={avatar}
              alt={fullName}
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                fontSize: '2rem',
                fontWeight: 600,
                border: '3px solid',
                borderColor: 'background.paper',
                boxShadow: 3,
              }}
            >
              {firstName?.[0]}{lastName?.[0]}
            </Avatar>
          </Badge>

          <Box flexGrow={1}>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <Typography
                variant="h6"
                component="div"
                fontWeight={700}
                sx={{
                  color: 'text.primary',
                  lineHeight: 1.3,
                }}
              >
                {fullName}
              </Typography>
              {isVerified && (
                <Tooltip title="Verified Professional" arrow>
                  <Verified sx={{ fontSize: 20, color: 'success.main' }} />
                </Tooltip>
              )}
            </Box>

            <Chip
              label={specialty}
              size="small"
              color="primary"
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 24,
              }}
            />

            {/* Rating - More Prominent */}
            {rating && (
              <Box 
                display="flex" 
                alignItems="center" 
                gap={0.5} 
                mt={1}
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'warning.50',
                  border: '1px solid',
                  borderColor: 'warning.200',
                }}
              >
                <Star sx={{ fontSize: 18, color: 'warning.main' }} />
                <Typography variant="body2" color="warning.dark" fontWeight={700}>
                  {rating.toFixed(1)}
                </Typography>
                {reviewCount && (
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Quick Stats Preview */}
        {(totalPatients || completedAppointments || experienceYears) && (
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mb: 2,
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'primary.50',
              border: '1px solid',
              borderColor: 'primary.100',
            }}
          >
            {experienceYears && (
              <Tooltip title="Years of Experience" arrow>
                <Box flex={1} textAlign="center">
                  <Typography variant="h6" fontWeight={700} color="primary.main">
                    {experienceYears}+
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Years
                  </Typography>
                </Box>
              </Tooltip>
            )}
            {totalPatients && (
              <Tooltip title="Total Patients Treated" arrow>
                <Box flex={1} textAlign="center">
                  <Typography variant="h6" fontWeight={700} color="primary.main">
                    {totalPatients > 1000 ? `${(totalPatients / 1000).toFixed(1)}k` : totalPatients}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Patients
                  </Typography>
                </Box>
              </Tooltip>
            )}
            {completedAppointments && (
              <Tooltip title="Completed Appointments" arrow>
                <Box flex={1} textAlign="center">
                  <Typography variant="h6" fontWeight={700} color="primary.main">
                    {completedAppointments > 1000 ? `${(completedAppointments / 1000).toFixed(1)}k` : completedAppointments}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Visits
                  </Typography>
                </Box>
              </Tooltip>
            )}
          </Box>
        )}

        {/* Doctor Details */}
        <Stack spacing={1.5}>
          {/* Qualifications */}
          {qualifications && (
            <Box display="flex" alignItems="flex-start" gap={1}>
              <School sx={{ fontSize: 20, color: 'primary.main', mt: 0.2 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Qualifications
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {qualifications}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Experience */}
          {experienceYears && (
            <Box display="flex" alignItems="center" gap={1}>
              <WorkOutline sx={{ fontSize: 20, color: 'primary.main' }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Experience
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {experienceYears} {experienceYears === 1 ? 'year' : 'years'}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Location */}
          {location && (
            <Box display="flex" alignItems="center" gap={1}>
              <LocationOn sx={{ fontSize: 20, color: 'primary.main' }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Location
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {location}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <Box display="flex" alignItems="flex-start" gap={1}>
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'primary.main',
                  fontSize: 16,
                  fontWeight: 700,
                  mt: 0.2,
                }}
              >
                🌐
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Languages
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {Array.isArray(languages) ? languages.join(', ') : languages}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Consultation Fee */}
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'primary.main',
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              ₹
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Consultation Fee
              </Typography>
              <Typography variant="body2" fontWeight={600} color="primary.main">
                {formatFee(consultationFee)}
              </Typography>
            </Box>
          </Box>

          {/* Availability Indicator */}
          <Box
            sx={{
              mt: 1,
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: isAvailable ? 'success.50' : 'grey.50',
              border: '1px solid',
              borderColor: isAvailable ? 'success.200' : 'grey.200',
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              {isAvailable ? (
                <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
              ) : (
                <Schedule sx={{ fontSize: 18, color: 'text.secondary' }} />
              )}
              <Typography
                variant="body2"
                fontWeight={600}
                color={isAvailable ? 'success.main' : 'text.secondary'}
              >
                {getAvailabilityText()}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ p: 2, pt: 0, gap: 1, flexDirection: 'column' }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<CalendarToday />}
          onClick={() => onBookAppointment(id)}
          sx={{
            py: 1.3,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            boxShadow: 2,
            background: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)',
            '&:hover': {
              boxShadow: 4,
              background: 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 100%)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          Book Appointment
        </Button>
        {onViewProfile && (
          <Button
            fullWidth
            variant="outlined"
            onClick={() => onViewProfile(id)}
            sx={{
              py: 1.1,
              textTransform: 'none',
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                transform: 'translateY(-2px)',
                boxShadow: 2,
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            View Full Profile
          </Button>
        )}
      </CardActions>
    </ModernCard>
  );
});

DoctorCard.displayName = 'DoctorCard';

export default DoctorCard;

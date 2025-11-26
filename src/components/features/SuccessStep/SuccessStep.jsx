import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Divider,
  Stack,
} from '@mui/material';
import {
  CheckCircle,
  CalendarToday,
  Person,
  AccessTime,
  Download,
  Email,
  Event,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { animations } from '../../../theme/animations';
import ModernCard from '../../common/ModernCard/ModernCard';

const SuccessStep = ({ bookingResult, doctorInfo, selectedSlot }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti animation on mount
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Animation variants
  const checkmarkVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15,
        duration: 0.6,
      },
    },
  };

  const circleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        delay: 0.2,
        duration: 0.4,
        ease: animations.easing.easeOut,
      },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.5,
        duration: 0.5,
        ease: animations.easing.easeOut,
      },
    },
  };

  const confettiVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: (i) => ({
      opacity: [0, 1, 1, 0],
      scale: [0, 1, 1, 0.5],
      x: [0, Math.random() * 200 - 100],
      y: [0, -100 - Math.random() * 100],
      rotate: [0, Math.random() * 360],
      transition: {
        duration: 2,
        delay: i * 0.05,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
      {/* Confetti Animation */}
      {showConfetti && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={confettiVariants}
              initial="hidden"
              animate="visible"
              style={{
                position: 'absolute',
                width: 10,
                height: 10,
                borderRadius: i % 3 === 0 ? '50%' : '2px',
                backgroundColor: ['#2563EB', '#7C3AED', '#10B981', '#F59E0B', '#EF4444'][i % 5],
              }}
            />
          ))}
        </Box>
      )}

      {/* Success Content */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Success Icon with Animation */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 3,
            position: 'relative',
          }}
        >
          {/* Background Circle */}
          <motion.div
            variants={circleVariants}
            initial="hidden"
            animate="visible"
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
              }}
            >
              <motion.div
                variants={checkmarkVariants}
                initial="hidden"
                animate="visible"
              >
                <CheckCircle
                  sx={{
                    fontSize: 72,
                    color: 'white',
                  }}
                />
              </motion.div>
            </Box>
          </motion.div>
        </Box>

        {/* Success Message */}
        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
        >
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Appointment Booked!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your appointment has been successfully scheduled
            </Typography>
          </Box>

          {/* Appointment Details Card */}
          <ModernCard variant="elevated" sx={{ mb: 3 }}>
            <Box sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <Event color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Appointment Details
                </Typography>
              </Box>

              <Stack spacing={2.5}>
                {/* Appointment ID */}
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    Appointment ID
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="h6" fontWeight={600} color="primary.main">
                      #{bookingResult?.id}
                    </Typography>
                    <Chip 
                      label={bookingResult?.status || 'SCHEDULED'}
                      size="small"
                      color="success"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </Box>

                <Divider />

                {/* Doctor Information */}
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Person sx={{ color: 'white', fontSize: 28 }} />
                  </Box>
                  <Box flex={1}>
                    <Typography variant="caption" color="text.secondary">
                      Doctor
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      Dr. {doctorInfo?.firstName} {doctorInfo?.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {doctorInfo?.specialty || 'General Practice'}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                {/* Date & Time */}
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <CalendarToday sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      Date & Time
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={600}>
                    {bookingResult?.appointmentDateTime ? (
                      format(new Date(bookingResult.appointmentDateTime), 'EEEE, MMMM d, yyyy')
                    ) : selectedSlot ? (
                      format(new Date(selectedSlot.date), 'EEEE, MMMM d, yyyy')
                    ) : (
                      'Date not available'
                    )}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <AccessTime sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {bookingResult?.appointmentDateTime ? (
                        format(new Date(bookingResult.appointmentDateTime), 'h:mm a')
                      ) : selectedSlot?.slot?.time ? (
                        selectedSlot.slot.time
                      ) : (
                        'Time not available'
                      )} • 30 minutes
                    </Typography>
                  </Box>
                </Box>

                {/* Notes if provided */}
                {bookingResult?.notes && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                        Notes
                      </Typography>
                      <Typography variant="body2">
                        {bookingResult.notes}
                      </Typography>
                    </Box>
                  </>
                )}
              </Stack>
            </Box>
          </ModernCard>

          {/* Action Buttons */}
          <Stack spacing={2}>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              <Button
                variant="outlined"
                startIcon={<Download />}
                fullWidth
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Download Confirmation
              </Button>
              <Button
                variant="outlined"
                startIcon={<Email />}
                fullWidth
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Email Confirmation
              </Button>
            </Box>

            {/* Info Message */}
            <Box
              sx={{
                bgcolor: 'primary.50',
                borderRadius: 2,
                p: 2,
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" color="primary.main" fontWeight={500}>
                📧 A confirmation email has been sent to your registered email address
              </Typography>
            </Box>
          </Stack>
        </motion.div>
      </Box>
    </Box>
  );
};

export default SuccessStep;

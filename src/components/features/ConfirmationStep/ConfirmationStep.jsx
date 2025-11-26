import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  TextField,
  Alert,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Person,
  CalendarToday,
  AccessTime,
  Timer,
  Notes as NotesIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { animations, fadeIn, slideUp } from '../../../theme/animations';
import ModernCard from '../../common/ModernCard/ModernCard';

const ConfirmationStep = ({
  doctorInfo,
  selectedSlot,
  appointmentNotes,
  onNotesChange,
  reservedSlot,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [progress, setProgress] = useState(100);

  // Calculate time remaining for reservation
  useEffect(() => {
    if (!reservedSlot?.expiresAt) return;

    const updateTimer = () => {
      const now = new Date();
      const expiresAt = new Date(reservedSlot.expiresAt);
      const remaining = Math.max(0, expiresAt - now);
      
      setTimeRemaining(remaining);
      
      // Calculate progress (10 minutes = 600000ms)
      const totalTime = 10 * 60 * 1000;
      const progressPercent = (remaining / totalTime) * 100;
      setProgress(progressPercent);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [reservedSlot]);

  // Format time remaining
  const formatTimeRemaining = (ms) => {
    if (!ms) return '0:00';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get urgency color
  const getUrgencyColor = () => {
    if (progress > 50) return 'success';
    if (progress > 25) return 'warning';
    return 'error';
  };

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      animate="animate"
      transition={{
        duration: animations.duration.standard / 1000,
        ease: animations.easing.easeInOut,
      }}
    >
      <Box>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Confirm Appointment Details
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Please review your appointment details before confirming
        </Typography>

        {/* Reservation Timer */}
        {reservedSlot && timeRemaining !== null && (
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
          >
            <Alert 
              severity={getUrgencyColor()} 
              icon={<Timer />}
              sx={{ 
                mb: 3,
                '& .MuiAlert-message': {
                  width: '100%',
                },
              }}
            >
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" fontWeight={500}>
                    Time slot reserved
                  </Typography>
                  <Chip 
                    label={formatTimeRemaining(timeRemaining)}
                    size="small"
                    color={getUrgencyColor()}
                    sx={{ fontWeight: 600, fontFamily: 'monospace' }}
                  />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  color={getUrgencyColor()}
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    bgcolor: 'rgba(0,0,0,0.1)',
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Complete your booking before the timer expires
                </Typography>
              </Box>
            </Alert>
          </motion.div>
        )}

        {/* Appointment Summary Card */}
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.3 }}
        >
          <ModernCard variant="elevated" sx={{ mb: 3 }}>
            <Box sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <CalendarToday color="primary" fontSize="small" />
                <Typography variant="subtitle1" fontWeight={600}>
                  Appointment Summary
                </Typography>
              </Box>

              <Box display="flex" flexDirection="column" gap={2.5}>
                {/* Doctor Information */}
                <Box display="flex" alignItems="flex-start" gap={2}>
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
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Doctor
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      Dr. {doctorInfo?.firstName} {doctorInfo?.lastName}
                    </Typography>
                    <Chip 
                      label={doctorInfo?.specialty || 'General Practice'}
                      size="small"
                      sx={{ 
                        mt: 0.5,
                        bgcolor: 'primary.50',
                        color: 'primary.main',
                        fontWeight: 500,
                      }}
                    />
                  </Box>
                </Box>

                <Divider />

                {/* Date Information */}
                <Box display="flex" alignItems="flex-start" gap={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: 'success.50',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <CalendarToday sx={{ color: 'success.main', fontSize: 24 }} />
                  </Box>
                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Date
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {selectedSlot && format(new Date(selectedSlot.date), 'EEEE, MMMM d, yyyy')}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                {/* Time Information */}
                <Box display="flex" alignItems="flex-start" gap={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: 'warning.50',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <AccessTime sx={{ color: 'warning.main', fontSize: 24 }} />
                  </Box>
                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Time
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {selectedSlot?.slot.time}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Duration: 30 minutes
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </ModernCard>
        </motion.div>

        {/* Notes Section */}
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4 }}
        >
          <ModernCard variant="outlined" sx={{ mb: 2 }}>
            <Box sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <NotesIcon color="primary" fontSize="small" />
                <Typography variant="subtitle1" fontWeight={600}>
                  Additional Notes
                </Typography>
                <Chip 
                  label="Optional" 
                  size="small" 
                  sx={{ 
                    ml: 'auto',
                    bgcolor: 'grey.100',
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                  }}
                />
              </Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Describe your symptoms, reason for visit, or any specific concerns you'd like to discuss with the doctor..."
                value={appointmentNotes}
                onChange={(e) => onNotesChange(e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderWidth: 2,
                    },
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                This information will help the doctor prepare for your appointment
              </Typography>
            </Box>
          </ModernCard>
        </motion.div>
      </Box>
    </motion.div>
  );
};

export default ConfirmationStep;

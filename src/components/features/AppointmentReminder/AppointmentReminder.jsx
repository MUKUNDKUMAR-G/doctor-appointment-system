import { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Button, Avatar } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Close, 
  CalendarToday, 
  AccessTime, 
  Person,
  NavigateNext 
} from '@mui/icons-material';
import { parseISO, formatDistanceToNow, differenceInHours, differenceInMinutes } from 'date-fns';
import { dateUtils } from '../../../utils/dateUtils';

const AppointmentReminder = ({ appointment, onDismiss, onViewDetails }) => {
  const [timeUntil, setTimeUntil] = useState('');

  useEffect(() => {
    if (!appointment) return;

    const updateCountdown = () => {
      const appointmentDate = parseISO(appointment.appointmentDateTime);
      const now = new Date();
      const hoursUntil = differenceInHours(appointmentDate, now);
      const minutesUntil = differenceInMinutes(appointmentDate, now);

      if (minutesUntil < 60) {
        setTimeUntil(`in ${minutesUntil} minute${minutesUntil !== 1 ? 's' : ''}`);
      } else if (hoursUntil < 24) {
        setTimeUntil(`in ${hoursUntil} hour${hoursUntil !== 1 ? 's' : ''}`);
      } else {
        setTimeUntil(formatDistanceToNow(appointmentDate, { addSuffix: true }));
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [appointment]);

  if (!appointment) return null;

  const appointmentDate = parseISO(appointment.appointmentDateTime);
  const doctorName = appointment.doctorName ? `Dr. ${appointment.doctorName}` : 'Unknown Doctor';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 2,
            p: 3,
            mb: 3,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
          }}
        >
          {/* Background decoration */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
            }}
          />

          <Box display="flex" alignItems="flex-start" justifyContent="space-between">
            <Box flex={1}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <CalendarToday sx={{ fontSize: 20 }} />
                <Typography variant="overline" sx={{ fontWeight: 600, letterSpacing: 1 }}>
                  Upcoming Appointment
                </Typography>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                {timeUntil}
              </Typography>

              <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar 
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {doctorName}
                    </Typography>
                    {appointment.doctorSpecialty && (
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        {appointment.doctorSpecialty}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={2}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <CalendarToday sx={{ fontSize: 16 }} />
                    <Typography variant="body2">
                      {dateUtils.formatDate(appointmentDate)}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <AccessTime sx={{ fontSize: 16 }} />
                    <Typography variant="body2">
                      {dateUtils.formatTime(appointmentDate)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box display="flex" gap={1} mt={2}>
                <Button
                  variant="contained"
                  size="small"
                  endIcon={<NavigateNext />}
                  onClick={onViewDetails}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  View Details
                </Button>
              </Box>
            </Box>

            <IconButton
              size="small"
              onClick={onDismiss}
              sx={{
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
};

export default AppointmentReminder;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  AccessTime,
  CheckCircle,
  Cancel,
  Person,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  format, 
  addDays, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  addMonths,
  subMonths,
} from 'date-fns';
import { animations, scaleIn } from '../../../theme/animations';
import ModernCard from '../../common/ModernCard/ModernCard';

const DateTimeSelectionStep = ({
  doctorInfo,
  availability = {},
  loading = false,
  error = null,
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  onFetchAvailability,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState(null);
  const [hoveredSlot, setHoveredSlot] = useState(null);

  // Fetch availability when month changes
  useEffect(() => {
    if (onFetchAvailability) {
      onFetchAvailability(currentMonth);
    }
  }, [currentMonth, onFetchAvailability]);

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (date) => {
    const isPast = isBefore(date, new Date()) && !isToday(date);
    if (!isPast) {
      onDateSelect(date);
    }
  };

  const handleTimeClick = (time) => {
    if (time.available) {
      onTimeSelect(time);
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get time slots for selected date
  const getTimeSlotsForDate = () => {
    if (!selectedDate) {
      console.log('No date selected');
      return [];
    }
    
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    console.log('Getting slots for date:', dateKey);
    console.log('Available dates:', Object.keys(availability));
    console.log('Slots for this date:', availability[dateKey]);
    return availability[dateKey] || [];
  };

  const timeSlots = getTimeSlotsForDate();
  
  // Log time slots for debugging
  console.log('Time slots to render:', timeSlots);
  console.log('Time slots length:', timeSlots.length);

  // Check if date has available slots
  const hasAvailableSlots = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const slots = availability[dateKey] || [];
    return slots.some(slot => slot.available);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Date & Time
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose your preferred appointment date and time slot.
      </Typography>

      {/* Doctor Info Card */}
      {doctorInfo && (
        <Paper 
          sx={{ 
            p: 2, 
            mb: 3, 
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
            border: '1px solid',
            borderColor: 'primary.light',
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563EB 0%, #60A5FA 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.25rem',
                fontWeight: 600,
              }}
            >
              {doctorInfo.firstName?.[0]}{doctorInfo.lastName?.[0]}
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight="medium">
                Dr. {doctorInfo.firstName} {doctorInfo.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {doctorInfo.specialty}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      <Grid container spacing={3}>
        {/* Calendar Section */}
        <Grid item xs={12} md={7}>
          <ModernCard variant="outlined">
            <Box sx={{ p: 2 }}>
              {/* Month Navigation */}
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <IconButton onClick={handlePreviousMonth} size="small">
                  <ChevronLeft />
                </IconButton>
                <Typography variant="h6" fontWeight={600}>
                  {format(currentMonth, 'MMMM yyyy')}
                </Typography>
                <IconButton onClick={handleNextMonth} size="small">
                  <ChevronRight />
                </IconButton>
              </Box>

              {/* Week Days Header */}
              <Grid container spacing={0.5} sx={{ mb: 1 }}>
                {weekDays.map((day) => (
                  <Grid item xs key={day}>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color="text.secondary"
                      textAlign="center"
                      display="block"
                    >
                      {day}
                    </Typography>
                  </Grid>
                ))}
              </Grid>

              {/* Calendar Days */}
              <Grid container spacing={0.5}>
                {calendarDays.map((day, index) => {
                  const isPast = isBefore(day, new Date()) && !isToday(day);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isTodayDate = isToday(day);
                  const hasSlots = hasAvailableSlots(day);
                  const isHovered = hoveredDate && isSameDay(day, hoveredDate);

                  return (
                    <Grid item xs key={index}>
                      <motion.div
                        whileHover={!isPast && isCurrentMonth && hasSlots ? { scale: 1.08 } : {}}
                        whileTap={!isPast && isCurrentMonth && hasSlots ? { scale: 0.95 } : {}}
                        transition={{
                          duration: animations.duration.shorter / 1000,
                          ease: animations.easing.easeOut,
                        }}
                      >
                        <Button
                          fullWidth
                          onClick={() => handleDateClick(day)}
                          onMouseEnter={() => setHoveredDate(day)}
                          onMouseLeave={() => setHoveredDate(null)}
                          disabled={isPast || !isCurrentMonth || !hasSlots}
                          sx={{
                            minWidth: 0,
                            height: 52,
                            borderRadius: 2,
                            position: 'relative',
                            bgcolor: isSelected 
                              ? 'primary.main' 
                              : isHovered && hasSlots
                              ? 'primary.100'
                              : isTodayDate 
                              ? 'primary.50' 
                              : hasSlots && isCurrentMonth && !isPast
                              ? 'success.50'
                              : 'transparent',
                            color: isSelected 
                              ? 'white' 
                              : !isCurrentMonth 
                              ? 'text.disabled' 
                              : hasSlots
                              ? 'text.primary'
                              : 'text.disabled',
                            fontWeight: isSelected || isTodayDate ? 600 : hasSlots ? 500 : 400,
                            border: isTodayDate && !isSelected ? 2 : hasSlots && !isSelected ? 1 : 0,
                            borderColor: isTodayDate ? 'primary.main' : hasSlots ? 'success.light' : 'transparent',
                            boxShadow: isSelected 
                              ? '0 4px 12px rgba(37, 99, 235, 0.3)' 
                              : isHovered && hasSlots
                              ? '0 2px 8px rgba(37, 99, 235, 0.15)'
                              : 'none',
                            transition: `all ${animations.duration.standard}ms ${animations.easing.easeInOut}`,
                            '&:hover': {
                              bgcolor: isSelected 
                                ? 'primary.dark' 
                                : hasSlots
                                ? 'primary.100'
                                : 'transparent',
                              borderColor: hasSlots && !isSelected ? 'primary.light' : undefined,
                            },
                            '&.Mui-disabled': {
                              color: 'text.disabled',
                              opacity: 0.3,
                              bgcolor: 'transparent',
                            },
                          }}
                        >
                          <Box sx={{ position: 'relative', width: '100%' }}>
                            <Typography 
                              variant="body2"
                              sx={{
                                fontSize: hasSlots ? '0.95rem' : '0.875rem',
                                fontWeight: hasSlots ? 600 : 400,
                              }}
                            >
                              {format(day, 'd')}
                            </Typography>
                            {hasSlots && isCurrentMonth && !isPast && (
                              <Box
                                component={motion.div}
                                animate={{
                                  scale: isHovered ? [1, 1.3, 1] : 1,
                                }}
                                transition={{
                                  duration: 0.3,
                                  repeat: isHovered ? Infinity : 0,
                                  repeatDelay: 0.5,
                                }}
                                sx={{
                                  position: 'absolute',
                                  bottom: -8,
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  bgcolor: isSelected ? 'white' : 'success.main',
                                  boxShadow: isSelected 
                                    ? '0 0 8px rgba(255, 255, 255, 0.6)' 
                                    : '0 0 8px rgba(16, 185, 129, 0.4)',
                                }}
                              />
                            )}
                          </Box>
                        </Button>
                      </motion.div>
                    </Grid>
                  );
                })}
              </Grid>

              {/* Legend */}
              <Box 
                sx={{ 
                  mt: 3, 
                  pt: 2,
                  borderTop: 1,
                  borderColor: 'divider',
                  display: 'flex', 
                  gap: 2.5, 
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                <Box display="flex" alignItems="center" gap={0.75}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: 1,
                      bgcolor: 'primary.main',
                      boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)',
                    }}
                  />
                  <Typography variant="caption" fontWeight={500} color="text.primary">
                    Selected
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.75}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: 1,
                      bgcolor: 'success.50',
                      border: 1,
                      borderColor: 'success.light',
                    }}
                  />
                  <Typography variant="caption" fontWeight={500} color="text.primary">
                    Available
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.75}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: 1,
                      border: 2,
                      borderColor: 'primary.main',
                      bgcolor: 'primary.50',
                    }}
                  />
                  <Typography variant="caption" fontWeight={500} color="text.primary">
                    Today
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.75}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: 1,
                      bgcolor: 'neutral.100',
                      opacity: 0.5,
                    }}
                  />
                  <Typography variant="caption" fontWeight={500} color="text.secondary">
                    Unavailable
                  </Typography>
                </Box>
              </Box>
            </Box>
          </ModernCard>
        </Grid>

        {/* Time Slots Section */}
        <Grid item xs={12} md={5}>
          <ModernCard variant="outlined">
            <Box sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Available Time Slots
                </Typography>
                {selectedDate && timeSlots.length > 0 && (
                  <Chip
                    label={`${timeSlots.filter(s => s.available).length} available`}
                    size="small"
                    color="success"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Box>

              {!selectedDate ? (
                <Box 
                  sx={{ 
                    py: 6, 
                    textAlign: 'center',
                    color: 'text.secondary',
                  }}
                >
                  <AccessTime sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                  <Typography variant="body2">
                    Select a date to view available time slots
                  </Typography>
                </Box>
              ) : loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress size={32} />
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              ) : timeSlots.length === 0 ? (
                <Box 
                  sx={{ 
                    py: 6, 
                    textAlign: 'center',
                    color: 'text.secondary',
                  }}
                >
                  <Cancel sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                  <Typography variant="body2">
                    No time slots available for this date
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Box 
                    sx={{ 
                      mb: 2,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'primary.50',
                      border: 1,
                      borderColor: 'primary.100',
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      fontWeight={600}
                      color="primary.main"
                      textAlign="center"
                    >
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </Typography>
                  </Box>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedDate?.toString()}
                      variants={scaleIn}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{
                        duration: animations.duration.standard / 1000,
                      }}
                    >
                      <Grid container spacing={1.5}>
                        {timeSlots.map((slot, index) => {
                          const isSelected = selectedTime && selectedTime.time === slot.time;
                          const isHovered = hoveredSlot === slot.time;
                          
                          return (
                            <Grid item xs={6} key={index}>
                              <motion.div
                                whileHover={slot.available ? { scale: 1.08, y: -2 } : {}}
                                whileTap={slot.available ? { scale: 0.95 } : {}}
                                transition={{
                                  duration: animations.duration.shorter / 1000,
                                  ease: animations.easing.easeOut,
                                }}
                              >
                                <Button
                                  fullWidth
                                  variant={isSelected ? 'contained' : slot.available ? 'outlined' : 'text'}
                                  color={slot.available ? 'primary' : 'inherit'}
                                  disabled={!slot.available}
                                  onClick={() => handleTimeClick(slot)}
                                  onMouseEnter={() => setHoveredSlot(slot.time)}
                                  onMouseLeave={() => setHoveredSlot(null)}
                                  startIcon={
                                    slot.available ? (
                                      isSelected ? <CheckCircle /> : <AccessTime />
                                    ) : (
                                      <Cancel />
                                    )
                                  }
                                  sx={{
                                    py: 1.75,
                                    px: 2,
                                    fontSize: '0.9rem',
                                    fontWeight: isSelected ? 700 : slot.available ? 600 : 500,
                                    borderRadius: 2,
                                    borderWidth: 2,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    bgcolor: isSelected 
                                      ? 'primary.main'
                                      : slot.available
                                      ? 'success.50'
                                      : 'neutral.100',
                                    color: isSelected
                                      ? 'white'
                                      : slot.available
                                      ? 'primary.main'
                                      : 'text.disabled',
                                    borderColor: isSelected
                                      ? 'primary.main'
                                      : slot.available
                                      ? 'success.main'
                                      : 'neutral.300',
                                    boxShadow: isSelected 
                                      ? '0 6px 16px rgba(37, 99, 235, 0.4)' 
                                      : slot.available
                                      ? '0 2px 8px rgba(16, 185, 129, 0.15)'
                                      : 'none',
                                    transition: `all ${animations.duration.standard}ms ${animations.easing.easeInOut}`,
                                    '&:hover': {
                                      bgcolor: isSelected 
                                        ? 'primary.dark'
                                        : slot.available
                                        ? 'primary.50'
                                        : 'neutral.100',
                                      borderColor: slot.available && !isSelected
                                        ? 'primary.main'
                                        : undefined,
                                      boxShadow: slot.available && !isSelected
                                        ? '0 4px 12px rgba(37, 99, 235, 0.25)'
                                        : undefined,
                                    },
                                    '&.Mui-disabled': {
                                      color: 'text.disabled',
                                      opacity: 0.4,
                                      bgcolor: 'neutral.50',
                                      borderColor: 'neutral.200',
                                    },
                                    '&::before': slot.available && !isSelected ? {
                                      content: '""',
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
                                      opacity: 0,
                                      transition: `opacity ${animations.duration.standard}ms ${animations.easing.easeInOut}`,
                                    } : {},
                                    '&:hover::before': slot.available && !isSelected ? {
                                      opacity: 1,
                                    } : {},
                                  }}
                                >
                                  {slot.time}
                                </Button>
                              </motion.div>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </motion.div>
                  </AnimatePresence>

                  {/* Time Slots Legend */}
                  <Box 
                    sx={{ 
                      mt: 3, 
                      pt: 2,
                      borderTop: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={1.5}>
                      Slot Status
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: 1,
                            bgcolor: 'success.50',
                            border: 2,
                            borderColor: 'success.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <AccessTime sx={{ fontSize: 12, color: 'success.main' }} />
                        </Box>
                        <Typography variant="caption" color="text.primary">
                          Available - Click to book
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: 1,
                            bgcolor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <CheckCircle sx={{ fontSize: 12, color: 'white' }} />
                        </Box>
                        <Typography variant="caption" color="text.primary">
                          Selected slot
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: 1,
                            bgcolor: 'neutral.100',
                            opacity: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Cancel sx={{ fontSize: 12, color: 'text.disabled' }} />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Booked / Unavailable
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </ModernCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DateTimeSelectionStep;

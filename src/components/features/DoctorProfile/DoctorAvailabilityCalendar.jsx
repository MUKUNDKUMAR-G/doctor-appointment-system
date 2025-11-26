import { memo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  ButtonGroup,
  Chip,
  Grid,
  Stack,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  CalendarToday,
  Schedule,
  CheckCircle,
  Cancel,
  ViewWeek,
  CalendarViewMonth,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { fadeIn, getAccessibleVariants } from '../../../theme/animations';
import ModernCard from '../../common/ModernCard';

const DoctorAvailabilityCalendar = memo(({
  availability = [],
  selectedDate = new Date(),
  onDateSelect,
  onTimeSlotSelect,
  viewMode: initialViewMode = 'week',
}) => {
  const [currentDate, setCurrentDate] = useState(selectedDate);
  const [viewMode, setViewMode] = useState(initialViewMode);
  const prefersReducedMotion = useReducedMotion();

  // Get days in current view
  const getDaysInView = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    if (viewMode === 'week') {
      // Get 7 days for week view
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        days.push(day);
      }
    } else {
      // Get days for month view
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      // Start from the Sunday before the first day
      const startDay = new Date(firstDay);
      startDay.setDate(firstDay.getDate() - firstDay.getDay());
      
      // End on the Saturday after the last day
      const endDay = new Date(lastDay);
      endDay.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
      
      let current = new Date(startDay);
      while (current <= endDay) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    }

    return days;
  };

  // Navigate to previous period
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setMonth(currentDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  // Navigate to next period
  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + 7);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // Go to today
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Check if date has availability
  const hasAvailability = (date) => {
    if (!date || !Array.isArray(availability)) return false;
    try {
      const dateStr = date.toISOString().split('T')[0];
      return availability.some(slot => {
        if (!slot || !slot.date) return false;
        try {
          const slotDate = new Date(slot.date);
          if (isNaN(slotDate.getTime())) return false;
          const slotDateStr = slotDate.toISOString().split('T')[0];
          return slotDateStr === dateStr && slot.isAvailable;
        } catch (e) {
          return false;
        }
      });
    } catch (e) {
      return false;
    }
  };

  // Get time slots for a date
  const getTimeSlotsForDate = (date) => {
    if (!date || !Array.isArray(availability)) return [];
    try {
      const dateStr = date.toISOString().split('T')[0];
      return availability.filter(slot => {
        if (!slot || !slot.date) return false;
        try {
          const slotDate = new Date(slot.date);
          if (isNaN(slotDate.getTime())) return false;
          const slotDateStr = slotDate.toISOString().split('T')[0];
          return slotDateStr === dateStr;
        } catch (e) {
          return false;
        }
      });
    } catch (e) {
      return [];
    }
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is selected
  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  // Check if date is in current month (for month view)
  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Render calendar header
  const renderHeader = () => (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      flexWrap="wrap"
      gap={2}
      mb={3}
    >
      {/* Date navigation */}
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton onClick={handlePrevious} size="small">
          <ChevronLeft />
        </IconButton>
        <Typography variant="h6" fontWeight={700} sx={{ minWidth: 200, textAlign: 'center' }}>
          {formatDate(currentDate)}
        </Typography>
        <IconButton onClick={handleNext} size="small">
          <ChevronRight />
        </IconButton>
        <Button
          size="small"
          onClick={handleToday}
          sx={{ ml: 1, textTransform: 'none' }}
        >
          Today
        </Button>
      </Box>

      {/* View mode toggle */}
      <ButtonGroup size="small" variant="outlined">
        <Button
          onClick={() => setViewMode('week')}
          variant={viewMode === 'week' ? 'contained' : 'outlined'}
          startIcon={<ViewWeek />}
        >
          Week
        </Button>
        <Button
          onClick={() => setViewMode('month')}
          variant={viewMode === 'month' ? 'contained' : 'outlined'}
          startIcon={<CalendarViewMonth />}
        >
          Month
        </Button>
      </ButtonGroup>
    </Box>
  );

  // Render day names
  const renderDayNames = () => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <Grid container spacing={1} mb={1}>
        {dayNames.map((day) => (
          <Grid item xs key={day} sx={{ textAlign: 'center' }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const days = getDaysInView();

    return (
      <Grid container spacing={2}>
        {days.map((day, index) => {
          const available = hasAvailability(day);
          const selected = isSelected(day);
          const today = isToday(day);
          const timeSlots = getTimeSlotsForDate(day);

          return (
            <Grid item xs={12} sm={6} md key={index}>
              <ModernCard
                component={motion.div}
                variants={getAccessibleVariants(fadeIn, prefersReducedMotion)}
                hover
                sx={{
                  cursor: 'pointer',
                  border: selected ? 2 : 1,
                  borderColor: selected ? 'primary.main' : 'divider',
                  bgcolor: today ? 'primary.50' : 'background.paper',
                }}
                onClick={() => onDateSelect && onDateSelect(day)}
              >
                <CardContent sx={{ p: 2 }}>
                  {/* Date header */}
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        {day.getDate()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </Typography>
                    </Box>
                    {available ? (
                      <CheckCircle sx={{ color: 'success.main', fontSize: 24 }} />
                    ) : (
                      <Cancel sx={{ color: 'error.main', fontSize: 24 }} />
                    )}
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  {/* Time slots */}
                  {timeSlots.length > 0 ? (
                    <Stack spacing={0.5}>
                      {timeSlots.slice(0, 3).map((slot, idx) => (
                        <Chip
                          key={idx}
                          label={`${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`}
                          size="small"
                          color={slot.isAvailable ? 'success' : 'default'}
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onTimeSlotSelect) onTimeSlotSelect(slot);
                          }}
                        />
                      ))}
                      {timeSlots.length > 3 && (
                        <Typography variant="caption" color="text.secondary" textAlign="center">
                          +{timeSlots.length - 3} more
                        </Typography>
                      )}
                    </Stack>
                  ) : (
                    <Typography variant="caption" color="text.secondary" textAlign="center">
                      No slots available
                    </Typography>
                  )}
                </CardContent>
              </ModernCard>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  // Render month view
  const renderMonthView = () => {
    const days = getDaysInView();
    const weeks = [];
    
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <Box>
        {renderDayNames()}
        {weeks.map((week, weekIndex) => (
          <Grid container spacing={1} key={weekIndex} mb={1}>
            {week.map((day, dayIndex) => {
              const available = hasAvailability(day);
              const selected = isSelected(day);
              const today = isToday(day);
              const currentMonth = isCurrentMonth(day);
              const timeSlots = getTimeSlotsForDate(day);

              return (
                <Grid item xs key={dayIndex}>
                  <Box
                    component={motion.div}
                    whileHover={{ scale: 1.05 }}
                    sx={{
                      p: 1,
                      minHeight: 80,
                      borderRadius: 2,
                      border: 1,
                      borderColor: selected ? 'primary.main' : 'divider',
                      bgcolor: today ? 'primary.50' : currentMonth ? 'background.paper' : 'grey.50',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      opacity: currentMonth ? 1 : 0.5,
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: 2,
                      },
                    }}
                    onClick={() => onDateSelect && onDateSelect(day)}
                  >
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                      <Typography
                        variant="body2"
                        fontWeight={today ? 700 : 600}
                        color={today ? 'primary.main' : 'text.primary'}
                      >
                        {day.getDate()}
                      </Typography>
                      {available && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'success.main',
                          }}
                        />
                      )}
                    </Box>
                    {timeSlots.length > 0 && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {timeSlots.length} {timeSlots.length === 1 ? 'slot' : 'slots'}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        ))}
      </Box>
    );
  };

  // Render legend
  const renderLegend = () => (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexWrap="wrap"
      gap={3}
      mt={3}
      p={2}
      borderRadius={2}
      bgcolor="grey.50"
    >
      <Box display="flex" alignItems="center" gap={1}>
        <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
        <Typography variant="caption" fontWeight={600}>
          Available
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" gap={1}>
        <Cancel sx={{ color: 'error.main', fontSize: 20 }} />
        <Typography variant="caption" fontWeight={600}>
          Unavailable
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" gap={1}>
        <Box
          sx={{
            width: 20,
            height: 20,
            borderRadius: 1,
            bgcolor: 'primary.50',
            border: 1,
            borderColor: 'primary.main',
          }}
        />
        <Typography variant="caption" fontWeight={600}>
          Today
        </Typography>
      </Box>
    </Box>
  );

  return (
    <ModernCard>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        {renderHeader()}

        {/* Calendar */}
        {viewMode === 'week' ? renderWeekView() : renderMonthView()}

        {/* Legend */}
        {renderLegend()}
      </CardContent>
    </ModernCard>
  );
});

DoctorAvailabilityCalendar.displayName = 'DoctorAvailabilityCalendar';

export default DoctorAvailabilityCalendar;

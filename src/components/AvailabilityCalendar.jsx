import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  AccessTime,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { format, addDays, startOfWeek, isToday, isBefore } from 'date-fns';
import { doctorService } from '../services/doctorService';
import { useRealTimeSync } from '../contexts/RealTimeSyncContext';
import RealTimeStatusIndicator from './RealTimeStatusIndicator';

const AvailabilityCalendar = ({ doctorId, onSlotSelect, selectedSlot, compact = false }) => {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()));
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { subscribeToDoctor, unsubscribeFromDoctor, getDoctorAvailability } = useRealTimeSync();

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  // Subscribe to real-time updates for this doctor
  useEffect(() => {
    if (doctorId) {
      subscribeToDoctor(doctorId);
      return () => unsubscribeFromDoctor(doctorId);
    }
  }, [doctorId, subscribeToDoctor, unsubscribeFromDoctor]);

  // Fetch availability for the current week
  useEffect(() => {
    const fetchWeekAvailability = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const availabilityPromises = weekDays.map(async (date) => {
          try {
            const slots = await doctorService.getDoctorAvailability(doctorId, date);
            return { date: format(date, 'yyyy-MM-dd'), slots };
          } catch (err) {
            // If no availability for a specific date, return empty slots
            return { date: format(date, 'yyyy-MM-dd'), slots: [] };
          }
        });

        const results = await Promise.all(availabilityPromises);
        const availabilityMap = {};
        
        results.forEach(({ date, slots }) => {
          availabilityMap[date] = slots;
        });
        
        setAvailability(availabilityMap);
      } catch (err) {
        setError(err.message || 'Failed to fetch availability');
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchWeekAvailability();
    }
  }, [doctorId, currentWeek]);

  // Update availability with real-time data
  useEffect(() => {
    if (doctorId) {
      const realtimeAvailability = getDoctorAvailability(doctorId);
      if (realtimeAvailability.length > 0) {
        // Merge real-time availability with existing data
        setAvailability(prevAvailability => {
          const updatedAvailability = { ...prevAvailability };
          realtimeAvailability.forEach(slot => {
            const dateKey = format(new Date(slot.dateTime), 'yyyy-MM-dd');
            if (!updatedAvailability[dateKey]) {
              updatedAvailability[dateKey] = [];
            }
            // Update or add the slot
            const existingSlotIndex = updatedAvailability[dateKey].findIndex(
              existing => existing.time === format(new Date(slot.dateTime), 'HH:mm')
            );
            
            const slotData = {
              time: format(new Date(slot.dateTime), 'HH:mm'),
              available: slot.available,
              isRealTimeUpdate: true,
            };
            
            if (existingSlotIndex >= 0) {
              updatedAvailability[dateKey][existingSlotIndex] = slotData;
            } else {
              updatedAvailability[dateKey].push(slotData);
            }
          });
          return updatedAvailability;
        });
      }
    }
  }, [doctorId, getDoctorAvailability]);

  const handlePreviousWeek = () => {
    setCurrentWeek(addDays(currentWeek, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addDays(currentWeek, 7));
  };

  const handleSlotClick = (date, slot) => {
    if (onSlotSelect && slot.available) {
      onSlotSelect({ date: format(date, 'yyyy-MM-dd'), slot });
    }
  };

  const isSlotSelected = (date, slot) => {
    if (!selectedSlot) return false;
    return (
      format(date, 'yyyy-MM-dd') === selectedSlot.date &&
      slot.time === selectedSlot.slot.time
    );
  };

  // Mock time slots for demonstration (would come from backend)
  const generateMockSlots = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const existingSlots = availability[dateStr];
    
    if (existingSlots && existingSlots.length > 0) {
      return existingSlots;
    }

    // Generate mock slots if no real data
    const isPastDate = isBefore(date, new Date()) && !isToday(date);
    if (isPastDate) return [];

    const mockSlots = [
      { time: '09:00', available: Math.random() > 0.3 },
      { time: '09:30', available: Math.random() > 0.3 },
      { time: '10:00', available: Math.random() > 0.3 },
      { time: '10:30', available: Math.random() > 0.3 },
      { time: '11:00', available: Math.random() > 0.3 },
      { time: '11:30', available: Math.random() > 0.3 },
      { time: '14:00', available: Math.random() > 0.3 },
      { time: '14:30', available: Math.random() > 0.3 },
      { time: '15:00', available: Math.random() > 0.3 },
      { time: '15:30', available: Math.random() > 0.3 },
      { time: '16:00', available: Math.random() > 0.3 },
      { time: '16:30', available: Math.random() > 0.3 },
    ];

    return mockSlots;
  };

  if (loading && Object.keys(availability).length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Week Navigation */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <IconButton onClick={handlePreviousWeek} size="small">
          <ChevronLeft />
        </IconButton>
        
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="subtitle1" fontWeight="medium">
            {format(currentWeek, 'MMM d')} - {format(addDays(currentWeek, 6), 'MMM d, yyyy')}
          </Typography>
          <RealTimeStatusIndicator variant="minimal" />
        </Box>
        
        <IconButton onClick={handleNextWeek} size="small">
          <ChevronRight />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Calendar Grid */}
      <Grid container spacing={compact ? 0.5 : 1}>
        {weekDays.map((date) => {
          const slots = generateMockSlots(date);
          const availableSlots = slots.filter(slot => slot.available);
          const isPastDate = isBefore(date, new Date()) && !isToday(date);

          return (
            <Grid item xs={12} key={format(date, 'yyyy-MM-dd')}>
              <Paper 
                sx={{ 
                  p: compact ? 1 : 2, 
                  minHeight: compact ? 'auto' : 120,
                  bgcolor: isToday(date) ? 'primary.50' : 'background.paper',
                  border: isToday(date) ? 1 : 0,
                  borderColor: 'primary.main',
                }}
              >
                {/* Date Header */}
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography 
                    variant={compact ? "body2" : "subtitle2"} 
                    fontWeight="medium"
                    color={isToday(date) ? 'primary.main' : 'text.primary'}
                  >
                    {format(date, 'EEE, MMM d')}
                    {isToday(date) && (
                      <Chip 
                        label="Today" 
                        size="small" 
                        color="primary" 
                        sx={{ ml: 1, height: 20 }} 
                      />
                    )}
                  </Typography>
                  
                  {!isPastDate && (
                    <Typography variant="caption" color="text.secondary">
                      {availableSlots.length} available
                    </Typography>
                  )}
                </Box>

                {/* Time Slots */}
                {isPastDate ? (
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Past date
                  </Typography>
                ) : slots.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    No slots available
                  </Typography>
                ) : (
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {slots.slice(0, compact ? 4 : slots.length).map((slot) => (
                      <Button
                        key={slot.time}
                        size="small"
                        variant={isSlotSelected(date, slot) ? "contained" : "outlined"}
                        color={slot.available ? "primary" : "inherit"}
                        disabled={!slot.available}
                        onClick={() => handleSlotClick(date, slot)}
                        startIcon={
                          slot.available ? (
                            isSlotSelected(date, slot) ? <CheckCircle /> : <AccessTime />
                          ) : (
                            <Cancel />
                          )
                        }
                        sx={{
                          minWidth: 'auto',
                          fontSize: '0.75rem',
                          px: 1,
                          py: 0.5,
                          opacity: slot.available ? 1 : 0.5,
                          // Highlight real-time updates
                          ...(slot.isRealTimeUpdate && {
                            animation: 'highlight 2s ease-in-out',
                            '@keyframes highlight': {
                              '0%': { backgroundColor: 'success.light', transform: 'scale(1)' },
                              '50%': { backgroundColor: 'success.main', transform: 'scale(1.05)' },
                              '100%': { backgroundColor: 'transparent', transform: 'scale(1)' },
                            },
                          }),
                        }}
                      >
                        {slot.time}
                        {slot.isRealTimeUpdate && (
                          <Chip
                            label="New"
                            size="small"
                            color="success"
                            sx={{ 
                              ml: 0.5, 
                              height: 16, 
                              fontSize: '0.6rem',
                              '& .MuiChip-label': { px: 0.5 }
                            }}
                          />
                        )}
                      </Button>
                    ))}
                    {compact && slots.length > 4 && (
                      <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', ml: 1 }}>
                        +{slots.length - 4} more
                      </Typography>
                    )}
                  </Box>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Loading Overlay */}
      {loading && (
        <Box 
          position="absolute" 
          top={0} 
          left={0} 
          right={0} 
          bottom={0} 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
          bgcolor="rgba(255, 255, 255, 0.7)"
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default AvailabilityCalendar;
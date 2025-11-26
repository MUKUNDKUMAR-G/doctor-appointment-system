import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import './DoctorAvailabilityManager.css';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

const DoctorAvailabilityManager = ({ doctorId, consultationDuration = 30 }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState('weekly'); // 'weekly' or 'calendar'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weeklySchedule, setWeeklySchedule] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  // Initialize weekly schedule
  useEffect(() => {
    const initialSchedule = {};
    DAYS_OF_WEEK.forEach(day => {
      initialSchedule[day.value] = {
        enabled: false,
        slots: []
      };
    });
    setWeeklySchedule(initialSchedule);
    fetchAvailability();
  }, [doctorId]);

  // Fetch current availability
  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/doctor-availability/doctor/${doctorId}/recurring`);
      
      // Transform API response to weekly schedule format
      const schedule = {};
      DAYS_OF_WEEK.forEach(day => {
        const dayAvailability = response.data.filter(a => {
          // Handle both dayOfWeek as number and as string enum
          const dayValue = typeof a.dayOfWeek === 'string' 
            ? DAYS_OF_WEEK.findIndex(d => d.label.toUpperCase() === a.dayOfWeek.toUpperCase())
            : a.dayOfWeek;
          return dayValue === day.value;
        });
        schedule[day.value] = {
          enabled: dayAvailability.length > 0,
          slots: dayAvailability.map(a => ({
            id: a.id,
            startTime: a.startTime,
            endTime: a.endTime
          }))
        };
      });
      
      setWeeklySchedule(schedule);
    } catch (error) {
      console.error('Fetch availability error:', error);
      // Initialize empty schedule on error
      const emptySchedule = {};
      DAYS_OF_WEEK.forEach(day => {
        emptySchedule[day.value] = {
          enabled: false,
          slots: []
        };
      });
      setWeeklySchedule(emptySchedule);
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  // Toggle day enabled/disabled
  const toggleDay = (dayValue) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [dayValue]: {
        ...prev[dayValue],
        enabled: !prev[dayValue].enabled,
        slots: !prev[dayValue].enabled && prev[dayValue].slots.length === 0
          ? [{ startTime: '09:00', endTime: '17:00' }]
          : prev[dayValue].slots
      }
    }));
    setIsDirty(true);
  };

  // Add time slot to a day
  const addTimeSlot = (dayValue) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [dayValue]: {
        ...prev[dayValue],
        slots: [
          ...prev[dayValue].slots,
          { startTime: '09:00', endTime: '17:00' }
        ]
      }
    }));
    setIsDirty(true);
  };

  // Remove time slot from a day
  const removeTimeSlot = (dayValue, slotIndex) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [dayValue]: {
        ...prev[dayValue],
        slots: prev[dayValue].slots.filter((_, index) => index !== slotIndex)
      }
    }));
    setIsDirty(true);
  };

  // Update time slot
  const updateTimeSlot = (dayValue, slotIndex, field, value) => {
    setWeeklySchedule(prev => {
      const newSlots = [...prev[dayValue].slots];
      newSlots[slotIndex] = {
        ...newSlots[slotIndex],
        [field]: value
      };
      return {
        ...prev,
        [dayValue]: {
          ...prev[dayValue],
          slots: newSlots
        }
      };
    });
    setIsDirty(true);
  };

  // Apply schedule to multiple days
  const applyToMultipleDays = (sourceDayValue, targetDays) => {
    const sourceSchedule = weeklySchedule[sourceDayValue];
    
    setWeeklySchedule(prev => {
      const newSchedule = { ...prev };
      targetDays.forEach(dayValue => {
        newSchedule[dayValue] = {
          enabled: sourceSchedule.enabled,
          slots: sourceSchedule.slots.map(slot => ({ ...slot }))
        };
      });
      return newSchedule;
    });
    setIsDirty(true);
    toast.success(`Schedule applied to ${targetDays.length} day(s)`);
  };

  // Copy schedule from one day
  const [copySource, setCopySource] = useState(null);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [selectedTargetDays, setSelectedTargetDays] = useState([]);

  const handleCopySchedule = (dayValue) => {
    setCopySource(dayValue);
    setSelectedTargetDays([]);
    setShowCopyDialog(true);
  };

  const handleApplyCopy = () => {
    if (copySource !== null && selectedTargetDays.length > 0) {
      applyToMultipleDays(copySource, selectedTargetDays);
      setShowCopyDialog(false);
      setCopySource(null);
      setSelectedTargetDays([]);
    }
  };

  // Toggle target day selection
  const toggleTargetDay = (dayValue) => {
    setSelectedTargetDays(prev =>
      prev.includes(dayValue)
        ? prev.filter(d => d !== dayValue)
        : [...prev, dayValue]
    );
  };

  // Clear all availability
  const handleClearAll = () => {
    if (!window.confirm('Are you sure you want to clear all availability? This cannot be undone.')) {
      return;
    }

    const clearedSchedule = {};
    DAYS_OF_WEEK.forEach(day => {
      clearedSchedule[day.value] = {
        enabled: false,
        slots: []
      };
    });
    setWeeklySchedule(clearedSchedule);
    setIsDirty(true);
  };

  // Set standard business hours (Mon-Fri, 9-5)
  const handleSetStandardHours = () => {
    const standardSchedule = { ...weeklySchedule };
    [1, 2, 3, 4, 5].forEach(dayValue => {
      standardSchedule[dayValue] = {
        enabled: true,
        slots: [{ startTime: '09:00', endTime: '17:00' }]
      };
    });
    [0, 6].forEach(dayValue => {
      standardSchedule[dayValue] = {
        enabled: false,
        slots: []
      };
    });
    setWeeklySchedule(standardSchedule);
    setIsDirty(true);
    toast.success('Standard business hours applied');
  };

  // Validate schedule
  const validateSchedule = () => {
    for (const dayValue in weeklySchedule) {
      const day = weeklySchedule[dayValue];
      if (day.enabled) {
        if (day.slots.length === 0) {
          return { valid: false, message: `${DAYS_OF_WEEK[dayValue].label} is enabled but has no time slots` };
        }

        for (let i = 0; i < day.slots.length; i++) {
          const slot = day.slots[i];
          
          // Check if start time is before end time
          if (slot.startTime >= slot.endTime) {
            return { valid: false, message: `Invalid time slot on ${DAYS_OF_WEEK[dayValue].label}: start time must be before end time` };
          }

          // Check for overlapping slots
          for (let j = i + 1; j < day.slots.length; j++) {
            const otherSlot = day.slots[j];
            if (
              (slot.startTime < otherSlot.endTime && slot.endTime > otherSlot.startTime) ||
              (otherSlot.startTime < slot.endTime && otherSlot.endTime > slot.startTime)
            ) {
              return { valid: false, message: `Overlapping time slots on ${DAYS_OF_WEEK[dayValue].label}` };
            }
          }
        }
      }
    }
    return { valid: true };
  };

  // Save availability
  const handleSave = async () => {
    // Validate
    const validation = validateSchedule();
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    try {
      setSaving(true);

      // First, delete all existing recurring availability
      const existingResponse = await api.get(`/doctor-availability/doctor/${doctorId}/recurring`);
      const existingAvailability = existingResponse.data || [];
      
      for (const existing of existingAvailability) {
        try {
          await api.delete(`/doctor-availability/${existing.id}`);
        } catch (err) {
          console.warn('Failed to delete existing availability:', err);
        }
      }

      // Transform schedule to API format and create new availability
      const daysOfWeek = [];
      for (const dayValue in weeklySchedule) {
        const day = weeklySchedule[dayValue];
        if (day.enabled && day.slots.length > 0) {
          daysOfWeek.push(parseInt(dayValue));
        }
      }

      // Create availability for each enabled day
      for (const dayValue in weeklySchedule) {
        const day = weeklySchedule[dayValue];
        if (day.enabled) {
          for (const slot of day.slots) {
            try {
              // Map day value to DayOfWeek enum
              const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
              const dayOfWeek = dayNames[parseInt(dayValue)];
              
              await api.post('/doctor-availability/recurring', null, {
                params: {
                  doctorId: doctorId,
                  dayOfWeek: dayOfWeek,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                  slotDurationMinutes: consultationDuration
                }
              });
            } catch (err) {
              console.error('Failed to create availability slot:', err);
              throw err;
            }
          }
        }
      }

      toast.success('Availability updated successfully');
      setIsDirty(false);
      await fetchAvailability(); // Refresh to get IDs
    } catch (error) {
      console.error('Save availability error:', error);
      toast.error(error.response?.data?.message || 'Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  // Generate time options for dropdowns
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        options.push({ value: timeString, label: displayTime });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  if (loading) {
    return (
      <div className="doctor-availability-manager loading">
        <div className="loading-spinner">Loading availability...</div>
      </div>
    );
  }

  return (
    <div className="doctor-availability-manager">
      <div className="availability-header">
        <div>
          <h3>Manage Availability</h3>
          <p className="availability-hint">
            Set your weekly schedule. Time slots will be generated based on your {consultationDuration}-minute consultation duration.
          </p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={handleSetStandardHours}
          >
            Standard Hours
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleClearAll}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Weekly Schedule View */}
      <div className="weekly-schedule">
        {DAYS_OF_WEEK.map(day => {
          const daySchedule = weeklySchedule[day.value] || { enabled: false, slots: [] };
          
          return (
            <div key={day.value} className={`day-schedule ${daySchedule.enabled ? 'enabled' : 'disabled'}`}>
              <div className="day-header">
                <div className="day-info">
                  <label className="day-toggle">
                    <input
                      type="checkbox"
                      checked={daySchedule.enabled}
                      onChange={() => toggleDay(day.value)}
                    />
                    <span className="day-name">{day.label}</span>
                  </label>
                </div>
                {daySchedule.enabled && (
                  <button
                    className="btn-icon"
                    onClick={() => handleCopySchedule(day.value)}
                    title="Copy to other days"
                  >
                    📋
                  </button>
                )}
              </div>

              {daySchedule.enabled && (
                <div className="time-slots">
                  {daySchedule.slots.map((slot, index) => (
                    <div key={index} className="time-slot">
                      <select
                        value={slot.startTime}
                        onChange={(e) => updateTimeSlot(day.value, index, 'startTime', e.target.value)}
                        className="time-select"
                      >
                        {timeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <span className="time-separator">to</span>
                      <select
                        value={slot.endTime}
                        onChange={(e) => updateTimeSlot(day.value, index, 'endTime', e.target.value)}
                        className="time-select"
                      >
                        {timeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <button
                        className="btn-icon btn-remove"
                        onClick={() => removeTimeSlot(day.value, index)}
                        title="Remove time slot"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    className="btn btn-secondary btn-sm btn-add-slot"
                    onClick={() => addTimeSlot(day.value)}
                  >
                    + Add Time Slot
                  </button>
                </div>
              )}

              {!daySchedule.enabled && (
                <div className="unavailable-message">
                  Unavailable
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Copy Dialog */}
      {showCopyDialog && (
        <div className="modal-overlay" onClick={() => setShowCopyDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Copy Schedule</h4>
            <p>
              Copy {DAYS_OF_WEEK[copySource].label}'s schedule to:
            </p>
            <div className="target-days">
              {DAYS_OF_WEEK.filter(d => d.value !== copySource).map(day => (
                <label key={day.value} className="target-day-option">
                  <input
                    type="checkbox"
                    checked={selectedTargetDays.includes(day.value)}
                    onChange={() => toggleTargetDay(day.value)}
                  />
                  <span>{day.label}</span>
                </label>
              ))}
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowCopyDialog(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleApplyCopy}
                disabled={selectedTargetDays.length === 0}
              >
                Apply to {selectedTargetDays.length} day(s)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Actions */}
      <div className="availability-actions">
        <div className="dirty-indicator">
          {isDirty && <span className="unsaved-changes">You have unsaved changes</span>}
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={handleSave}
          disabled={saving || !isDirty}
        >
          {saving ? 'Saving...' : 'Save Availability'}
        </button>
      </div>
    </div>
  );
};

export default DoctorAvailabilityManager;

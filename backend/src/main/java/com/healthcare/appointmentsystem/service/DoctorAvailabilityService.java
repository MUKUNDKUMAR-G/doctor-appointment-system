package com.healthcare.appointmentsystem.service;

import com.healthcare.appointmentsystem.dto.CalendarDayResponse;
import com.healthcare.appointmentsystem.dto.TimeSlotResponse;
import com.healthcare.appointmentsystem.entity.Appointment;
import com.healthcare.appointmentsystem.entity.AppointmentStatus;
import com.healthcare.appointmentsystem.entity.Doctor;
import com.healthcare.appointmentsystem.entity.DoctorAvailability;
import com.healthcare.appointmentsystem.repository.AppointmentRepository;
import com.healthcare.appointmentsystem.repository.DoctorAvailabilityRepository;
import com.healthcare.appointmentsystem.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class DoctorAvailabilityService {
    
    @Autowired
    private DoctorAvailabilityRepository availabilityRepository;
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    /**
     * Create recurring availability for a doctor (weekly pattern)
     */
    public DoctorAvailability createRecurringAvailability(Long doctorId, DayOfWeek dayOfWeek, 
                                                         LocalTime startTime, LocalTime endTime, 
                                                         Integer slotDurationMinutes) {
        Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
        if (doctorOpt.isEmpty()) {
            throw new IllegalArgumentException("Doctor not found with ID: " + doctorId);
        }
        
        Doctor doctor = doctorOpt.get();
        
        // Check for overlapping availability
        List<DoctorAvailability> overlapping = availabilityRepository
                .findOverlappingAvailability(doctorId, dayOfWeek, null, startTime, endTime);
        
        if (!overlapping.isEmpty()) {
            throw new IllegalStateException("Overlapping availability already exists for this time slot");
        }
        
        DoctorAvailability availability = new DoctorAvailability(doctor, dayOfWeek, startTime, endTime);
        availability.setSlotDurationMinutes(slotDurationMinutes != null ? slotDurationMinutes : 30);
        
        return availabilityRepository.save(availability);
    }
    
    /**
     * Create specific date availability for a doctor
     */
    public DoctorAvailability createSpecificDateAvailability(Long doctorId, LocalDateTime availableDate, 
                                                           LocalTime startTime, LocalTime endTime, 
                                                           Integer slotDurationMinutes) {
        Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
        if (doctorOpt.isEmpty()) {
            throw new IllegalArgumentException("Doctor not found with ID: " + doctorId);
        }
        
        Doctor doctor = doctorOpt.get();
        
        // Check for overlapping availability on the same date
        List<DoctorAvailability> overlapping = availabilityRepository
                .findOverlappingAvailability(doctorId, availableDate.getDayOfWeek(), 
                                           availableDate, startTime, endTime);
        
        if (!overlapping.isEmpty()) {
            throw new IllegalStateException("Overlapping availability already exists for this time slot");
        }
        
        DoctorAvailability availability = new DoctorAvailability(doctor, availableDate, startTime, endTime);
        availability.setSlotDurationMinutes(slotDurationMinutes != null ? slotDurationMinutes : 30);
        
        return availabilityRepository.save(availability);
    }
    
    /**
     * Update availability
     */
    public DoctorAvailability updateAvailability(Long availabilityId, LocalTime startTime, 
                                               LocalTime endTime, Boolean isAvailable, 
                                               Integer slotDurationMinutes) {
        Optional<DoctorAvailability> availabilityOpt = availabilityRepository.findById(availabilityId);
        if (availabilityOpt.isEmpty()) {
            throw new IllegalArgumentException("Availability not found with ID: " + availabilityId);
        }
        
        DoctorAvailability availability = availabilityOpt.get();
        
        if (startTime != null) {
            availability.setStartTime(startTime);
        }
        if (endTime != null) {
            availability.setEndTime(endTime);
        }
        if (isAvailable != null) {
            availability.setIsAvailable(isAvailable);
        }
        if (slotDurationMinutes != null) {
            availability.setSlotDurationMinutes(slotDurationMinutes);
        }
        
        return availabilityRepository.save(availability);
    }
    
    /**
     * Delete availability
     */
    public void deleteAvailability(Long availabilityId) {
        if (!availabilityRepository.existsById(availabilityId)) {
            throw new IllegalArgumentException("Availability not found with ID: " + availabilityId);
        }
        availabilityRepository.deleteById(availabilityId);
    }
    
    /**
     * Get all availability for a doctor
     */
    @Transactional(readOnly = true)
    public List<DoctorAvailability> getDoctorAvailability(Long doctorId) {
        return availabilityRepository.findByDoctorId(doctorId);
    }
    
    /**
     * Get recurring availability for a doctor
     */
    @Transactional(readOnly = true)
    public List<DoctorAvailability> getDoctorRecurringAvailability(Long doctorId) {
        return availabilityRepository.findByDoctorIdAndDayOfWeekIsNotNullAndIsAvailableTrue(doctorId);
    }
    
    /**
     * Get specific date availability for a doctor
     */
    @Transactional(readOnly = true)
    public List<DoctorAvailability> getDoctorSpecificDateAvailability(Long doctorId) {
        return availabilityRepository.findByDoctorIdAndAvailableDateIsNotNullAndIsAvailableTrue(doctorId);
    }
    
    /**
     * Get availability for a specific date
     */
    @Transactional(readOnly = true)
    public List<DoctorAvailability> getAvailabilityForDate(Long doctorId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);
        
        // First check for specific date availability
        List<DoctorAvailability> specificAvailability = availabilityRepository
                .findByDoctorIdAndAvailableDateAndIsAvailableTrue(doctorId, startOfDay);
        
        if (!specificAvailability.isEmpty()) {
            return specificAvailability;
        }
        
        // If no specific date availability, check recurring availability
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        return availabilityRepository
                .findByDoctorIdAndDayOfWeekAndIsAvailableTrue(doctorId, dayOfWeek);
    }
    
    /**
     * Generate available time slots for a specific date
     */
    @Transactional(readOnly = true)
    public List<TimeSlotResponse> generateAvailableSlots(Long doctorId, LocalDate date) {
        List<DoctorAvailability> availabilities = getAvailabilityForDate(doctorId, date);
        
        if (availabilities.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Get existing appointments for the date
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);
        
        List<Appointment> appointments = appointmentRepository
                .findByDoctorIdAndAppointmentDateTimeBetween(doctorId, startOfDay, endOfDay)
                .stream()
                .filter(apt -> apt.getStatus() == AppointmentStatus.SCHEDULED)
                .collect(Collectors.toList());
        
        List<TimeSlotResponse> allSlots = new ArrayList<>();
        
        for (DoctorAvailability availability : availabilities) {
            List<TimeSlotResponse> slots = generateSlotsFromAvailability(availability, date, appointments);
            allSlots.addAll(slots);
        }
        
        // Sort by start time and remove duplicates
        return allSlots.stream()
                .sorted((slot1, slot2) -> slot1.getStartTime().compareTo(slot2.getStartTime()))
                .distinct()
                .collect(Collectors.toList());
    }
    
    /**
     * Generate calendar view for a date range
     */
    @Transactional(readOnly = true)
    public List<CalendarDayResponse> generateCalendarView(Long doctorId, LocalDate startDate, LocalDate endDate) {
        List<CalendarDayResponse> calendarDays = new ArrayList<>();
        
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            List<TimeSlotResponse> slots = generateAvailableSlots(doctorId, currentDate);
            
            long availableSlots = slots.stream()
                    .filter(TimeSlotResponse::getIsAvailable)
                    .count();
            
            long bookedSlots = slots.stream()
                    .filter(TimeSlotResponse::getIsBooked)
                    .count();
            
            CalendarDayResponse dayResponse = new CalendarDayResponse(
                    currentDate,
                    availableSlots > 0,
                    (int) availableSlots,
                    (int) bookedSlots,
                    slots
            );
            
            calendarDays.add(dayResponse);
            currentDate = currentDate.plusDays(1);
        }
        
        return calendarDays;
    }
    
    /**
     * Check if a specific time slot is available
     */
    @Transactional(readOnly = true)
    public boolean isTimeSlotAvailable(Long doctorId, LocalDateTime appointmentDateTime) {
        LocalDate date = appointmentDateTime.toLocalDate();
        LocalTime time = appointmentDateTime.toLocalTime();
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        
        // Check if there's availability at this time
        boolean hasAvailability = availabilityRepository
                .isDoctorAvailableAtTime(doctorId, dayOfWeek, appointmentDateTime, time);
        
        if (!hasAvailability) {
            return false;
        }
        
        // Check if there's already an appointment at this time
        List<Appointment> conflictingAppointments = appointmentRepository
                .findByDoctorIdAndAppointmentDateTime(doctorId, appointmentDateTime);
        
        return conflictingAppointments.stream()
                .noneMatch(apt -> apt.getStatus() == AppointmentStatus.SCHEDULED);
    }
    
    /**
     * Temporarily block a time slot (for reservation)
     */
    public void blockTimeSlot(Long doctorId, LocalDateTime appointmentDateTime, int durationMinutes) {
        // This would typically involve creating a temporary reservation
        // For now, we'll just check if the slot is available
        if (!isTimeSlotAvailable(doctorId, appointmentDateTime)) {
            throw new IllegalStateException("Time slot is not available for blocking");
        }
        
        // In a real implementation, you might create a temporary reservation record
        // that expires after a certain time (e.g., 10 minutes)
    }
    
    /**
     * Release a temporarily blocked time slot
     */
    public void releaseTimeSlot(Long doctorId, LocalDateTime appointmentDateTime) {
        // This would remove the temporary reservation
        // Implementation depends on how temporary reservations are stored
    }
    
    /**
     * Bulk create recurring availability for multiple days
     */
    public List<DoctorAvailability> bulkCreateRecurringAvailability(Long doctorId, 
                                                                    List<DayOfWeek> daysOfWeek,
                                                                    LocalTime startTime, 
                                                                    LocalTime endTime,
                                                                    Integer slotDurationMinutes) {
        Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
        if (doctorOpt.isEmpty()) {
            throw new IllegalArgumentException("Doctor not found with ID: " + doctorId);
        }
        
        Doctor doctor = doctorOpt.get();
        List<DoctorAvailability> createdAvailabilities = new ArrayList<>();
        
        for (DayOfWeek dayOfWeek : daysOfWeek) {
            // Check for overlapping availability
            List<DoctorAvailability> overlapping = availabilityRepository
                    .findOverlappingAvailability(doctorId, dayOfWeek, null, startTime, endTime);
            
            if (overlapping.isEmpty()) {
                DoctorAvailability availability = new DoctorAvailability(doctor, dayOfWeek, startTime, endTime);
                availability.setSlotDurationMinutes(slotDurationMinutes != null ? slotDurationMinutes : 30);
                createdAvailabilities.add(availabilityRepository.save(availability));
            }
        }
        
        return createdAvailabilities;
    }
    
    /**
     * Bulk create specific date availability for a date range
     */
    public List<DoctorAvailability> bulkCreateSpecificDateAvailability(Long doctorId,
                                                                       LocalDate startDate,
                                                                       LocalDate endDate,
                                                                       LocalTime startTime,
                                                                       LocalTime endTime,
                                                                       Integer slotDurationMinutes) {
        Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
        if (doctorOpt.isEmpty()) {
            throw new IllegalArgumentException("Doctor not found with ID: " + doctorId);
        }
        
        Doctor doctor = doctorOpt.get();
        List<DoctorAvailability> createdAvailabilities = new ArrayList<>();
        
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            LocalDateTime availableDate = currentDate.atStartOfDay();
            
            // Check for overlapping availability
            List<DoctorAvailability> overlapping = availabilityRepository
                    .findOverlappingAvailability(doctorId, currentDate.getDayOfWeek(), 
                                               availableDate, startTime, endTime);
            
            if (overlapping.isEmpty()) {
                DoctorAvailability availability = new DoctorAvailability(doctor, availableDate, startTime, endTime);
                availability.setSlotDurationMinutes(slotDurationMinutes != null ? slotDurationMinutes : 30);
                createdAvailabilities.add(availabilityRepository.save(availability));
            }
            
            currentDate = currentDate.plusDays(1);
        }
        
        return createdAvailabilities;
    }
    
    /**
     * Bulk update availability for multiple slots
     */
    public List<DoctorAvailability> bulkUpdateAvailability(List<Long> availabilityIds,
                                                          LocalTime startTime,
                                                          LocalTime endTime,
                                                          Boolean isAvailable,
                                                          Integer slotDurationMinutes) {
        List<DoctorAvailability> updatedAvailabilities = new ArrayList<>();
        
        for (Long availabilityId : availabilityIds) {
            Optional<DoctorAvailability> availabilityOpt = availabilityRepository.findById(availabilityId);
            if (availabilityOpt.isPresent()) {
                DoctorAvailability availability = availabilityOpt.get();
                
                if (startTime != null) {
                    availability.setStartTime(startTime);
                }
                if (endTime != null) {
                    availability.setEndTime(endTime);
                }
                if (isAvailable != null) {
                    availability.setIsAvailable(isAvailable);
                }
                if (slotDurationMinutes != null) {
                    availability.setSlotDurationMinutes(slotDurationMinutes);
                }
                
                updatedAvailabilities.add(availabilityRepository.save(availability));
            }
        }
        
        return updatedAvailabilities;
    }
    
    /**
     * Bulk delete availability slots
     */
    public void bulkDeleteAvailability(List<Long> availabilityIds) {
        for (Long availabilityId : availabilityIds) {
            if (availabilityRepository.existsById(availabilityId)) {
                availabilityRepository.deleteById(availabilityId);
            }
        }
    }
    
    /**
     * Create exception date (override recurring availability for specific date)
     */
    public DoctorAvailability createExceptionDate(Long doctorId,
                                                 LocalDate exceptionDate,
                                                 LocalTime startTime,
                                                 LocalTime endTime,
                                                 Boolean isAvailable,
                                                 Integer slotDurationMinutes) {
        Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
        if (doctorOpt.isEmpty()) {
            throw new IllegalArgumentException("Doctor not found with ID: " + doctorId);
        }
        
        Doctor doctor = doctorOpt.get();
        LocalDateTime exceptionDateTime = exceptionDate.atStartOfDay();
        
        // Check if exception already exists for this date
        List<DoctorAvailability> existing = availabilityRepository
                .findByDoctorIdAndAvailableDateAndIsAvailableTrue(doctorId, exceptionDateTime);
        
        if (!existing.isEmpty()) {
            throw new IllegalStateException("Exception date already exists for: " + exceptionDate);
        }
        
        DoctorAvailability exception = new DoctorAvailability(doctor, exceptionDateTime, startTime, endTime);
        exception.setIsAvailable(isAvailable != null ? isAvailable : false);
        exception.setSlotDurationMinutes(slotDurationMinutes != null ? slotDurationMinutes : 30);
        
        return availabilityRepository.save(exception);
    }
    
    /**
     * Mark date as unavailable (exception date with no availability)
     */
    public DoctorAvailability markDateUnavailable(Long doctorId, LocalDate unavailableDate) {
        return createExceptionDate(doctorId, unavailableDate, 
                                  LocalTime.of(0, 0), LocalTime.of(23, 59), 
                                  false, 30);
    }
    
    /**
     * Detect availability conflicts for a given time range
     */
    public List<DoctorAvailability> detectConflicts(Long doctorId,
                                                    DayOfWeek dayOfWeek,
                                                    LocalDateTime specificDate,
                                                    LocalTime startTime,
                                                    LocalTime endTime) {
        return availabilityRepository.findOverlappingAvailability(
                doctorId, dayOfWeek, specificDate, startTime, endTime);
    }
    
    /**
     * Check if creating new availability would cause conflicts
     */
    public boolean hasConflicts(Long doctorId,
                               DayOfWeek dayOfWeek,
                               LocalDateTime specificDate,
                               LocalTime startTime,
                               LocalTime endTime) {
        List<DoctorAvailability> conflicts = detectConflicts(
                doctorId, dayOfWeek, specificDate, startTime, endTime);
        return !conflicts.isEmpty();
    }
    
    /**
     * Get all exception dates for a doctor
     */
    @Transactional(readOnly = true)
    public List<DoctorAvailability> getExceptionDates(Long doctorId) {
        return availabilityRepository.findByDoctorIdAndAvailableDateIsNotNullAndIsAvailableTrue(doctorId);
    }
    
    /**
     * Get unavailable exception dates (blocked dates)
     */
    @Transactional(readOnly = true)
    public List<DoctorAvailability> getUnavailableDates(Long doctorId) {
        List<DoctorAvailability> allExceptions = availabilityRepository
                .findByDoctorId(doctorId)
                .stream()
                .filter(av -> av.getAvailableDate() != null && !av.getIsAvailable())
                .collect(Collectors.toList());
        return allExceptions;
    }
    
    /**
     * Delete exception date
     */
    public void deleteExceptionDate(Long doctorId, LocalDate exceptionDate) {
        LocalDateTime exceptionDateTime = exceptionDate.atStartOfDay();
        availabilityRepository.deleteByDoctorIdAndAvailableDate(doctorId, exceptionDateTime);
    }
    
    /**
     * Copy availability from one day to another
     */
    public List<DoctorAvailability> copyAvailability(Long doctorId,
                                                     DayOfWeek sourceDayOfWeek,
                                                     List<DayOfWeek> targetDaysOfWeek) {
        // Get source availability
        List<DoctorAvailability> sourceAvailabilities = availabilityRepository
                .findByDoctorIdAndDayOfWeekAndIsAvailableTrue(doctorId, sourceDayOfWeek);
        
        if (sourceAvailabilities.isEmpty()) {
            throw new IllegalArgumentException("No availability found for source day: " + sourceDayOfWeek);
        }
        
        Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
        if (doctorOpt.isEmpty()) {
            throw new IllegalArgumentException("Doctor not found with ID: " + doctorId);
        }
        
        Doctor doctor = doctorOpt.get();
        List<DoctorAvailability> copiedAvailabilities = new ArrayList<>();
        
        for (DayOfWeek targetDay : targetDaysOfWeek) {
            for (DoctorAvailability source : sourceAvailabilities) {
                // Check for conflicts
                List<DoctorAvailability> conflicts = availabilityRepository
                        .findOverlappingAvailability(doctorId, targetDay, null, 
                                                    source.getStartTime(), source.getEndTime());
                
                if (conflicts.isEmpty()) {
                    DoctorAvailability copy = new DoctorAvailability(
                            doctor, targetDay, source.getStartTime(), source.getEndTime());
                    copy.setSlotDurationMinutes(source.getSlotDurationMinutes());
                    copy.setIsAvailable(source.getIsAvailable());
                    copiedAvailabilities.add(availabilityRepository.save(copy));
                }
            }
        }
        
        return copiedAvailabilities;
    }
    
    /**
     * Get availability summary for a doctor
     */
    @Transactional(readOnly = true)
    public AvailabilitySummary getAvailabilitySummary(Long doctorId) {
        List<DoctorAvailability> recurringAvailability = getDoctorRecurringAvailability(doctorId);
        List<DoctorAvailability> exceptionDates = getExceptionDates(doctorId);
        List<DoctorAvailability> unavailableDates = getUnavailableDates(doctorId);
        
        return new AvailabilitySummary(
                recurringAvailability.size(),
                exceptionDates.size(),
                unavailableDates.size(),
                recurringAvailability,
                exceptionDates,
                unavailableDates
        );
    }
    
    /**
     * Inner class for availability summary
     */
    public static class AvailabilitySummary {
        private final int recurringCount;
        private final int exceptionCount;
        private final int unavailableCount;
        private final List<DoctorAvailability> recurringAvailability;
        private final List<DoctorAvailability> exceptionDates;
        private final List<DoctorAvailability> unavailableDates;
        
        public AvailabilitySummary(int recurringCount, int exceptionCount, int unavailableCount,
                                  List<DoctorAvailability> recurringAvailability,
                                  List<DoctorAvailability> exceptionDates,
                                  List<DoctorAvailability> unavailableDates) {
            this.recurringCount = recurringCount;
            this.exceptionCount = exceptionCount;
            this.unavailableCount = unavailableCount;
            this.recurringAvailability = recurringAvailability;
            this.exceptionDates = exceptionDates;
            this.unavailableDates = unavailableDates;
        }
        
        public int getRecurringCount() { return recurringCount; }
        public int getExceptionCount() { return exceptionCount; }
        public int getUnavailableCount() { return unavailableCount; }
        public List<DoctorAvailability> getRecurringAvailability() { return recurringAvailability; }
        public List<DoctorAvailability> getExceptionDates() { return exceptionDates; }
        public List<DoctorAvailability> getUnavailableDates() { return unavailableDates; }
    }
    
    /**
     * Generate time slots from availability
     */
    private List<TimeSlotResponse> generateSlotsFromAvailability(DoctorAvailability availability, 
                                                               LocalDate date, 
                                                               List<Appointment> appointments) {
        List<TimeSlotResponse> slots = new ArrayList<>();
        
        LocalTime currentTime = availability.getStartTime();
        LocalTime endTime = availability.getEndTime();
        Integer slotDuration = availability.getSlotDurationMinutes();
        
        while (currentTime.isBefore(endTime)) {
            LocalTime slotEndTime = currentTime.plusMinutes(slotDuration);
            
            // Don't create slot if it would exceed the availability end time
            if (slotEndTime.isAfter(endTime)) {
                break;
            }
            
            LocalDateTime slotDateTime = date.atTime(currentTime);
            
            // Check if this slot is booked
            boolean isBooked = appointments.stream()
                    .anyMatch(apt -> apt.getAppointmentDateTime().equals(slotDateTime));
            
            TimeSlotResponse slot = new TimeSlotResponse(
                    slotDateTime,
                    currentTime,
                    slotEndTime,
                    slotDuration,
                    availability.getIsAvailable() && !isBooked,
                    isBooked
            );
            
            slots.add(slot);
            currentTime = slotEndTime;
        }
        
        return slots;
    }
    

}
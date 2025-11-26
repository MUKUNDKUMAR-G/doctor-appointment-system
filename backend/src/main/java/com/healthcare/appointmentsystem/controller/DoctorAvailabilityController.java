package com.healthcare.appointmentsystem.controller;

import com.healthcare.appointmentsystem.dto.AvailabilityConflictResponse;
import com.healthcare.appointmentsystem.dto.AvailabilitySummaryResponse;
import com.healthcare.appointmentsystem.dto.BulkAvailabilityRequest;
import com.healthcare.appointmentsystem.dto.CalendarDayResponse;
import com.healthcare.appointmentsystem.dto.TimeSlotResponse;
import com.healthcare.appointmentsystem.entity.DoctorAvailability;
import com.healthcare.appointmentsystem.service.DoctorAvailabilityService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/doctor-availability")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DoctorAvailabilityController {
    
    @Autowired
    private DoctorAvailabilityService availabilityService;
    
    /**
     * Create recurring availability (weekly pattern)
     */
    @PostMapping("/recurring")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<DoctorAvailability> createRecurringAvailability(
            @RequestParam Long doctorId,
            @RequestParam DayOfWeek dayOfWeek,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime,
            @RequestParam(defaultValue = "30") Integer slotDurationMinutes) {
        
        try {
            DoctorAvailability availability = availabilityService.createRecurringAvailability(
                    doctorId, dayOfWeek, startTime, endTime, slotDurationMinutes);
            return ResponseEntity.status(HttpStatus.CREATED).body(availability);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }
    
    /**
     * Create specific date availability
     */
    @PostMapping("/specific-date")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<DoctorAvailability> createSpecificDateAvailability(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime availableDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime,
            @RequestParam(defaultValue = "30") Integer slotDurationMinutes) {
        
        try {
            DoctorAvailability availability = availabilityService.createSpecificDateAvailability(
                    doctorId, availableDate, startTime, endTime, slotDurationMinutes);
            return ResponseEntity.status(HttpStatus.CREATED).body(availability);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }
    
    /**
     * Update availability
     */
    @PutMapping("/{availabilityId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<DoctorAvailability> updateAvailability(
            @PathVariable Long availabilityId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime,
            @RequestParam(required = false) Boolean isAvailable,
            @RequestParam(required = false) Integer slotDurationMinutes) {
        
        try {
            DoctorAvailability availability = availabilityService.updateAvailability(
                    availabilityId, startTime, endTime, isAvailable, slotDurationMinutes);
            return ResponseEntity.ok(availability);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Delete availability
     */
    @DeleteMapping("/{availabilityId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAvailability(@PathVariable Long availabilityId) {
        try {
            availabilityService.deleteAvailability(availabilityId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get all availability for a doctor
     */
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<DoctorAvailability>> getDoctorAvailability(@PathVariable Long doctorId) {
        List<DoctorAvailability> availability = availabilityService.getDoctorAvailability(doctorId);
        return ResponseEntity.ok(availability);
    }
    
    /**
     * Get recurring availability for a doctor
     */
    @GetMapping("/doctor/{doctorId}/recurring")
    public ResponseEntity<List<DoctorAvailability>> getDoctorRecurringAvailability(@PathVariable Long doctorId) {
        List<DoctorAvailability> availability = availabilityService.getDoctorRecurringAvailability(doctorId);
        return ResponseEntity.ok(availability);
    }
    
    /**
     * Get specific date availability for a doctor
     */
    @GetMapping("/doctor/{doctorId}/specific-dates")
    public ResponseEntity<List<DoctorAvailability>> getDoctorSpecificDateAvailability(@PathVariable Long doctorId) {
        List<DoctorAvailability> availability = availabilityService.getDoctorSpecificDateAvailability(doctorId);
        return ResponseEntity.ok(availability);
    }
    
    /**
     * Get availability for a specific date
     */
    @GetMapping("/doctor/{doctorId}/date/{date}")
    public ResponseEntity<List<DoctorAvailability>> getAvailabilityForDate(
            @PathVariable Long doctorId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        List<DoctorAvailability> availability = availabilityService.getAvailabilityForDate(doctorId, date);
        return ResponseEntity.ok(availability);
    }
    
    /**
     * Generate available time slots for a specific date
     */
    @GetMapping("/doctor/{doctorId}/slots/{date}")
    public ResponseEntity<List<TimeSlotResponse>> generateAvailableSlots(
            @PathVariable Long doctorId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        List<TimeSlotResponse> slots = availabilityService.generateAvailableSlots(doctorId, date);
        return ResponseEntity.ok(slots);
    }
    
    /**
     * Generate calendar view for a date range
     */
    @GetMapping("/doctor/{doctorId}/calendar")
    public ResponseEntity<List<CalendarDayResponse>> generateCalendarView(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<CalendarDayResponse> calendar = 
                availabilityService.generateCalendarView(doctorId, startDate, endDate);
        return ResponseEntity.ok(calendar);
    }
    
    /**
     * Check if a specific time slot is available
     */
    @GetMapping("/doctor/{doctorId}/check-availability")
    public ResponseEntity<Boolean> isTimeSlotAvailable(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime appointmentDateTime) {
        
        boolean isAvailable = availabilityService.isTimeSlotAvailable(doctorId, appointmentDateTime);
        return ResponseEntity.ok(isAvailable);
    }
    
    /**
     * Temporarily block a time slot (for reservation)
     */
    @PostMapping("/doctor/{doctorId}/block-slot")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Void> blockTimeSlot(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime appointmentDateTime,
            @RequestParam(defaultValue = "30") int durationMinutes) {
        
        try {
            availabilityService.blockTimeSlot(doctorId, appointmentDateTime, durationMinutes);
            return ResponseEntity.ok().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }
    
    /**
     * Release a temporarily blocked time slot
     */
    @PostMapping("/doctor/{doctorId}/release-slot")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Void> releaseTimeSlot(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime appointmentDateTime) {
        
        availabilityService.releaseTimeSlot(doctorId, appointmentDateTime);
        return ResponseEntity.ok().build();
    }
    
    // ========== ENHANCED ENDPOINTS FOR TASK 6.1 ==========
    
    /**
     * Bulk create recurring availability for multiple days
     */
    @PostMapping("/bulk/recurring")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<DoctorAvailability>> bulkCreateRecurringAvailability(
            @Valid @RequestBody BulkAvailabilityRequest request) {
        
        try {
            if (request.getDaysOfWeek() == null || request.getDaysOfWeek().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            List<DoctorAvailability> availabilities = availabilityService.bulkCreateRecurringAvailability(
                    request.getDoctorId(),
                    request.getDaysOfWeek(),
                    request.getStartTime(),
                    request.getEndTime(),
                    request.getSlotDurationMinutes()
            );
            
            return ResponseEntity.status(HttpStatus.CREATED).body(availabilities);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Bulk create specific date availability for a date range
     */
    @PostMapping("/bulk/specific-dates")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<DoctorAvailability>> bulkCreateSpecificDateAvailability(
            @Valid @RequestBody BulkAvailabilityRequest request) {
        
        try {
            if (request.getStartDate() == null || request.getEndDate() == null) {
                return ResponseEntity.badRequest().build();
            }
            
            if (request.getStartDate().isAfter(request.getEndDate())) {
                return ResponseEntity.badRequest().build();
            }
            
            List<DoctorAvailability> availabilities = availabilityService.bulkCreateSpecificDateAvailability(
                    request.getDoctorId(),
                    request.getStartDate(),
                    request.getEndDate(),
                    request.getStartTime(),
                    request.getEndTime(),
                    request.getSlotDurationMinutes()
            );
            
            return ResponseEntity.status(HttpStatus.CREATED).body(availabilities);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Bulk update availability for multiple slots
     */
    @PutMapping("/bulk/update")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<DoctorAvailability>> bulkUpdateAvailability(
            @Valid @RequestBody BulkAvailabilityRequest request) {
        
        try {
            if (request.getAvailabilityIds() == null || request.getAvailabilityIds().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            List<DoctorAvailability> updatedAvailabilities = availabilityService.bulkUpdateAvailability(
                    request.getAvailabilityIds(),
                    request.getStartTime(),
                    request.getEndTime(),
                    request.getIsAvailable(),
                    request.getSlotDurationMinutes()
            );
            
            return ResponseEntity.ok(updatedAvailabilities);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Bulk delete availability slots
     */
    @DeleteMapping("/bulk/delete")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Void> bulkDeleteAvailability(@RequestBody List<Long> availabilityIds) {
        
        if (availabilityIds == null || availabilityIds.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        availabilityService.bulkDeleteAvailability(availabilityIds);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Create exception date (override recurring availability for specific date)
     */
    @PostMapping("/exception-date")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<DoctorAvailability> createExceptionDate(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate exceptionDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime,
            @RequestParam(required = false) Boolean isAvailable,
            @RequestParam(defaultValue = "30") Integer slotDurationMinutes) {
        
        try {
            DoctorAvailability exception = availabilityService.createExceptionDate(
                    doctorId, exceptionDate, startTime, endTime, isAvailable, slotDurationMinutes);
            return ResponseEntity.status(HttpStatus.CREATED).body(exception);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }
    
    /**
     * Mark date as unavailable (exception date with no availability)
     */
    @PostMapping("/mark-unavailable")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<DoctorAvailability> markDateUnavailable(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate unavailableDate) {
        
        try {
            DoctorAvailability unavailable = availabilityService.markDateUnavailable(doctorId, unavailableDate);
            return ResponseEntity.status(HttpStatus.CREATED).body(unavailable);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }
    
    /**
     * Get all exception dates for a doctor
     */
    @GetMapping("/doctor/{doctorId}/exception-dates")
    public ResponseEntity<List<DoctorAvailability>> getExceptionDates(@PathVariable Long doctorId) {
        List<DoctorAvailability> exceptions = availabilityService.getExceptionDates(doctorId);
        return ResponseEntity.ok(exceptions);
    }
    
    /**
     * Get unavailable exception dates (blocked dates)
     */
    @GetMapping("/doctor/{doctorId}/unavailable-dates")
    public ResponseEntity<List<DoctorAvailability>> getUnavailableDates(@PathVariable Long doctorId) {
        List<DoctorAvailability> unavailable = availabilityService.getUnavailableDates(doctorId);
        return ResponseEntity.ok(unavailable);
    }
    
    /**
     * Delete exception date
     */
    @DeleteMapping("/doctor/{doctorId}/exception-date/{exceptionDate}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteExceptionDate(
            @PathVariable Long doctorId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate exceptionDate) {
        
        availabilityService.deleteExceptionDate(doctorId, exceptionDate);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Copy availability from one day to another
     */
    @PostMapping("/copy-availability")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<DoctorAvailability>> copyAvailability(
            @RequestParam Long doctorId,
            @RequestParam DayOfWeek sourceDayOfWeek,
            @RequestParam List<DayOfWeek> targetDaysOfWeek) {
        
        try {
            if (targetDaysOfWeek == null || targetDaysOfWeek.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            List<DoctorAvailability> copiedAvailabilities = availabilityService.copyAvailability(
                    doctorId, sourceDayOfWeek, targetDaysOfWeek);
            return ResponseEntity.status(HttpStatus.CREATED).body(copiedAvailabilities);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get availability summary for a doctor
     */
    @GetMapping("/doctor/{doctorId}/summary")
    public ResponseEntity<AvailabilitySummaryResponse> getAvailabilitySummary(@PathVariable Long doctorId) {
        DoctorAvailabilityService.AvailabilitySummary summary = 
                availabilityService.getAvailabilitySummary(doctorId);
        AvailabilitySummaryResponse response = new AvailabilitySummaryResponse(summary);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Check for availability conflicts
     */
    @GetMapping("/check-conflicts")
    public ResponseEntity<AvailabilityConflictResponse> checkConflicts(
            @RequestParam Long doctorId,
            @RequestParam(required = false) DayOfWeek dayOfWeek,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime specificDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime) {
        
        List<DoctorAvailability> conflicts = availabilityService.detectConflicts(
                doctorId, dayOfWeek, specificDate, startTime, endTime);
        
        List<AvailabilityConflictResponse.ConflictDetail> conflictDetails = conflicts.stream()
                .map(AvailabilityConflictResponse.ConflictDetail::new)
                .collect(Collectors.toList());
        
        boolean hasConflicts = !conflicts.isEmpty();
        String message = hasConflicts 
                ? String.format("Found %d conflicting availability slot(s)", conflicts.size())
                : "No conflicts found";
        
        AvailabilityConflictResponse response = new AvailabilityConflictResponse(
                hasConflicts, conflictDetails, message);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Check if creating new availability would cause conflicts (boolean response)
     */
    @GetMapping("/has-conflicts")
    public ResponseEntity<Boolean> hasConflicts(
            @RequestParam Long doctorId,
            @RequestParam(required = false) DayOfWeek dayOfWeek,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime specificDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime) {
        
        boolean hasConflicts = availabilityService.hasConflicts(
                doctorId, dayOfWeek, specificDate, startTime, endTime);
        
        return ResponseEntity.ok(hasConflicts);
    }
}
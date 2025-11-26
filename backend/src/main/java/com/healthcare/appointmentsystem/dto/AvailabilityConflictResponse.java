package com.healthcare.appointmentsystem.dto;

import com.healthcare.appointmentsystem.entity.DoctorAvailability;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * DTO for availability conflict checking response
 */
public class AvailabilityConflictResponse {
    
    private boolean hasConflicts;
    private List<ConflictDetail> conflicts;
    private String message;
    
    // Constructors
    public AvailabilityConflictResponse() {}
    
    public AvailabilityConflictResponse(boolean hasConflicts, List<ConflictDetail> conflicts, String message) {
        this.hasConflicts = hasConflicts;
        this.conflicts = conflicts;
        this.message = message;
    }
    
    // Getters and Setters
    public boolean isHasConflicts() {
        return hasConflicts;
    }
    
    public void setHasConflicts(boolean hasConflicts) {
        this.hasConflicts = hasConflicts;
    }
    
    public List<ConflictDetail> getConflicts() {
        return conflicts;
    }
    
    public void setConflicts(List<ConflictDetail> conflicts) {
        this.conflicts = conflicts;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    /**
     * Inner class for conflict details
     */
    public static class ConflictDetail {
        private Long availabilityId;
        private DayOfWeek dayOfWeek;
        private LocalDateTime specificDate;
        private LocalTime startTime;
        private LocalTime endTime;
        private boolean isRecurring;
        
        public ConflictDetail() {}
        
        public ConflictDetail(DoctorAvailability availability) {
            this.availabilityId = availability.getId();
            this.dayOfWeek = availability.getDayOfWeek();
            this.specificDate = availability.getAvailableDate();
            this.startTime = availability.getStartTime();
            this.endTime = availability.getEndTime();
            this.isRecurring = availability.getDayOfWeek() != null && availability.getAvailableDate() == null;
        }
        
        // Getters and Setters
        public Long getAvailabilityId() {
            return availabilityId;
        }
        
        public void setAvailabilityId(Long availabilityId) {
            this.availabilityId = availabilityId;
        }
        
        public DayOfWeek getDayOfWeek() {
            return dayOfWeek;
        }
        
        public void setDayOfWeek(DayOfWeek dayOfWeek) {
            this.dayOfWeek = dayOfWeek;
        }
        
        public LocalDateTime getSpecificDate() {
            return specificDate;
        }
        
        public void setSpecificDate(LocalDateTime specificDate) {
            this.specificDate = specificDate;
        }
        
        public LocalTime getStartTime() {
            return startTime;
        }
        
        public void setStartTime(LocalTime startTime) {
            this.startTime = startTime;
        }
        
        public LocalTime getEndTime() {
            return endTime;
        }
        
        public void setEndTime(LocalTime endTime) {
            this.endTime = endTime;
        }
        
        public boolean isRecurring() {
            return isRecurring;
        }
        
        public void setRecurring(boolean recurring) {
            isRecurring = recurring;
        }
    }
}

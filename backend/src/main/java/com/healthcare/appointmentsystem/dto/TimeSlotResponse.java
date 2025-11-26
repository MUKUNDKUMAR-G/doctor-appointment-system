package com.healthcare.appointmentsystem.dto;

import java.time.LocalDateTime;
import java.time.LocalTime;

public class TimeSlotResponse {
    
    private LocalDateTime dateTime;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer durationMinutes;
    private Boolean isAvailable;
    private Boolean isBooked;
    
    // Constructors
    public TimeSlotResponse() {}
    
    public TimeSlotResponse(LocalDateTime dateTime, LocalTime startTime, LocalTime endTime, 
                           Integer durationMinutes, Boolean isAvailable, Boolean isBooked) {
        this.dateTime = dateTime;
        this.startTime = startTime;
        this.endTime = endTime;
        this.durationMinutes = durationMinutes;
        this.isAvailable = isAvailable;
        this.isBooked = isBooked;
    }
    
    // Getters and Setters
    public LocalDateTime getDateTime() {
        return dateTime;
    }
    
    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
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
    
    public Integer getDurationMinutes() {
        return durationMinutes;
    }
    
    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }
    
    public Boolean getIsAvailable() {
        return isAvailable;
    }
    
    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }
    
    public Boolean getIsBooked() {
        return isBooked;
    }
    
    public void setIsBooked(Boolean isBooked) {
        this.isBooked = isBooked;
    }
}
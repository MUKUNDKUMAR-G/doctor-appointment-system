package com.healthcare.appointmentsystem.dto;

import java.time.LocalDate;
import java.util.List;

public class CalendarDayResponse {
    
    private LocalDate date;
    private Boolean hasAvailability;
    private Integer availableSlots;
    private Integer bookedSlots;
    private Integer totalSlots;
    private List<TimeSlotResponse> timeSlots;
    
    // Constructors
    public CalendarDayResponse() {}
    
    public CalendarDayResponse(LocalDate date, Boolean hasAvailability, 
                             Integer availableSlots, Integer bookedSlots, 
                             List<TimeSlotResponse> timeSlots) {
        this.date = date;
        this.hasAvailability = hasAvailability;
        this.availableSlots = availableSlots;
        this.bookedSlots = bookedSlots;
        this.totalSlots = availableSlots + bookedSlots;
        this.timeSlots = timeSlots;
    }
    
    // Getters and Setters
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public Boolean getHasAvailability() {
        return hasAvailability;
    }
    
    public void setHasAvailability(Boolean hasAvailability) {
        this.hasAvailability = hasAvailability;
    }
    
    public Integer getAvailableSlots() {
        return availableSlots;
    }
    
    public void setAvailableSlots(Integer availableSlots) {
        this.availableSlots = availableSlots;
    }
    
    public Integer getBookedSlots() {
        return bookedSlots;
    }
    
    public void setBookedSlots(Integer bookedSlots) {
        this.bookedSlots = bookedSlots;
    }
    
    public Integer getTotalSlots() {
        return totalSlots;
    }
    
    public void setTotalSlots(Integer totalSlots) {
        this.totalSlots = totalSlots;
    }
    
    public List<TimeSlotResponse> getTimeSlots() {
        return timeSlots;
    }
    
    public void setTimeSlots(List<TimeSlotResponse> timeSlots) {
        this.timeSlots = timeSlots;
    }
    
    /**
     * Calculate availability percentage
     */
    public Double getAvailabilityPercentage() {
        if (totalSlots == null || totalSlots == 0) {
            return 0.0;
        }
        return (availableSlots.doubleValue() / totalSlots.doubleValue()) * 100.0;
    }
    
    /**
     * Get availability status
     */
    public String getAvailabilityStatus() {
        if (availableSlots == null || availableSlots == 0) {
            return "FULLY_BOOKED";
        } else if (bookedSlots == null || bookedSlots == 0) {
            return "FULLY_AVAILABLE";
        } else {
            return "PARTIALLY_AVAILABLE";
        }
    }
}
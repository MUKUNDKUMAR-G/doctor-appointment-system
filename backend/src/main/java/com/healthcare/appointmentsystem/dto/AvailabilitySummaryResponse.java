package com.healthcare.appointmentsystem.dto;

import com.healthcare.appointmentsystem.entity.DoctorAvailability;
import com.healthcare.appointmentsystem.service.DoctorAvailabilityService;
import java.util.List;

/**
 * DTO for availability summary response
 */
public class AvailabilitySummaryResponse {
    
    private int recurringCount;
    private int exceptionCount;
    private int unavailableCount;
    private List<DoctorAvailability> recurringAvailability;
    private List<DoctorAvailability> exceptionDates;
    private List<DoctorAvailability> unavailableDates;
    
    // Constructors
    public AvailabilitySummaryResponse() {}
    
    public AvailabilitySummaryResponse(DoctorAvailabilityService.AvailabilitySummary summary) {
        this.recurringCount = summary.getRecurringCount();
        this.exceptionCount = summary.getExceptionCount();
        this.unavailableCount = summary.getUnavailableCount();
        this.recurringAvailability = summary.getRecurringAvailability();
        this.exceptionDates = summary.getExceptionDates();
        this.unavailableDates = summary.getUnavailableDates();
    }
    
    // Getters and Setters
    public int getRecurringCount() {
        return recurringCount;
    }
    
    public void setRecurringCount(int recurringCount) {
        this.recurringCount = recurringCount;
    }
    
    public int getExceptionCount() {
        return exceptionCount;
    }
    
    public void setExceptionCount(int exceptionCount) {
        this.exceptionCount = exceptionCount;
    }
    
    public int getUnavailableCount() {
        return unavailableCount;
    }
    
    public void setUnavailableCount(int unavailableCount) {
        this.unavailableCount = unavailableCount;
    }
    
    public List<DoctorAvailability> getRecurringAvailability() {
        return recurringAvailability;
    }
    
    public void setRecurringAvailability(List<DoctorAvailability> recurringAvailability) {
        this.recurringAvailability = recurringAvailability;
    }
    
    public List<DoctorAvailability> getExceptionDates() {
        return exceptionDates;
    }
    
    public void setExceptionDates(List<DoctorAvailability> exceptionDates) {
        this.exceptionDates = exceptionDates;
    }
    
    public List<DoctorAvailability> getUnavailableDates() {
        return unavailableDates;
    }
    
    public void setUnavailableDates(List<DoctorAvailability> unavailableDates) {
        this.unavailableDates = unavailableDates;
    }
}

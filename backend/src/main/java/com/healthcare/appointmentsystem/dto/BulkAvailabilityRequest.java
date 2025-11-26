package com.healthcare.appointmentsystem.dto;

import jakarta.validation.constraints.NotNull;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * DTO for bulk availability operations
 */
public class BulkAvailabilityRequest {
    
    @NotNull(message = "Doctor ID is required")
    private Long doctorId;
    
    private List<DayOfWeek> daysOfWeek;
    
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    @NotNull(message = "Start time is required")
    private LocalTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalTime endTime;
    
    private Integer slotDurationMinutes = 30;
    
    private Boolean isAvailable = true;
    
    private List<Long> availabilityIds;
    
    // Constructors
    public BulkAvailabilityRequest() {}
    
    public BulkAvailabilityRequest(Long doctorId, List<DayOfWeek> daysOfWeek, 
                                  LocalTime startTime, LocalTime endTime) {
        this.doctorId = doctorId;
        this.daysOfWeek = daysOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
    }
    
    // Getters and Setters
    public Long getDoctorId() {
        return doctorId;
    }
    
    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }
    
    public List<DayOfWeek> getDaysOfWeek() {
        return daysOfWeek;
    }
    
    public void setDaysOfWeek(List<DayOfWeek> daysOfWeek) {
        this.daysOfWeek = daysOfWeek;
    }
    
    public LocalDate getStartDate() {
        return startDate;
    }
    
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }
    
    public LocalDate getEndDate() {
        return endDate;
    }
    
    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
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
    
    public Integer getSlotDurationMinutes() {
        return slotDurationMinutes;
    }
    
    public void setSlotDurationMinutes(Integer slotDurationMinutes) {
        this.slotDurationMinutes = slotDurationMinutes;
    }
    
    public Boolean getIsAvailable() {
        return isAvailable;
    }
    
    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }
    
    public List<Long> getAvailabilityIds() {
        return availabilityIds;
    }
    
    public void setAvailabilityIds(List<Long> availabilityIds) {
        this.availabilityIds = availabilityIds;
    }
}

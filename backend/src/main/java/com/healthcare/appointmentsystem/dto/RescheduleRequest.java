package com.healthcare.appointmentsystem.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public class RescheduleRequest {
    
    @NotNull(message = "New appointment date and time is required")
    @Future(message = "New appointment must be scheduled for a future date and time")
    private LocalDateTime newAppointmentDateTime;
    
    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;
    
    // Constructors
    public RescheduleRequest() {}
    
    public RescheduleRequest(LocalDateTime newAppointmentDateTime) {
        this.newAppointmentDateTime = newAppointmentDateTime;
    }
    
    public RescheduleRequest(LocalDateTime newAppointmentDateTime, String reason) {
        this.newAppointmentDateTime = newAppointmentDateTime;
        this.reason = reason;
    }
    
    // Getters and Setters
    public LocalDateTime getNewAppointmentDateTime() {
        return newAppointmentDateTime;
    }
    
    public void setNewAppointmentDateTime(LocalDateTime newAppointmentDateTime) {
        this.newAppointmentDateTime = newAppointmentDateTime;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
    
    @Override
    public String toString() {
        return "RescheduleRequest{" +
                "newAppointmentDateTime=" + newAppointmentDateTime +
                ", reason='" + reason + '\'' +
                '}';
    }
}
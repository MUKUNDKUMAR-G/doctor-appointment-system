package com.healthcare.appointmentsystem.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public class ReservationRequest {
    
    @NotNull(message = "Doctor ID is required")
    private Long doctorId;
    
    @NotNull(message = "Appointment date and time is required")
    @Future(message = "Appointment must be scheduled for a future date and time")
    private LocalDateTime appointmentDateTime;
    
    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;
    
    @Min(value = 15, message = "Appointment duration must be at least 15 minutes")
    @Max(value = 240, message = "Appointment duration cannot exceed 240 minutes")
    private Integer durationMinutes = 30;
    
    // Constructors
    public ReservationRequest() {}
    
    public ReservationRequest(Long doctorId, LocalDateTime appointmentDateTime) {
        this.doctorId = doctorId;
        this.appointmentDateTime = appointmentDateTime;
    }
    
    // Getters and Setters
    public Long getDoctorId() {
        return doctorId;
    }
    
    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }
    
    public LocalDateTime getAppointmentDateTime() {
        return appointmentDateTime;
    }
    
    public void setAppointmentDateTime(LocalDateTime appointmentDateTime) {
        this.appointmentDateTime = appointmentDateTime;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
    
    public Integer getDurationMinutes() {
        return durationMinutes;
    }
    
    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }
    
    @Override
    public String toString() {
        return "ReservationRequest{" +
                "doctorId=" + doctorId +
                ", appointmentDateTime=" + appointmentDateTime +
                ", reason='" + reason + '\'' +
                ", durationMinutes=" + durationMinutes +
                '}';
    }
}
package com.healthcare.appointmentsystem.dto;

import com.healthcare.appointmentsystem.entity.AppointmentStatus;

import java.time.LocalDateTime;

public class AppointmentResponse {
    
    private Long id;
    private Long patientId;
    private String patientName;
    private String patientEmail;
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialty;
    private LocalDateTime appointmentDateTime;
    private AppointmentStatus status;
    private String reason;
    private String notes;
    private Integer durationMinutes;
    private Boolean isReserved;
    private LocalDateTime reservationExpiresAt;
    private LocalDateTime cancelledAt;
    private String cancellationReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public AppointmentResponse() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getPatientId() {
        return patientId;
    }
    
    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }
    
    public String getPatientName() {
        return patientName;
    }
    
    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }
    
    public String getPatientEmail() {
        return patientEmail;
    }
    
    public void setPatientEmail(String patientEmail) {
        this.patientEmail = patientEmail;
    }
    
    public Long getDoctorId() {
        return doctorId;
    }
    
    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }
    
    public String getDoctorName() {
        return doctorName;
    }
    
    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }
    
    public String getDoctorSpecialty() {
        return doctorSpecialty;
    }
    
    public void setDoctorSpecialty(String doctorSpecialty) {
        this.doctorSpecialty = doctorSpecialty;
    }
    
    public LocalDateTime getAppointmentDateTime() {
        return appointmentDateTime;
    }
    
    public void setAppointmentDateTime(LocalDateTime appointmentDateTime) {
        this.appointmentDateTime = appointmentDateTime;
    }
    
    public AppointmentStatus getStatus() {
        return status;
    }
    
    public void setStatus(AppointmentStatus status) {
        this.status = status;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public Integer getDurationMinutes() {
        return durationMinutes;
    }
    
    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }
    
    public Boolean getIsReserved() {
        return isReserved;
    }
    
    public void setIsReserved(Boolean isReserved) {
        this.isReserved = isReserved;
    }
    
    public LocalDateTime getReservationExpiresAt() {
        return reservationExpiresAt;
    }
    
    public void setReservationExpiresAt(LocalDateTime reservationExpiresAt) {
        this.reservationExpiresAt = reservationExpiresAt;
    }
    
    public LocalDateTime getCancelledAt() {
        return cancelledAt;
    }
    
    public void setCancelledAt(LocalDateTime cancelledAt) {
        this.cancelledAt = cancelledAt;
    }
    
    public String getCancellationReason() {
        return cancellationReason;
    }
    
    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    // Utility methods
    public LocalDateTime getAppointmentEndTime() {
        return appointmentDateTime != null && durationMinutes != null 
            ? appointmentDateTime.plusMinutes(durationMinutes) 
            : null;
    }
    
    public boolean canBeCancelled() {
        return status == AppointmentStatus.SCHEDULED && 
               appointmentDateTime != null &&
               appointmentDateTime.isAfter(LocalDateTime.now().plusHours(24));
    }
    
    @Override
    public String toString() {
        return "AppointmentResponse{" +
                "id=" + id +
                ", patientName='" + patientName + '\'' +
                ", doctorName='" + doctorName + '\'' +
                ", appointmentDateTime=" + appointmentDateTime +
                ", status=" + status +
                '}';
    }
}
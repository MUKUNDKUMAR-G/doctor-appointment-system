package com.healthcare.appointmentsystem.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "appointments", 
    indexes = {
        @Index(name = "idx_appointments_patient_date", columnList = "patient_id, appointment_date_time"),
        @Index(name = "idx_appointments_doctor_date", columnList = "doctor_id, appointment_date_time"),
        @Index(name = "idx_appointments_status", columnList = "status"),
        @Index(name = "idx_appointments_date", columnList = "appointment_date_time")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_doctor_appointment_time", columnNames = {"doctor_id", "appointment_date_time"})
    }
)
public class Appointment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @NotNull(message = "Patient is required")
    private User patient;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    @NotNull(message = "Doctor is required")
    private Doctor doctor;
    
    @Column(name = "appointment_date_time", nullable = false)
    @NotNull(message = "Appointment date and time is required")
    @Future(message = "Appointment must be scheduled for a future date and time")
    private LocalDateTime appointmentDateTime;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AppointmentStatus status = AppointmentStatus.SCHEDULED;
    
    @Column(columnDefinition = "TEXT")
    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String notes;
    
    @Column(columnDefinition = "TEXT")
    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;
    
    @Column(name = "duration_minutes", nullable = false)
    @NotNull(message = "Duration is required")
    @Min(value = 15, message = "Appointment duration must be at least 15 minutes")
    @Max(value = 240, message = "Appointment duration cannot exceed 240 minutes")
    private Integer durationMinutes = 30;
    
    @Column(name = "reservation_expires_at")
    private LocalDateTime reservationExpiresAt;
    
    @Column(name = "is_reserved", nullable = false)
    private Boolean isReserved = false;
    
    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;
    
    @Column(name = "cancellation_reason")
    @Size(max = 500, message = "Cancellation reason cannot exceed 500 characters")
    private String cancellationReason;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // Constructors
    public Appointment() {}
    
    public Appointment(User patient, Doctor doctor, LocalDateTime appointmentDateTime) {
        this.patient = patient;
        this.doctor = doctor;
        this.appointmentDateTime = appointmentDateTime;
    }
    
    public Appointment(User patient, Doctor doctor, LocalDateTime appointmentDateTime, String reason) {
        this.patient = patient;
        this.doctor = doctor;
        this.appointmentDateTime = appointmentDateTime;
        this.reason = reason;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getPatient() {
        return patient;
    }
    
    public void setPatient(User patient) {
        this.patient = patient;
    }
    
    public Doctor getDoctor() {
        return doctor;
    }
    
    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
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
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
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
    
    public LocalDateTime getReservationExpiresAt() {
        return reservationExpiresAt;
    }
    
    public void setReservationExpiresAt(LocalDateTime reservationExpiresAt) {
        this.reservationExpiresAt = reservationExpiresAt;
    }
    
    public Boolean getIsReserved() {
        return isReserved;
    }
    
    public void setIsReserved(Boolean isReserved) {
        this.isReserved = isReserved;
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
        return appointmentDateTime.plusMinutes(durationMinutes);
    }
    
    public boolean isExpiredReservation() {
        return isReserved && reservationExpiresAt != null && 
               LocalDateTime.now().isAfter(reservationExpiresAt);
    }
    
    public boolean canBeCancelled() {
        return status == AppointmentStatus.SCHEDULED && 
               appointmentDateTime.isAfter(LocalDateTime.now().plusHours(24));
    }
    
    public boolean isUpcoming() {
        return status == AppointmentStatus.SCHEDULED && 
               appointmentDateTime.isAfter(LocalDateTime.now());
    }
    
    public boolean isPast() {
        return appointmentDateTime.isBefore(LocalDateTime.now());
    }
    
    public void cancel(String reason) {
        this.status = AppointmentStatus.CANCELLED;
        this.cancelledAt = LocalDateTime.now();
        this.cancellationReason = reason;
    }
    
    public void complete() {
        this.status = AppointmentStatus.COMPLETED;
    }
    
    public void reserve(int reservationMinutes) {
        this.isReserved = true;
        this.reservationExpiresAt = LocalDateTime.now().plusMinutes(reservationMinutes);
    }
    
    public void confirmReservation() {
        this.isReserved = false;
        this.reservationExpiresAt = null;
        this.status = AppointmentStatus.SCHEDULED;
    }
    
    @Override
    public String toString() {
        return "Appointment{" +
                "id=" + id +
                ", appointmentDateTime=" + appointmentDateTime +
                ", status=" + status +
                ", durationMinutes=" + durationMinutes +
                ", patientName='" + (patient != null ? patient.getFullName() : "N/A") + '\'' +
                ", doctorName='" + (doctor != null ? doctor.getFullName() : "N/A") + '\'' +
                '}';
    }
}
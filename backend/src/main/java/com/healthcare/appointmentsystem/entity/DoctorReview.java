package com.healthcare.appointmentsystem.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "doctor_reviews", indexes = {
    @Index(name = "idx_doctor_reviews_doctor_id", columnList = "doctor_id"),
    @Index(name = "idx_doctor_reviews_patient_id", columnList = "patient_id"),
    @Index(name = "idx_doctor_reviews_rating", columnList = "rating"),
    @Index(name = "idx_doctor_reviews_appointment_id", columnList = "appointment_id")
})
public class DoctorReview {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    @NotNull(message = "Doctor is required")
    private Doctor doctor;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @NotNull(message = "Patient is required")
    private User patient;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;
    
    @Column(nullable = false)
    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating cannot exceed 5")
    private Integer rating;
    
    @Column(columnDefinition = "TEXT")
    @Size(max = 2000, message = "Comment cannot exceed 2000 characters")
    private String comment;
    
    @Column(name = "doctor_response", columnDefinition = "TEXT")
    @Size(max = 2000, message = "Doctor response cannot exceed 2000 characters")
    private String doctorResponse;
    
    @Column(name = "responded_at")
    private LocalDateTime respondedAt;
    
    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = true;
    
    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Constructors
    public DoctorReview() {}
    
    public DoctorReview(Doctor doctor, User patient, Integer rating) {
        this.doctor = doctor;
        this.patient = patient;
        this.rating = rating;
    }
    
    public DoctorReview(Doctor doctor, User patient, Appointment appointment, Integer rating, String comment) {
        this.doctor = doctor;
        this.patient = patient;
        this.appointment = appointment;
        this.rating = rating;
        this.comment = comment;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Doctor getDoctor() {
        return doctor;
    }
    
    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }
    
    public User getPatient() {
        return patient;
    }
    
    public void setPatient(User patient) {
        this.patient = patient;
    }
    
    public Appointment getAppointment() {
        return appointment;
    }
    
    public void setAppointment(Appointment appointment) {
        this.appointment = appointment;
    }
    
    public Integer getRating() {
        return rating;
    }
    
    public void setRating(Integer rating) {
        this.rating = rating;
    }
    
    public String getComment() {
        return comment;
    }
    
    public void setComment(String comment) {
        this.comment = comment;
    }
    
    public String getDoctorResponse() {
        return doctorResponse;
    }
    
    public void setDoctorResponse(String doctorResponse) {
        this.doctorResponse = doctorResponse;
    }
    
    public LocalDateTime getRespondedAt() {
        return respondedAt;
    }
    
    public void setRespondedAt(LocalDateTime respondedAt) {
        this.respondedAt = respondedAt;
    }
    
    public Boolean getIsPublic() {
        return isPublic;
    }
    
    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }
    
    public Boolean getIsVerified() {
        return isVerified;
    }
    
    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
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
    public boolean hasResponse() {
        return doctorResponse != null && !doctorResponse.trim().isEmpty();
    }
    
    public void addResponse(String response) {
        this.doctorResponse = response;
        this.respondedAt = LocalDateTime.now();
    }
    
    public boolean isPositive() {
        return rating >= 4;
    }
    
    public boolean isNegative() {
        return rating <= 2;
    }
    
    @Override
    public String toString() {
        return "DoctorReview{" +
                "id=" + id +
                ", rating=" + rating +
                ", isPublic=" + isPublic +
                ", hasResponse=" + hasResponse() +
                ", patientName='" + (patient != null ? patient.getFullName() : "N/A") + '\'' +
                '}';
    }
}

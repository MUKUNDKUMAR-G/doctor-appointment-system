package com.healthcare.appointmentsystem.dto;

import com.healthcare.appointmentsystem.entity.DoctorReview;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public class DoctorReviewDTO {
    
    private Long id;
    
    private Long doctorId;
    
    private Long patientId;
    
    private String patientName;
    
    private String patientAvatarUrl;
    
    private Long appointmentId;
    
    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating cannot exceed 5")
    private Integer rating;
    
    @Size(max = 2000, message = "Comment cannot exceed 2000 characters")
    private String comment;
    
    @Size(max = 2000, message = "Doctor response cannot exceed 2000 characters")
    private String doctorResponse;
    
    private LocalDateTime respondedAt;
    
    private Boolean isPublic;
    
    private Boolean isVerified;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    // Computed fields
    private Boolean hasResponse;
    private Boolean isPositive;
    private Boolean isNegative;
    
    // Constructors
    public DoctorReviewDTO() {}
    
    public DoctorReviewDTO(DoctorReview review) {
        this.id = review.getId();
        this.doctorId = review.getDoctor() != null ? review.getDoctor().getId() : null;
        this.patientId = review.getPatient() != null ? review.getPatient().getId() : null;
        this.patientName = review.getPatient() != null ? review.getPatient().getFullName() : null;
        this.patientAvatarUrl = review.getPatient() != null ? review.getPatient().getAvatarUrl() : null;
        this.appointmentId = review.getAppointment() != null ? review.getAppointment().getId() : null;
        this.rating = review.getRating();
        this.comment = review.getComment();
        this.doctorResponse = review.getDoctorResponse();
        this.respondedAt = review.getRespondedAt();
        this.isPublic = review.getIsPublic();
        this.isVerified = review.getIsVerified();
        this.createdAt = review.getCreatedAt();
        this.updatedAt = review.getUpdatedAt();
        this.hasResponse = review.hasResponse();
        this.isPositive = review.isPositive();
        this.isNegative = review.isNegative();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getDoctorId() {
        return doctorId;
    }
    
    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
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
    
    public String getPatientAvatarUrl() {
        return patientAvatarUrl;
    }
    
    public void setPatientAvatarUrl(String patientAvatarUrl) {
        this.patientAvatarUrl = patientAvatarUrl;
    }
    
    public Long getAppointmentId() {
        return appointmentId;
    }
    
    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
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
    
    public Boolean getHasResponse() {
        return hasResponse;
    }
    
    public void setHasResponse(Boolean hasResponse) {
        this.hasResponse = hasResponse;
    }
    
    public Boolean getIsPositive() {
        return isPositive;
    }
    
    public void setIsPositive(Boolean isPositive) {
        this.isPositive = isPositive;
    }
    
    public Boolean getIsNegative() {
        return isNegative;
    }
    
    public void setIsNegative(Boolean isNegative) {
        this.isNegative = isNegative;
    }
    
    @Override
    public String toString() {
        return "DoctorReviewDTO{" +
                "id=" + id +
                ", rating=" + rating +
                ", patientName='" + patientName + '\'' +
                ", hasResponse=" + hasResponse +
                ", isPublic=" + isPublic +
                '}';
    }
}

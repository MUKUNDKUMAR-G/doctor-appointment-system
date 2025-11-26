package com.healthcare.appointmentsystem.dto;

import jakarta.validation.constraints.*;

public class ReviewSubmissionDTO {
    
    @NotNull(message = "Doctor ID is required")
    private Long doctorId;
    
    private Long appointmentId;
    
    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating cannot exceed 5")
    private Integer rating;
    
    @Size(max = 2000, message = "Comment cannot exceed 2000 characters")
    private String comment;
    
    private Boolean isPublic = true;
    
    // Constructors
    public ReviewSubmissionDTO() {}
    
    public ReviewSubmissionDTO(Long doctorId, Integer rating, String comment) {
        this.doctorId = doctorId;
        this.rating = rating;
        this.comment = comment;
    }
    
    // Getters and Setters
    public Long getDoctorId() {
        return doctorId;
    }
    
    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
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
    
    public Boolean getIsPublic() {
        return isPublic;
    }
    
    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }
    
    @Override
    public String toString() {
        return "ReviewSubmissionDTO{" +
                "doctorId=" + doctorId +
                ", appointmentId=" + appointmentId +
                ", rating=" + rating +
                ", isPublic=" + isPublic +
                '}';
    }
}

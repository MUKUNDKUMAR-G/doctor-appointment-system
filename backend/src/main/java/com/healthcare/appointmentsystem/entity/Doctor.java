package com.healthcare.appointmentsystem.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "doctors", indexes = {
    @Index(name = "idx_doctors_specialty", columnList = "specialty"),
    @Index(name = "idx_doctors_user_id", columnList = "user_id")
})
public class Doctor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @Column(nullable = false, length = 100)
    @NotBlank(message = "Specialty is required")
    @Size(min = 2, max = 100, message = "Specialty must be between 2 and 100 characters")
    private String specialty;
    
    @Column(nullable = false, length = 500)
    @NotBlank(message = "Qualifications are required")
    @Size(min = 10, max = 500, message = "Qualifications must be between 10 and 500 characters")
    private String qualifications;
    
    @Column(columnDefinition = "TEXT")
    @Size(max = 1000, message = "Bio cannot exceed 1000 characters")
    private String bio;
    
    @Column(nullable = false)
    @NotNull(message = "Experience years is required")
    @Min(value = 0, message = "Experience years cannot be negative")
    @Max(value = 50, message = "Experience years cannot exceed 50")
    private Integer experienceYears;
    
    @Column(length = 20)
    @Size(max = 20, message = "License number cannot exceed 20 characters")
    private String licenseNumber;
    
    @Column(nullable = false)
    private Boolean isAvailable = true;
    
    @Column(name = "consultation_fee", precision = 10, scale = 2)
    @DecimalMin(value = "0.0", message = "Consultation fee cannot be negative")
    private BigDecimal consultationFee;
    
    @Column
    private Double rating = 0.0;
    
    @Column(name = "review_count")
    private Integer reviewCount = 0;
    
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DoctorAvailability> availabilities = new ArrayList<>();
    
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Appointment> appointments = new ArrayList<>();
    
    // New fields for enhanced profile
    @Column(name = "profile_completeness")
    @Min(value = 0, message = "Profile completeness cannot be negative")
    @Max(value = 100, message = "Profile completeness cannot exceed 100")
    private Integer profileCompleteness = 0;
    
    @Column(name = "is_verified")
    private Boolean isVerified = false;
    
    @Column(name = "verification_date")
    private LocalDateTime verificationDate;
    
    @Column(name = "languages_spoken", columnDefinition = "TEXT")
    private String languagesSpoken; // JSON array
    
    @Column(name = "education", columnDefinition = "TEXT")
    private String education; // JSON array of qualifications
    
    @Column(name = "awards", columnDefinition = "TEXT")
    private String awards; // JSON array
    
    @Column(name = "consultation_duration")
    @Min(value = 15, message = "Consultation duration must be at least 15 minutes")
    @Max(value = 240, message = "Consultation duration cannot exceed 240 minutes")
    private Integer consultationDuration = 30; // minutes
    
    @Column(name = "follow_up_fee", precision = 10, scale = 2)
    @DecimalMin(value = "0.0", message = "Follow-up fee cannot be negative")
    private BigDecimal followUpFee;
    
    @Column(name = "emergency_fee", precision = 10, scale = 2)
    @DecimalMin(value = "0.0", message = "Emergency fee cannot be negative")
    private BigDecimal emergencyFee;
    
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DoctorCredential> credentials = new ArrayList<>();
    
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DoctorReview> reviews = new ArrayList<>();
    
    @OneToOne(mappedBy = "doctor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private DoctorStatistics statistics;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // Constructors
    public Doctor() {}
    
    public Doctor(User user, String specialty, String qualifications, Integer experienceYears) {
        this.user = user;
        this.specialty = specialty;
        this.qualifications = qualifications;
        this.experienceYears = experienceYears;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public String getSpecialty() {
        return specialty;
    }
    
    public void setSpecialty(String specialty) {
        this.specialty = specialty;
    }
    
    public String getQualifications() {
        return qualifications;
    }
    
    public void setQualifications(String qualifications) {
        this.qualifications = qualifications;
    }
    
    public String getBio() {
        return bio;
    }
    
    public void setBio(String bio) {
        this.bio = bio;
    }
    
    public Integer getExperienceYears() {
        return experienceYears;
    }
    
    public void setExperienceYears(Integer experienceYears) {
        this.experienceYears = experienceYears;
    }
    
    public String getLicenseNumber() {
        return licenseNumber;
    }
    
    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }
    
    public Boolean getIsAvailable() {
        return isAvailable;
    }
    
    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }
    
    public BigDecimal getConsultationFee() {
        return consultationFee;
    }
    
    public void setConsultationFee(BigDecimal consultationFee) {
        this.consultationFee = consultationFee;
    }
    
    public Double getRating() {
        return rating;
    }
    
    public void setRating(Double rating) {
        this.rating = rating;
    }
    
    public Integer getReviewCount() {
        return reviewCount;
    }
    
    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
    }
    
    public List<DoctorAvailability> getAvailabilities() {
        return availabilities;
    }
    
    public void setAvailabilities(List<DoctorAvailability> availabilities) {
        this.availabilities = availabilities;
    }
    
    public List<Appointment> getAppointments() {
        return appointments;
    }
    
    public void setAppointments(List<Appointment> appointments) {
        this.appointments = appointments;
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
    
    public Integer getProfileCompleteness() {
        return profileCompleteness;
    }
    
    public void setProfileCompleteness(Integer profileCompleteness) {
        this.profileCompleteness = profileCompleteness;
    }
    
    public Boolean getIsVerified() {
        return isVerified;
    }
    
    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }
    
    public LocalDateTime getVerificationDate() {
        return verificationDate;
    }
    
    public void setVerificationDate(LocalDateTime verificationDate) {
        this.verificationDate = verificationDate;
    }
    
    public String getLanguagesSpoken() {
        return languagesSpoken;
    }
    
    public void setLanguagesSpoken(String languagesSpoken) {
        this.languagesSpoken = languagesSpoken;
    }
    
    public String getEducation() {
        return education;
    }
    
    public void setEducation(String education) {
        this.education = education;
    }
    
    public String getAwards() {
        return awards;
    }
    
    public void setAwards(String awards) {
        this.awards = awards;
    }
    
    public Integer getConsultationDuration() {
        return consultationDuration;
    }
    
    public void setConsultationDuration(Integer consultationDuration) {
        this.consultationDuration = consultationDuration;
    }
    
    public BigDecimal getFollowUpFee() {
        return followUpFee;
    }
    
    public void setFollowUpFee(BigDecimal followUpFee) {
        this.followUpFee = followUpFee;
    }
    
    public BigDecimal getEmergencyFee() {
        return emergencyFee;
    }
    
    public void setEmergencyFee(BigDecimal emergencyFee) {
        this.emergencyFee = emergencyFee;
    }
    
    public List<DoctorCredential> getCredentials() {
        return credentials;
    }
    
    public void setCredentials(List<DoctorCredential> credentials) {
        this.credentials = credentials;
    }
    
    public List<DoctorReview> getReviews() {
        return reviews;
    }
    
    public void setReviews(List<DoctorReview> reviews) {
        this.reviews = reviews;
    }
    
    public DoctorStatistics getStatistics() {
        return statistics;
    }
    
    public void setStatistics(DoctorStatistics statistics) {
        this.statistics = statistics;
    }
    
    // Utility methods
    public String getFullName() {
        return user != null ? user.getFullName() : "";
    }
    
    public String getEmail() {
        return user != null ? user.getEmail() : "";
    }
    
    public void addAvailability(DoctorAvailability availability) {
        availabilities.add(availability);
        availability.setDoctor(this);
    }
    
    public void removeAvailability(DoctorAvailability availability) {
        availabilities.remove(availability);
        availability.setDoctor(null);
    }
    
    public void addAppointment(Appointment appointment) {
        appointments.add(appointment);
        appointment.setDoctor(this);
    }
    
    public void removeAppointment(Appointment appointment) {
        appointments.remove(appointment);
        appointment.setDoctor(null);
    }
    
    public void addCredential(DoctorCredential credential) {
        credentials.add(credential);
        credential.setDoctor(this);
    }
    
    public void removeCredential(DoctorCredential credential) {
        credentials.remove(credential);
        credential.setDoctor(null);
    }
    
    public void addReview(DoctorReview review) {
        reviews.add(review);
        review.setDoctor(this);
    }
    
    public void removeReview(DoctorReview review) {
        reviews.remove(review);
        review.setDoctor(null);
    }
    
    /**
     * Calculate profile completeness percentage based on filled fields
     * Required fields: specialty, qualifications, experienceYears, bio, licenseNumber
     * Optional fields: avatarUrl, education, languagesSpoken, awards, consultationFee, followUpFee
     */
    public Integer calculateProfileCompleteness() {
        int totalFields = 11;
        int filledFields = 0;
        
        // Required fields (weight: 1 each)
        if (specialty != null && !specialty.trim().isEmpty()) filledFields++;
        if (qualifications != null && !qualifications.trim().isEmpty()) filledFields++;
        if (experienceYears != null && experienceYears > 0) filledFields++;
        if (bio != null && !bio.trim().isEmpty()) filledFields++;
        if (licenseNumber != null && !licenseNumber.trim().isEmpty()) filledFields++;
        
        // Optional fields (weight: 1 each)
        if (user != null && user.getAvatarUrl() != null && !user.getAvatarUrl().trim().isEmpty()) filledFields++;
        if (education != null && !education.trim().isEmpty()) filledFields++;
        if (languagesSpoken != null && !languagesSpoken.trim().isEmpty()) filledFields++;
        if (awards != null && !awards.trim().isEmpty()) filledFields++;
        if (consultationFee != null && consultationFee.compareTo(BigDecimal.ZERO) > 0) filledFields++;
        if (followUpFee != null && followUpFee.compareTo(BigDecimal.ZERO) > 0) filledFields++;
        
        this.profileCompleteness = (int) Math.round((filledFields * 100.0) / totalFields);
        return this.profileCompleteness;
    }
    
    /**
     * Verify the doctor profile
     */
    public void verify() {
        this.isVerified = true;
        this.verificationDate = LocalDateTime.now();
    }
    
    /**
     * Unverify the doctor profile
     */
    public void unverify() {
        this.isVerified = false;
        this.verificationDate = null;
    }
    
    /**
     * Check if doctor has verified credentials
     */
    public boolean hasVerifiedCredentials() {
        return credentials.stream()
                .anyMatch(DoctorCredential::isVerified);
    }
    
    /**
     * Get count of verified credentials
     */
    public long getVerifiedCredentialsCount() {
        return credentials.stream()
                .filter(DoctorCredential::isVerified)
                .count();
    }
    
    @Override
    public String toString() {
        return "Doctor{" +
                "id=" + id +
                ", specialty='" + specialty + '\'' +
                ", experienceYears=" + experienceYears +
                ", isAvailable=" + isAvailable +
                ", isVerified=" + isVerified +
                ", profileCompleteness=" + profileCompleteness +
                ", fullName='" + getFullName() + '\'' +
                '}';
    }
}
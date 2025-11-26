package com.healthcare.appointmentsystem.dto;

import com.healthcare.appointmentsystem.entity.Doctor;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class DoctorProfileResponse {
    
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String specialty;
    private String qualifications;
    private String bio;
    private Integer experienceYears;
    private String licenseNumber;
    private Boolean isAvailable;
    private BigDecimal consultationFee;
    private BigDecimal followUpFee;
    private BigDecimal emergencyFee;
    private Integer consultationDuration;
    private String avatarUrl;
    private Double rating;
    private Integer reviewCount;
    private Integer profileCompleteness;
    private Boolean isVerified;
    private LocalDateTime verificationDate;
    private List<String> languagesSpoken;
    private List<EducationInfo> education;
    private List<String> awards;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Nested objects
    private List<DoctorCredentialDTO> credentials;
    private List<DoctorReviewDTO> recentReviews;
    private DoctorStatisticsDTO statistics;
    
    // Constructors
    public DoctorProfileResponse() {}
    
    public DoctorProfileResponse(Doctor doctor) {
        this.id = doctor.getId();
        this.firstName = doctor.getUser() != null ? doctor.getUser().getFirstName() : null;
        this.lastName = doctor.getUser() != null ? doctor.getUser().getLastName() : null;
        this.email = doctor.getUser() != null ? doctor.getUser().getEmail() : null;
        this.specialty = doctor.getSpecialty();
        this.qualifications = doctor.getQualifications();
        this.bio = doctor.getBio();
        this.experienceYears = doctor.getExperienceYears();
        this.licenseNumber = doctor.getLicenseNumber();
        this.isAvailable = doctor.getIsAvailable();
        this.consultationFee = doctor.getConsultationFee();
        this.followUpFee = doctor.getFollowUpFee();
        this.emergencyFee = doctor.getEmergencyFee();
        this.consultationDuration = doctor.getConsultationDuration();
        this.avatarUrl = doctor.getUser() != null ? doctor.getUser().getAvatarUrl() : null;
        this.rating = doctor.getRating();
        this.reviewCount = doctor.getReviewCount();
        this.profileCompleteness = doctor.getProfileCompleteness();
        this.isVerified = doctor.getIsVerified();
        this.verificationDate = doctor.getVerificationDate();
        this.createdAt = doctor.getCreatedAt();
        this.updatedAt = doctor.getUpdatedAt();
        
        // Parse JSON fields (simplified - in production, use proper JSON parsing)
        this.languagesSpoken = parseJsonArray(doctor.getLanguagesSpoken());
        this.awards = parseJsonArray(doctor.getAwards());
        
        // Initialize collections
        this.credentials = new ArrayList<>();
        this.recentReviews = new ArrayList<>();
    }
    
    // Helper method to parse JSON arrays (simplified)
    private List<String> parseJsonArray(String json) {
        if (json == null || json.trim().isEmpty()) {
            return new ArrayList<>();
        }
        // This is a simplified implementation
        // In production, use Jackson or Gson for proper JSON parsing
        return new ArrayList<>();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
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
    
    public Integer getConsultationDuration() {
        return consultationDuration;
    }
    
    public void setConsultationDuration(Integer consultationDuration) {
        this.consultationDuration = consultationDuration;
    }
    
    public String getAvatarUrl() {
        return avatarUrl;
    }
    
    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
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
    
    public List<String> getLanguagesSpoken() {
        return languagesSpoken;
    }
    
    public void setLanguagesSpoken(List<String> languagesSpoken) {
        this.languagesSpoken = languagesSpoken;
    }
    
    public List<EducationInfo> getEducation() {
        return education;
    }
    
    public void setEducation(List<EducationInfo> education) {
        this.education = education;
    }
    
    public List<String> getAwards() {
        return awards;
    }
    
    public void setAwards(List<String> awards) {
        this.awards = awards;
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
    
    public List<DoctorCredentialDTO> getCredentials() {
        return credentials;
    }
    
    public void setCredentials(List<DoctorCredentialDTO> credentials) {
        this.credentials = credentials;
    }
    
    public List<DoctorReviewDTO> getRecentReviews() {
        return recentReviews;
    }
    
    public void setRecentReviews(List<DoctorReviewDTO> recentReviews) {
        this.recentReviews = recentReviews;
    }
    
    public DoctorStatisticsDTO getStatistics() {
        return statistics;
    }
    
    public void setStatistics(DoctorStatisticsDTO statistics) {
        this.statistics = statistics;
    }
    
    public String getFullName() {
        return firstName + " " + lastName;
    }
    
    // Nested class for education information
    public static class EducationInfo {
        private String degree;
        private String institution;
        private Integer year;
        
        public EducationInfo() {}
        
        public EducationInfo(String degree, String institution, Integer year) {
            this.degree = degree;
            this.institution = institution;
            this.year = year;
        }
        
        public String getDegree() {
            return degree;
        }
        
        public void setDegree(String degree) {
            this.degree = degree;
        }
        
        public String getInstitution() {
            return institution;
        }
        
        public void setInstitution(String institution) {
            this.institution = institution;
        }
        
        public Integer getYear() {
            return year;
        }
        
        public void setYear(Integer year) {
            this.year = year;
        }
    }
    
    @Override
    public String toString() {
        return "DoctorProfileResponse{" +
                "id=" + id +
                ", fullName='" + getFullName() + '\'' +
                ", specialty='" + specialty + '\'' +
                ", isVerified=" + isVerified +
                ", profileCompleteness=" + profileCompleteness +
                ", rating=" + rating +
                '}';
    }
}

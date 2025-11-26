package com.healthcare.appointmentsystem.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public class DoctorProfileRequest {
    
    @NotBlank(message = "Specialty is required")
    @Size(min = 2, max = 100, message = "Specialty must be between 2 and 100 characters")
    private String specialty;
    
    @NotBlank(message = "Qualifications are required")
    @Size(min = 10, max = 500, message = "Qualifications must be between 10 and 500 characters")
    private String qualifications;
    
    @Size(max = 1000, message = "Bio cannot exceed 1000 characters")
    private String bio;
    
    @NotNull(message = "Experience years is required")
    @Min(value = 0, message = "Experience years cannot be negative")
    @Max(value = 50, message = "Experience years cannot exceed 50")
    private Integer experienceYears;
    
    @Size(max = 20, message = "License number cannot exceed 20 characters")
    private String licenseNumber;
    
    @DecimalMin(value = "0.0", message = "Consultation fee cannot be negative")
    private BigDecimal consultationFee;
    
    @DecimalMin(value = "0.0", message = "Follow-up fee cannot be negative")
    private BigDecimal followUpFee;
    
    @DecimalMin(value = "0.0", message = "Emergency fee cannot be negative")
    private BigDecimal emergencyFee;
    
    @Min(value = 15, message = "Consultation duration must be at least 15 minutes")
    @Max(value = 240, message = "Consultation duration cannot exceed 240 minutes")
    private Integer consultationDuration;
    
    private List<String> languagesSpoken;
    
    private List<EducationDTO> education;
    
    private List<String> awards;
    
    private Boolean isAvailable;
    
    // Constructors
    public DoctorProfileRequest() {}
    
    // Getters and Setters
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
    
    public List<String> getLanguagesSpoken() {
        return languagesSpoken;
    }
    
    public void setLanguagesSpoken(List<String> languagesSpoken) {
        this.languagesSpoken = languagesSpoken;
    }
    
    public List<EducationDTO> getEducation() {
        return education;
    }
    
    public void setEducation(List<EducationDTO> education) {
        this.education = education;
    }
    
    public List<String> getAwards() {
        return awards;
    }
    
    public void setAwards(List<String> awards) {
        this.awards = awards;
    }
    
    public Boolean getIsAvailable() {
        return isAvailable;
    }
    
    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }
    
    // Nested DTO for education
    public static class EducationDTO {
        @NotBlank(message = "Degree is required")
        private String degree;
        
        @NotBlank(message = "Institution is required")
        private String institution;
        
        @NotNull(message = "Year is required")
        @Min(value = 1950, message = "Year must be after 1950")
        @Max(value = 2100, message = "Year must be before 2100")
        private Integer year;
        
        public EducationDTO() {}
        
        public EducationDTO(String degree, String institution, Integer year) {
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
        return "DoctorProfileRequest{" +
                "specialty='" + specialty + '\'' +
                ", experienceYears=" + experienceYears +
                ", consultationFee=" + consultationFee +
                ", isAvailable=" + isAvailable +
                '}';
    }
}

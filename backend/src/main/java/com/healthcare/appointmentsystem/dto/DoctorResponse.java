package com.healthcare.appointmentsystem.dto;

import com.healthcare.appointmentsystem.entity.Doctor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class DoctorResponse {
    
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
    private String avatarUrl;
    private Double rating;
    private Integer reviewCount;
    private String nextAvailableDate;
    private LocalDateTime createdAt;
    
    // Constructors
    public DoctorResponse() {}
    
    public DoctorResponse(Doctor doctor) {
        this.id = doctor.getId();
        this.firstName = doctor.getUser().getFirstName();
        this.lastName = doctor.getUser().getLastName();
        this.email = doctor.getUser().getEmail();
        this.specialty = doctor.getSpecialty();
        this.qualifications = doctor.getQualifications();
        this.bio = doctor.getBio();
        this.experienceYears = doctor.getExperienceYears();
        this.licenseNumber = doctor.getLicenseNumber();
        this.isAvailable = doctor.getIsAvailable();
        this.consultationFee = doctor.getConsultationFee();
        this.avatarUrl = doctor.getUser().getAvatarUrl();
        this.rating = doctor.getRating();
        this.reviewCount = doctor.getReviewCount();
        this.createdAt = doctor.getCreatedAt();
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
    
    public String getNextAvailableDate() {
        return nextAvailableDate;
    }
    
    public void setNextAvailableDate(String nextAvailableDate) {
        this.nextAvailableDate = nextAvailableDate;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getFullName() {
        return firstName + " " + lastName;
    }
}
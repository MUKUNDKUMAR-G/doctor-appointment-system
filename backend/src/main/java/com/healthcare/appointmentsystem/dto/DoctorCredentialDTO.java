package com.healthcare.appointmentsystem.dto;

import com.healthcare.appointmentsystem.entity.DoctorCredential;
import com.healthcare.appointmentsystem.entity.VerificationStatus;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class DoctorCredentialDTO {
    
    private Long id;
    
    @NotBlank(message = "Credential type is required")
    @Size(max = 50, message = "Credential type cannot exceed 50 characters")
    @Pattern(regexp = "^(LICENSE|CERTIFICATION|DEGREE|BOARD_CERTIFICATION|FELLOWSHIP|RESIDENCY|OTHER)$",
             message = "Credential type must be one of: LICENSE, CERTIFICATION, DEGREE, BOARD_CERTIFICATION, FELLOWSHIP, RESIDENCY, OTHER")
    private String credentialType;
    
    @NotBlank(message = "Document URL is required")
    @Size(max = 500, message = "Document URL cannot exceed 500 characters")
    private String documentUrl;
    
    @Size(max = 255, message = "Document name cannot exceed 255 characters")
    private String documentName;
    
    @NotNull(message = "Verification status is required")
    private VerificationStatus verificationStatus;
    
    @PastOrPresent(message = "Issue date cannot be in the future")
    private LocalDate issueDate;
    
    @Future(message = "Expiry date must be in the future")
    private LocalDate expiryDate;
    
    @Size(max = 255, message = "Issuing authority cannot exceed 255 characters")
    private String issuingAuthority;
    
    private LocalDateTime uploadedAt;
    private LocalDateTime updatedAt;
    
    // Computed fields
    private Boolean isExpired;
    private Boolean isVerified;
    
    // Constructors
    public DoctorCredentialDTO() {}
    
    public DoctorCredentialDTO(DoctorCredential credential) {
        this.id = credential.getId();
        this.credentialType = credential.getCredentialType();
        this.documentUrl = credential.getDocumentUrl();
        this.documentName = credential.getDocumentName();
        this.verificationStatus = credential.getVerificationStatus();
        this.issueDate = credential.getIssueDate();
        this.expiryDate = credential.getExpiryDate();
        this.issuingAuthority = credential.getIssuingAuthority();
        this.uploadedAt = credential.getUploadedAt();
        this.updatedAt = credential.getUpdatedAt();
        this.isExpired = credential.isExpired();
        this.isVerified = credential.isVerified();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getCredentialType() {
        return credentialType;
    }
    
    public void setCredentialType(String credentialType) {
        this.credentialType = credentialType;
    }
    
    public String getDocumentUrl() {
        return documentUrl;
    }
    
    public void setDocumentUrl(String documentUrl) {
        this.documentUrl = documentUrl;
    }
    
    public String getDocumentName() {
        return documentName;
    }
    
    public void setDocumentName(String documentName) {
        this.documentName = documentName;
    }
    
    public VerificationStatus getVerificationStatus() {
        return verificationStatus;
    }
    
    public void setVerificationStatus(VerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }
    
    public LocalDate getIssueDate() {
        return issueDate;
    }
    
    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }
    
    public LocalDate getExpiryDate() {
        return expiryDate;
    }
    
    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }
    
    public String getIssuingAuthority() {
        return issuingAuthority;
    }
    
    public void setIssuingAuthority(String issuingAuthority) {
        this.issuingAuthority = issuingAuthority;
    }
    
    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }
    
    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public Boolean getIsExpired() {
        return isExpired;
    }
    
    public void setIsExpired(Boolean isExpired) {
        this.isExpired = isExpired;
    }
    
    public Boolean getIsVerified() {
        return isVerified;
    }
    
    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }
    
    @Override
    public String toString() {
        return "DoctorCredentialDTO{" +
                "id=" + id +
                ", credentialType='" + credentialType + '\'' +
                ", verificationStatus=" + verificationStatus +
                ", issuingAuthority='" + issuingAuthority + '\'' +
                ", isExpired=" + isExpired +
                '}';
    }
}

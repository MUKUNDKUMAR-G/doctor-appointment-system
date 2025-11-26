package com.healthcare.appointmentsystem.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctor_credentials", indexes = {
    @Index(name = "idx_doctor_credentials_doctor_id", columnList = "doctor_id"),
    @Index(name = "idx_doctor_credentials_status", columnList = "verification_status")
})
public class DoctorCredential {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    @NotNull(message = "Doctor is required")
    private Doctor doctor;
    
    @Column(name = "credential_type", nullable = false, length = 50)
    @NotBlank(message = "Credential type is required")
    @Size(max = 50, message = "Credential type cannot exceed 50 characters")
    private String credentialType;
    
    @Column(name = "document_url", nullable = false, length = 500)
    @NotBlank(message = "Document URL is required")
    @Size(max = 500, message = "Document URL cannot exceed 500 characters")
    private String documentUrl;
    
    @Column(name = "document_name", length = 255)
    @Size(max = 255, message = "Document name cannot exceed 255 characters")
    private String documentName;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 20)
    @NotNull(message = "Verification status is required")
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;
    
    @Column(name = "issue_date")
    private LocalDate issueDate;
    
    @Column(name = "expiry_date")
    private LocalDate expiryDate;
    
    @Column(name = "issuing_authority", length = 255)
    @Size(max = 255, message = "Issuing authority cannot exceed 255 characters")
    private String issuingAuthority;
    
    @CreationTimestamp
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    public DoctorCredential() {}
    
    public DoctorCredential(Doctor doctor, String credentialType, String documentUrl) {
        this.doctor = doctor;
        this.credentialType = credentialType;
        this.documentUrl = documentUrl;
    }
    
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
    
    public boolean isExpired() {
        return expiryDate != null && expiryDate.isBefore(LocalDate.now());
    }
    
    public boolean isVerified() {
        return verificationStatus == VerificationStatus.VERIFIED;
    }
    
    @Override
    public String toString() {
        return "DoctorCredential{" +
                "id=" + id +
                ", credentialType='" + credentialType + '\'' +
                ", verificationStatus=" + verificationStatus +
                ", issuingAuthority='" + issuingAuthority + '\'' +
                '}';
    }
}

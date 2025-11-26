package com.healthcare.appointmentsystem.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public class CredentialUploadRequest {
    
    @NotBlank(message = "Credential type is required")
    @Size(max = 50, message = "Credential type cannot exceed 50 characters")
    @Pattern(regexp = "^(LICENSE|CERTIFICATION|DEGREE|BOARD_CERTIFICATION|FELLOWSHIP|RESIDENCY|OTHER)$",
             message = "Credential type must be one of: LICENSE, CERTIFICATION, DEGREE, BOARD_CERTIFICATION, FELLOWSHIP, RESIDENCY, OTHER")
    private String credentialType;
    
    @Size(max = 255, message = "Document name cannot exceed 255 characters")
    private String documentName;
    
    @PastOrPresent(message = "Issue date cannot be in the future")
    private LocalDate issueDate;
    
    @Future(message = "Expiry date must be in the future")
    private LocalDate expiryDate;
    
    @Size(max = 255, message = "Issuing authority cannot exceed 255 characters")
    private String issuingAuthority;
    
    // Note: The actual file will be handled separately via MultipartFile in the controller
    
    public CredentialUploadRequest() {}
    
    public String getCredentialType() {
        return credentialType;
    }
    
    public void setCredentialType(String credentialType) {
        this.credentialType = credentialType;
    }
    
    public String getDocumentName() {
        return documentName;
    }
    
    public void setDocumentName(String documentName) {
        this.documentName = documentName;
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
    
    @Override
    public String toString() {
        return "CredentialUploadRequest{" +
                "credentialType='" + credentialType + '\'' +
                ", documentName='" + documentName + '\'' +
                ", issuingAuthority='" + issuingAuthority + '\'' +
                '}';
    }
}

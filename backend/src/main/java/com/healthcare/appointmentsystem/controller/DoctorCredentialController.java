package com.healthcare.appointmentsystem.controller;

import com.healthcare.appointmentsystem.dto.CredentialUploadRequest;
import com.healthcare.appointmentsystem.dto.DoctorCredentialDTO;
import com.healthcare.appointmentsystem.entity.VerificationStatus;
import com.healthcare.appointmentsystem.service.DoctorCredentialService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * Controller for managing doctor credentials.
 * Handles credential CRUD operations, document uploads, and verification.
 */
@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DoctorCredentialController {
    
    @Autowired
    private DoctorCredentialService credentialService;
    
    /**
     * Get all credentials for a doctor
     * 
     * @param doctorId Doctor ID
     * @return List of credentials
     */
    @GetMapping("/{doctorId}/credentials")
    public ResponseEntity<List<DoctorCredentialDTO>> getDoctorCredentials(@PathVariable Long doctorId) {
        List<DoctorCredentialDTO> credentials = credentialService.getDoctorCredentials(doctorId)
                .stream()
                .map(DoctorCredentialDTO::new)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(credentials);
    }
    
    /**
     * Get a specific credential by ID
     * 
     * @param doctorId Doctor ID
     * @param credentialId Credential ID
     * @return Credential details
     */
    @GetMapping("/{doctorId}/credentials/{credentialId}")
    public ResponseEntity<DoctorCredentialDTO> getCredentialById(
            @PathVariable Long doctorId,
            @PathVariable Long credentialId) {
        
        DoctorCredentialDTO credential = credentialService.getCredentialById(credentialId)
                .map(DoctorCredentialDTO::new)
                .orElseThrow(() -> new IllegalArgumentException("Credential not found"));
        return ResponseEntity.ok(credential);
    }
    
    /**
     * Upload a new credential document
     * Only the doctor themselves can upload credentials
     * 
     * @param doctorId Doctor ID
     * @param file Credential document file
     * @param credentialType Type of credential
     * @param issuingAuthority Issuing authority
     * @param issueDate Issue date (optional)
     * @param expiryDate Expiry date (optional)
     * @return Created credential
     */
    @PostMapping(value = "/{doctorId}/credentials", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('DOCTOR') and @doctorService.isDoctorOwner(#doctorId, authentication.principal.username)")
    public ResponseEntity<?> uploadCredential(
            @PathVariable Long doctorId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("credentialType") String credentialType,
            @RequestParam(value = "issuingAuthority", required = false) String issuingAuthority,
            @RequestParam(value = "issueDate", required = false) String issueDate,
            @RequestParam(value = "expiryDate", required = false) String expiryDate) {
        
        // Validate file
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "File is empty"));
        }
        
        // Validate file type (PDF, images)
        String contentType = file.getContentType();
        if (contentType == null || 
            (!contentType.equals("application/pdf") && 
             !contentType.equals("image/jpeg") && 
             !contentType.equals("image/png") && 
             !contentType.equals("image/webp"))) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Invalid file type. Only PDF and images are allowed"));
        }
        
        // Validate file size (10MB max)
        if (file.getSize() > 10 * 1024 * 1024) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "File size exceeds 10MB limit"));
        }
        
        try {
            CredentialUploadRequest request = new CredentialUploadRequest();
            request.setCredentialType(credentialType);
            request.setIssuingAuthority(issuingAuthority);
            if (issueDate != null && !issueDate.trim().isEmpty()) {
                request.setIssueDate(java.time.LocalDate.parse(issueDate));
            }
            if (expiryDate != null && !expiryDate.trim().isEmpty()) {
                request.setExpiryDate(java.time.LocalDate.parse(expiryDate));
            }
            
            DoctorCredentialDTO credential = new DoctorCredentialDTO(
                    credentialService.uploadCredential(doctorId, request, file));
            return ResponseEntity.status(HttpStatus.CREATED).body(credential);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to upload credential: " + e.getMessage()));
        }
    }
    
    /**
     * Update credential information (not the document)
     * Only the doctor themselves can update their credentials
     * 
     * @param doctorId Doctor ID
     * @param credentialId Credential ID
     * @param request Update request
     * @return Updated credential
     */
    @PutMapping("/{doctorId}/credentials/{credentialId}")
    @PreAuthorize("hasRole('DOCTOR') and @doctorService.isDoctorOwner(#doctorId, authentication.principal.username)")
    public ResponseEntity<DoctorCredentialDTO> updateCredential(
            @PathVariable Long doctorId,
            @PathVariable Long credentialId,
            @Valid @RequestBody CredentialUploadRequest request) {
        
        DoctorCredentialDTO updatedCredential = new DoctorCredentialDTO(
                credentialService.updateCredential(credentialId, request));
        return ResponseEntity.ok(updatedCredential);
    }
    
    /**
     * Delete a credential
     * Only the doctor themselves can delete their credentials
     * 
     * @param doctorId Doctor ID
     * @param credentialId Credential ID
     * @return Success response
     */
    @DeleteMapping("/{doctorId}/credentials/{credentialId}")
    @PreAuthorize("hasRole('DOCTOR') and @doctorService.isDoctorOwner(#doctorId, authentication.principal.username)")
    public ResponseEntity<?> deleteCredential(
            @PathVariable Long doctorId,
            @PathVariable Long credentialId) {
        
        credentialService.deleteCredential(credentialId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Credential deleted successfully"));
    }
    
    /**
     * Verify a credential (Admin only)
     * 
     * @param doctorId Doctor ID
     * @param credentialId Credential ID
     * @return Updated credential
     */
    @PostMapping("/{doctorId}/credentials/{credentialId}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DoctorCredentialDTO> verifyCredential(
            @PathVariable Long doctorId,
            @PathVariable Long credentialId) {
        
        DoctorCredentialDTO credential = new DoctorCredentialDTO(
                credentialService.verifyCredential(credentialId));
        return ResponseEntity.ok(credential);
    }
    
    /**
     * Reject a credential (Admin only)
     * 
     * @param doctorId Doctor ID
     * @param credentialId Credential ID
     * @return Updated credential
     */
    @PostMapping("/{doctorId}/credentials/{credentialId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DoctorCredentialDTO> rejectCredential(
            @PathVariable Long doctorId,
            @PathVariable Long credentialId) {
        
        DoctorCredentialDTO credential = new DoctorCredentialDTO(
                credentialService.rejectCredential(credentialId));
        return ResponseEntity.ok(credential);
    }
    
    /**
     * Get all pending credentials for verification (Admin only)
     * 
     * @return List of pending credentials
     */
    @GetMapping("/credentials/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DoctorCredentialDTO>> getPendingCredentials() {
        List<DoctorCredentialDTO> credentials = credentialService.getCredentialsByStatus(VerificationStatus.PENDING)
                .stream()
                .map(DoctorCredentialDTO::new)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(credentials);
    }
}

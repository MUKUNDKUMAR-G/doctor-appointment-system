package com.healthcare.appointmentsystem.service;

import com.healthcare.appointmentsystem.dto.CredentialUploadRequest;
import com.healthcare.appointmentsystem.entity.Doctor;
import com.healthcare.appointmentsystem.entity.DoctorCredential;
import com.healthcare.appointmentsystem.entity.VerificationStatus;
import com.healthcare.appointmentsystem.repository.DoctorCredentialRepository;
import com.healthcare.appointmentsystem.repository.DoctorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class DoctorCredentialService {
    
    private static final Logger logger = LoggerFactory.getLogger(DoctorCredentialService.class);
    
    @Autowired
    private DoctorCredentialRepository credentialRepository;
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    /**
     * Get all credentials for a doctor
     */
    public List<DoctorCredential> getDoctorCredentials(Long doctorId) {
        return credentialRepository.findByDoctorId(doctorId);
    }
    
    /**
     * Get credential by ID
     */
    public Optional<DoctorCredential> getCredentialById(Long credentialId) {
        return credentialRepository.findById(credentialId);
    }
    
    /**
     * Get credentials by verification status
     */
    public List<DoctorCredential> getCredentialsByStatus(VerificationStatus status) {
        return credentialRepository.findByVerificationStatus(status);
    }
    
    /**
     * Get doctor credentials by status
     */
    public List<DoctorCredential> getDoctorCredentialsByStatus(Long doctorId, VerificationStatus status) {
        return credentialRepository.findByDoctorIdAndVerificationStatus(doctorId, status);
    }
    
    /**
     * Upload new credential
     */
    @Transactional
    public DoctorCredential uploadCredential(Long doctorId, CredentialUploadRequest request, MultipartFile file) 
            throws IOException {
        // Validate doctor exists
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found with id: " + doctorId));
        
        // Validate request
        validateCredentialRequest(request);
        
        // Store document file
        String documentUrl = fileStorageService.storeAvatar(file); // Reusing avatar storage for now
        
        // Create credential entity
        DoctorCredential credential = new DoctorCredential();
        credential.setDoctor(doctor);
        credential.setCredentialType(request.getCredentialType());
        credential.setDocumentUrl(documentUrl);
        credential.setDocumentName(file.getOriginalFilename());
        credential.setVerificationStatus(VerificationStatus.PENDING);
        credential.setIssueDate(request.getIssueDate());
        credential.setExpiryDate(request.getExpiryDate());
        credential.setIssuingAuthority(request.getIssuingAuthority());
        credential.setUploadedAt(LocalDateTime.now());
        credential.setUpdatedAt(LocalDateTime.now());
        
        // Save credential
        credential = credentialRepository.save(credential);
        
        logger.info("Credential uploaded for doctor {}: type={}, status=PENDING", 
                doctorId, request.getCredentialType());
        
        return credential;
    }
    
    /**
     * Update credential information (without file)
     */
    @Transactional
    public DoctorCredential updateCredential(Long credentialId, CredentialUploadRequest request) {
        DoctorCredential credential = credentialRepository.findById(credentialId)
                .orElseThrow(() -> new IllegalArgumentException("Credential not found with id: " + credentialId));
        
        // Validate request
        validateCredentialRequest(request);
        
        // Update fields
        if (request.getCredentialType() != null) {
            credential.setCredentialType(request.getCredentialType());
        }
        if (request.getIssueDate() != null) {
            credential.setIssueDate(request.getIssueDate());
        }
        if (request.getExpiryDate() != null) {
            credential.setExpiryDate(request.getExpiryDate());
        }
        if (request.getIssuingAuthority() != null) {
            credential.setIssuingAuthority(request.getIssuingAuthority());
        }
        
        credential.setUpdatedAt(LocalDateTime.now());
        
        return credentialRepository.save(credential);
    }
    
    /**
     * Delete credential
     */
    @Transactional
    public void deleteCredential(Long credentialId) {
        DoctorCredential credential = credentialRepository.findById(credentialId)
                .orElseThrow(() -> new IllegalArgumentException("Credential not found with id: " + credentialId));
        
        // Delete document file
        if (credential.getDocumentUrl() != null) {
            fileStorageService.deleteAvatar(credential.getDocumentUrl());
        }
        
        // Delete credential
        credentialRepository.delete(credential);
        
        logger.info("Credential deleted: id={}, doctorId={}", 
                credentialId, credential.getDoctor().getId());
    }
    
    /**
     * Verify credential (admin action)
     */
    @Transactional
    public DoctorCredential verifyCredential(Long credentialId) {
        DoctorCredential credential = credentialRepository.findById(credentialId)
                .orElseThrow(() -> new IllegalArgumentException("Credential not found with id: " + credentialId));
        
        credential.setVerificationStatus(VerificationStatus.VERIFIED);
        credential.setUpdatedAt(LocalDateTime.now());
        
        credential = credentialRepository.save(credential);
        
        // Update doctor verification status if this is their first verified credential
        updateDoctorVerificationStatus(credential.getDoctor().getId());
        
        logger.info("Credential verified: id={}, doctorId={}, type={}", 
                credentialId, credential.getDoctor().getId(), credential.getCredentialType());
        
        return credential;
    }
    
    /**
     * Reject credential (admin action)
     */
    @Transactional
    public DoctorCredential rejectCredential(Long credentialId) {
        DoctorCredential credential = credentialRepository.findById(credentialId)
                .orElseThrow(() -> new IllegalArgumentException("Credential not found with id: " + credentialId));
        
        credential.setVerificationStatus(VerificationStatus.REJECTED);
        credential.setUpdatedAt(LocalDateTime.now());
        
        credential = credentialRepository.save(credential);
        
        // Update doctor verification status
        updateDoctorVerificationStatus(credential.getDoctor().getId());
        
        logger.info("Credential rejected: id={}, doctorId={}, type={}", 
                credentialId, credential.getDoctor().getId(), credential.getCredentialType());
        
        return credential;
    }
    
    /**
     * Check for expiring credentials
     */
    public List<DoctorCredential> getExpiringCredentials(int daysAhead) {
        LocalDate currentDate = LocalDate.now();
        LocalDate expiryDate = currentDate.plusDays(daysAhead);
        return credentialRepository.findCredentialsExpiringSoon(currentDate, expiryDate);
    }
    
    /**
     * Check for expired credentials
     */
    public List<DoctorCredential> getExpiredCredentials() {
        return credentialRepository.findExpiredCredentials(LocalDate.now());
    }
    
    /**
     * Check if credential is expired
     */
    public boolean isCredentialExpired(Long credentialId) {
        return credentialRepository.findById(credentialId)
                .map(credential -> {
                    if (credential.getExpiryDate() == null) {
                        return false;
                    }
                    return credential.getExpiryDate().isBefore(LocalDate.now());
                })
                .orElse(false);
    }
    
    /**
     * Check if doctor has verified credentials
     */
    public boolean hasVerifiedCredentials(Long doctorId) {
        return credentialRepository.hasVerifiedCredentials(doctorId);
    }
    
    /**
     * Update doctor verification status based on credentials
     */
    @Transactional
    private void updateDoctorVerificationStatus(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found with id: " + doctorId));
        
        boolean hasVerified = credentialRepository.hasVerifiedCredentials(doctorId);
        
        if (hasVerified && !doctor.getIsVerified()) {
            doctor.setIsVerified(true);
            doctor.setVerificationDate(LocalDateTime.now());
            doctorRepository.save(doctor);
            logger.info("Doctor verified: id={}", doctorId);
        } else if (!hasVerified && doctor.getIsVerified()) {
            doctor.setIsVerified(false);
            doctor.setVerificationDate(null);
            doctorRepository.save(doctor);
            logger.info("Doctor verification removed: id={}", doctorId);
        }
    }
    
    /**
     * Validate credential request
     */
    private void validateCredentialRequest(CredentialUploadRequest request) {
        if (request.getCredentialType() == null || request.getCredentialType().trim().isEmpty()) {
            throw new IllegalArgumentException("Credential type is required");
        }
        
        // Validate dates
        if (request.getIssueDate() != null && request.getExpiryDate() != null) {
            if (request.getExpiryDate().isBefore(request.getIssueDate())) {
                throw new IllegalArgumentException("Expiry date cannot be before issue date");
            }
        }
        
        // Validate expiry date is not in the past
        if (request.getExpiryDate() != null && request.getExpiryDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot upload credential with past expiry date");
        }
    }
}

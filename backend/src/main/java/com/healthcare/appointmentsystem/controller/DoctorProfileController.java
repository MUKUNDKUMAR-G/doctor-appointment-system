package com.healthcare.appointmentsystem.controller;

import com.healthcare.appointmentsystem.dto.AvatarUploadResponse;
import com.healthcare.appointmentsystem.dto.DoctorProfileRequest;
import com.healthcare.appointmentsystem.dto.DoctorProfileResponse;
import com.healthcare.appointmentsystem.dto.ProfileCompletenessDTO;
import com.healthcare.appointmentsystem.service.DoctorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Controller for doctor profile management operations.
 * Handles profile CRUD, photo uploads, and profile completeness tracking.
 */
@RestController
@RequestMapping("/api/doctors/profile")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DoctorProfileController {
    
    @Autowired
    private DoctorService doctorService;
    
    /**
     * Get complete doctor profile with all details
     * 
     * @param id Doctor ID
     * @return Complete doctor profile response
     */
    @GetMapping("/{id}")
    public ResponseEntity<DoctorProfileResponse> getDoctorProfile(@PathVariable Long id) {
        DoctorProfileResponse profile = doctorService.getDoctorProfile(id);
        return ResponseEntity.ok(profile);
    }
    
    /**
     * Update doctor profile information
     * Only the doctor themselves can update their profile
     * 
     * @param id Doctor ID
     * @param request Profile update request
     * @return Updated doctor profile
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR') and @doctorService.isDoctorOwner(#id, authentication.principal.username)")
    public ResponseEntity<DoctorProfileResponse> updateDoctorProfile(
            @PathVariable Long id,
            @Valid @RequestBody DoctorProfileRequest request) {
        
        DoctorProfileResponse updatedProfile = doctorService.updateDoctorProfile(id, request);
        return ResponseEntity.ok(updatedProfile);
    }
    
    /**
     * Upload doctor profile photo
     * Only the doctor themselves can upload their photo
     * 
     * @param id Doctor ID
     * @param file Profile photo file
     * @return Avatar upload response with URL
     */
    @PostMapping(value = "/{id}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('DOCTOR') and @doctorService.isDoctorOwner(#id, authentication.principal.username)")
    public ResponseEntity<AvatarUploadResponse> uploadProfilePhoto(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        
        // Validate file
        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(AvatarUploadResponse.failure("File is empty"));
        }
        
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || 
            (!contentType.equals("image/jpeg") && 
             !contentType.equals("image/png") && 
             !contentType.equals("image/webp"))) {
            return ResponseEntity.badRequest()
                    .body(AvatarUploadResponse.failure("Invalid file type. Only JPEG, PNG, and WebP are allowed"));
        }
        
        // Validate file size (5MB max)
        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest()
                    .body(AvatarUploadResponse.failure("File size exceeds 5MB limit"));
        }
        
        try {
            String avatarUrl = doctorService.uploadProfilePhoto(id, file);
            return ResponseEntity.ok(AvatarUploadResponse.success(avatarUrl));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(AvatarUploadResponse.failure("Failed to upload photo: " + e.getMessage()));
        }
    }
    
    /**
     * Get profile completeness information
     * 
     * @param id Doctor ID
     * @return Profile completeness details
     */
    @GetMapping("/{id}/completeness")
    @PreAuthorize("hasRole('DOCTOR') and @doctorService.isDoctorOwner(#id, authentication.principal.username)")
    public ResponseEntity<ProfileCompletenessDTO> getProfileCompleteness(@PathVariable Long id) {
        ProfileCompletenessDTO completeness = doctorService.calculateProfileCompleteness(id);
        return ResponseEntity.ok(completeness);
    }
    
    /**
     * Check if the authenticated user is the owner of the doctor profile
     * This method is used by Spring Security's @PreAuthorize
     */
    public boolean isDoctorOwner(Long doctorId, String username) {
        return doctorService.isDoctorOwner(doctorId, username);
    }
}

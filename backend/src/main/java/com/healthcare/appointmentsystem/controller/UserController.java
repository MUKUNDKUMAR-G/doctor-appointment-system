package com.healthcare.appointmentsystem.controller;

import com.healthcare.appointmentsystem.dto.ChangePasswordRequest;
import com.healthcare.appointmentsystem.dto.UserResponse;
import com.healthcare.appointmentsystem.entity.User;
import com.healthcare.appointmentsystem.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private com.healthcare.appointmentsystem.service.FileStorageService fileStorageService;
    
    /**
     * Get current user's profile
     */
    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getCurrentUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        Optional<User> userOptional = userRepository.findByEmail(email);
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            UserResponse response = new UserResponse();
            response.setId(user.getId());
            response.setEmail(user.getEmail());
            response.setFirstName(user.getFirstName());
            response.setLastName(user.getLastName());
            response.setPhoneNumber(user.getPhoneNumber());
            response.setAvatarUrl(user.getAvatarUrl());
            response.setRole(user.getRole().name());
            response.setCreatedAt(user.getCreatedAt());
            
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Update current user's profile
     */
    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateCurrentUserProfile(@RequestBody UserResponse updateRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        Optional<User> userOptional = userRepository.findByEmail(email);
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            
            // Update allowed fields
            if (updateRequest.getFirstName() != null) {
                user.setFirstName(updateRequest.getFirstName());
            }
            if (updateRequest.getLastName() != null) {
                user.setLastName(updateRequest.getLastName());
            }
            if (updateRequest.getPhoneNumber() != null) {
                user.setPhoneNumber(updateRequest.getPhoneNumber());
            }
            
            User savedUser = userRepository.save(user);
            
            UserResponse response = new UserResponse();
            response.setId(savedUser.getId());
            response.setEmail(savedUser.getEmail());
            response.setFirstName(savedUser.getFirstName());
            response.setLastName(savedUser.getLastName());
            response.setPhoneNumber(savedUser.getPhoneNumber());
            response.setAvatarUrl(savedUser.getAvatarUrl());
            response.setRole(savedUser.getRole().name());
            response.setCreatedAt(savedUser.getCreatedAt());
            
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Upload user avatar
     */
    @PostMapping("/profile/avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            Optional<User> userOptional = userRepository.findByEmail(email);
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            User user = userOptional.get();
            
            // Delete old avatar if exists
            if (user.getAvatarUrl() != null) {
                fileStorageService.deleteAvatar(user.getAvatarUrl());
            }
            
            // Store new avatar
            String avatarUrl = fileStorageService.storeAvatar(file);
            user.setAvatarUrl(avatarUrl);
            userRepository.save(user);
            
            return ResponseEntity.ok(Map.of("avatarUrl", avatarUrl));
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Failed to upload avatar: " + e.getMessage()));
        }
    }
    
    /**
     * Delete user avatar
     */
    @DeleteMapping("/profile/avatar")
    public ResponseEntity<?> deleteAvatar() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        Optional<User> userOptional = userRepository.findByEmail(email);
        
        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOptional.get();
        
        if (user.getAvatarUrl() != null) {
            fileStorageService.deleteAvatar(user.getAvatarUrl());
            user.setAvatarUrl(null);
            userRepository.save(user);
        }
        
        return ResponseEntity.ok(Map.of("message", "Avatar deleted successfully"));
    }
    
    /**
     * Change current user's password
     */
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        Optional<User> userOptional = userRepository.findByEmail(email);
        
        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOptional.get();
        
        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Current password is incorrect"));
        }
        
        // Validate new password strength
        if (!isPasswordStrong(request.getNewPassword())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character"));
        }
        
        // Update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
    
    /**
     * Validate password strength
     */
    private boolean isPasswordStrong(String password) {
        // At least 8 characters, one uppercase, one lowercase, one digit, one special character
        String passwordPattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
        return password.matches(passwordPattern);
    }
}

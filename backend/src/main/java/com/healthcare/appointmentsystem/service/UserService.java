package com.healthcare.appointmentsystem.service;

import com.healthcare.appointmentsystem.dto.RegisterRequest;
import com.healthcare.appointmentsystem.entity.User;
import com.healthcare.appointmentsystem.entity.UserRole;
import com.healthcare.appointmentsystem.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.regex.Pattern;

@Service
@Transactional
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    // Password validation patterns
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
    );
    
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})$"
    );

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User createUser(RegisterRequest request) {
        logger.info("Creating user with email: {}", request.getEmail());
        
        // Validate input
        validateUserInput(request);
        
        // Check if user already exists
        if (userRepository.findByEmail(request.getEmail().toLowerCase()).isPresent()) {
            throw new IllegalArgumentException("User with email " + request.getEmail() + " already exists");
        }

        // Validate password strength
        if (!isPasswordValid(request.getPassword())) {
            throw new IllegalArgumentException("Password must contain at least 8 characters including uppercase, lowercase, digit, and special character");
        }

        try {
            // Create new user
            User user = new User();
            user.setEmail(request.getEmail().toLowerCase().trim());
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            user.setFirstName(request.getFirstName().trim());
            user.setLastName(request.getLastName().trim());
            user.setPhoneNumber(request.getPhoneNumber().trim());
            user.setRole(request.getRole() != null ? request.getRole() : UserRole.PATIENT);
            user.setEnabled(true);
            user.setAccountNonExpired(true);
            user.setAccountNonLocked(true);
            user.setCredentialsNonExpired(true);

            User savedUser = userRepository.save(user);
            logger.info("User created successfully with ID: {} and email: {}", savedUser.getId(), savedUser.getEmail());
            return savedUser;
        } catch (Exception e) {
            logger.error("Error creating user with email {}: {}", request.getEmail(), e.getMessage());
            throw new RuntimeException("Failed to create user. Please try again.");
        }
    }

    public Optional<User> findByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return Optional.empty();
        }
        return userRepository.findByEmail(email.toLowerCase().trim());
    }

    public User findById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
    }

    public boolean validatePassword(String rawPassword, String encodedPassword) {
        if (rawPassword == null || encodedPassword == null) {
            return false;
        }
        try {
            return passwordEncoder.matches(rawPassword, encodedPassword);
        } catch (Exception e) {
            logger.error("Error validating password: {}", e.getMessage());
            return false;
        }
    }

    public boolean isPasswordValid(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        return PASSWORD_PATTERN.matcher(password).matches();
    }

    public User updateUser(User user) {
        if (user == null || user.getId() == null) {
            throw new IllegalArgumentException("User and user ID cannot be null");
        }
        
        // Ensure user exists
        findById(user.getId());
        
        try {
            return userRepository.save(user);
        } catch (Exception e) {
            logger.error("Error updating user with ID {}: {}", user.getId(), e.getMessage());
            throw new RuntimeException("Failed to update user. Please try again.");
        }
    }

    public void deleteUser(Long id) {
        User user = findById(id);
        try {
            userRepository.delete(user);
            logger.info("User deleted successfully with ID: {}", id);
        } catch (Exception e) {
            logger.error("Error deleting user with ID {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to delete user. Please try again.");
        }
    }

    public boolean existsByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return userRepository.findByEmail(email.toLowerCase().trim()).isPresent();
    }

    public User changePassword(Long userId, String currentPassword, String newPassword) {
        User user = findById(userId);
        
        // Validate current password
        if (!validatePassword(currentPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        
        // Validate new password
        if (!isPasswordValid(newPassword)) {
            throw new IllegalArgumentException("New password must contain at least 8 characters including uppercase, lowercase, digit, and special character");
        }
        
        // Update password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        return updateUser(user);
    }

    public void lockUser(Long userId) {
        User user = findById(userId);
        user.setAccountNonLocked(false);
        updateUser(user);
        logger.info("User account locked for ID: {}", userId);
    }

    public void unlockUser(Long userId) {
        User user = findById(userId);
        user.setAccountNonLocked(true);
        updateUser(user);
        logger.info("User account unlocked for ID: {}", userId);
    }

    public void disableUser(Long userId) {
        User user = findById(userId);
        user.setEnabled(false);
        updateUser(user);
        logger.info("User account disabled for ID: {}", userId);
    }

    public void enableUser(Long userId) {
        User user = findById(userId);
        user.setEnabled(true);
        updateUser(user);
        logger.info("User account enabled for ID: {}", userId);
    }

    private void validateUserInput(RegisterRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Registration request cannot be null");
        }
        
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        
        if (!EMAIL_PATTERN.matcher(request.getEmail()).matches()) {
            throw new IllegalArgumentException("Invalid email format");
        }
        
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Password is required");
        }
        
        if (request.getFirstName() == null || request.getFirstName().trim().isEmpty()) {
            throw new IllegalArgumentException("First name is required");
        }
        
        if (request.getLastName() == null || request.getLastName().trim().isEmpty()) {
            throw new IllegalArgumentException("Last name is required");
        }
        
        if (request.getPhoneNumber() == null || request.getPhoneNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Phone number is required");
        }
    }
}
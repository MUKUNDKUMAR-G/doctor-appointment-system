package com.healthcare.appointmentsystem.controller;

import com.healthcare.appointmentsystem.dto.AuthRequest;
import com.healthcare.appointmentsystem.dto.AuthResponse;
import com.healthcare.appointmentsystem.dto.RefreshTokenRequest;
import com.healthcare.appointmentsystem.dto.RegisterRequest;
import com.healthcare.appointmentsystem.service.AuthenticationService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationService authenticationService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request, BindingResult bindingResult) {
        logger.info("Registration attempt for email: {}", request.getEmail());
        
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error -> 
                errors.put(error.getField(), error.getDefaultMessage())
            );
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            AuthResponse response = authenticationService.register(request);
            logger.info("User registered successfully with email: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            logger.warn("Registration failed for email {}: {}", request.getEmail(), e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            logger.error("Unexpected error during registration for email {}: {}", request.getEmail(), e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Registration failed. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request, BindingResult bindingResult) {
        logger.info("Login attempt for email: {}", request.getEmail());
        
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error -> 
                errors.put(error.getField(), error.getDefaultMessage())
            );
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            AuthResponse response = authenticationService.authenticate(request);
            logger.info("User logged in successfully with email: {}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warn("Login failed for email {}: {}", request.getEmail(), e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        } catch (Exception e) {
            logger.error("Unexpected error during login for email {}: {}", request.getEmail(), e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Login failed. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequest request, BindingResult bindingResult) {
        logger.info("Token refresh attempt");
        
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error -> 
                errors.put(error.getField(), error.getDefaultMessage())
            );
            return ResponseEntity.badRequest().body(errors);
        }

        try {
            AuthResponse response = authenticationService.refreshToken(request.getRefreshToken());
            logger.info("Token refreshed successfully");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warn("Token refresh failed: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        } catch (Exception e) {
            logger.error("Unexpected error during token refresh: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Token refresh failed. Please login again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        logger.info("Logout request received");
        // In a stateless JWT implementation, logout is handled client-side
        // by removing the token from storage
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken() {
        // This endpoint can be used by the frontend to validate if the current token is still valid
        // The actual validation is done by the JWT filter
        Map<String, String> response = new HashMap<>();
        response.put("message", "Token is valid");
        return ResponseEntity.ok(response);
    }
}
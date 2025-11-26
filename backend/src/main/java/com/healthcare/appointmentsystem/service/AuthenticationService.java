package com.healthcare.appointmentsystem.service;

import com.healthcare.appointmentsystem.dto.AuthRequest;
import com.healthcare.appointmentsystem.dto.AuthResponse;
import com.healthcare.appointmentsystem.dto.RegisterRequest;
import com.healthcare.appointmentsystem.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@Transactional
public class AuthenticationService {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationService.class);

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        logger.info("Processing registration for email: {}", request.getEmail());
        
        try {
            // Create user through UserService (includes validation)
            User user = userService.createUser(request);

            // Generate tokens with additional claims
            Map<String, Object> extraClaims = new HashMap<>();
            extraClaims.put("role", user.getRole().name());
            extraClaims.put("userId", user.getId());
            extraClaims.put("fullName", user.getFullName());

            String accessToken = jwtService.generateToken(extraClaims, user);
            String refreshToken = jwtService.generateRefreshToken(user);

            logger.info("Registration successful for user ID: {}", user.getId());

            return new AuthResponse(
                    accessToken,
                    refreshToken,
                    user.getId(),
                    user.getEmail(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getRole()
            );
        } catch (IllegalArgumentException e) {
            logger.warn("Registration failed for email {}: {}", request.getEmail(), e.getMessage());
            throw e; // Re-throw validation errors
        } catch (Exception e) {
            logger.error("Unexpected error during registration for email {}: {}", request.getEmail(), e.getMessage());
            throw new RuntimeException("Registration failed. Please try again.");
        }
    }

    public AuthResponse authenticate(AuthRequest request) {
        logger.info("Processing authentication for email: {}", request.getEmail());
        
        try {
            // Validate input
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                throw new IllegalArgumentException("Email is required");
            }
            if (request.getPassword() == null || request.getPassword().isEmpty()) {
                throw new IllegalArgumentException("Password is required");
            }

            // Check if user exists and is enabled
            User user = userService.findByEmail(request.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

            if (!user.isEnabled()) {
                throw new IllegalArgumentException("Account is disabled. Please contact support.");
            }

            if (!user.isAccountNonLocked()) {
                throw new IllegalArgumentException("Account is locked. Please contact support.");
            }

            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail().toLowerCase().trim(),
                            request.getPassword()
                    )
            );

            // Get authenticated user details
            User authenticatedUser = (User) authentication.getPrincipal();

            // Generate tokens with additional claims
            Map<String, Object> extraClaims = new HashMap<>();
            extraClaims.put("role", authenticatedUser.getRole().name());
            extraClaims.put("userId", authenticatedUser.getId());
            extraClaims.put("fullName", authenticatedUser.getFullName());
            extraClaims.put("loginTime", LocalDateTime.now().toString());

            String accessToken = jwtService.generateToken(extraClaims, authenticatedUser);
            String refreshToken = jwtService.generateRefreshToken(authenticatedUser);

            logger.info("Authentication successful for user ID: {}", authenticatedUser.getId());

            return new AuthResponse(
                    accessToken,
                    refreshToken,
                    authenticatedUser.getId(),
                    authenticatedUser.getEmail(),
                    authenticatedUser.getFirstName(),
                    authenticatedUser.getLastName(),
                    authenticatedUser.getRole()
            );

        } catch (BadCredentialsException e) {
            logger.warn("Authentication failed for email {}: Invalid credentials", request.getEmail());
            throw new IllegalArgumentException("Invalid email or password");
        } catch (DisabledException e) {
            logger.warn("Authentication failed for email {}: Account disabled", request.getEmail());
            throw new IllegalArgumentException("Account is disabled. Please contact support.");
        } catch (LockedException e) {
            logger.warn("Authentication failed for email {}: Account locked", request.getEmail());
            throw new IllegalArgumentException("Account is locked. Please contact support.");
        } catch (IllegalArgumentException e) {
            // Re-throw validation errors
            throw e;
        } catch (AuthenticationException e) {
            logger.warn("Authentication failed for email {}: {}", request.getEmail(), e.getMessage());
            throw new IllegalArgumentException("Invalid email or password");
        } catch (Exception e) {
            logger.error("Unexpected error during authentication for email {}: {}", request.getEmail(), e.getMessage());
            throw new RuntimeException("Authentication failed. Please try again.");
        }
    }

    public AuthResponse refreshToken(String refreshToken) {
        logger.info("Processing token refresh");
        
        try {
            if (refreshToken == null || refreshToken.trim().isEmpty()) {
                throw new IllegalArgumentException("Refresh token is required");
            }

            // Extract username from refresh token
            String userEmail = jwtService.extractUsername(refreshToken);
            
            if (userEmail == null || userEmail.trim().isEmpty()) {
                throw new IllegalArgumentException("Invalid refresh token");
            }

            // Find user
            User user = userService.findByEmail(userEmail)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            // Check if user is still active
            if (!user.isEnabled()) {
                throw new IllegalArgumentException("Account is disabled");
            }

            if (!user.isAccountNonLocked()) {
                throw new IllegalArgumentException("Account is locked");
            }

            // Validate refresh token
            if (!jwtService.isTokenValid(refreshToken, user)) {
                throw new IllegalArgumentException("Invalid or expired refresh token");
            }

            // Generate new tokens with additional claims
            Map<String, Object> extraClaims = new HashMap<>();
            extraClaims.put("role", user.getRole().name());
            extraClaims.put("userId", user.getId());
            extraClaims.put("fullName", user.getFullName());
            extraClaims.put("refreshTime", LocalDateTime.now().toString());

            String newAccessToken = jwtService.generateToken(extraClaims, user);
            String newRefreshToken = jwtService.generateRefreshToken(user);

            logger.info("Token refresh successful for user ID: {}", user.getId());

            return new AuthResponse(
                    newAccessToken,
                    newRefreshToken,
                    user.getId(),
                    user.getEmail(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getRole()
            );

        } catch (IllegalArgumentException e) {
            logger.warn("Token refresh failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error during token refresh: {}", e.getMessage());
            throw new IllegalArgumentException("Invalid refresh token");
        }
    }

    public boolean validateToken(String token) {
        try {
            if (token == null || token.trim().isEmpty()) {
                return false;
            }

            String userEmail = jwtService.extractUsername(token);
            if (userEmail == null) {
                return false;
            }

            User user = userService.findByEmail(userEmail).orElse(null);
            if (user == null) {
                return false;
            }

            return jwtService.isTokenValid(token, user) && user.isEnabled() && user.isAccountNonLocked();
        } catch (Exception e) {
            logger.debug("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    public void invalidateUserSessions(Long userId) {
        // In a stateless JWT implementation, we can't directly invalidate tokens
        // This method could be used to mark tokens as invalid in a blacklist
        // For now, we'll just log the action
        logger.info("Session invalidation requested for user ID: {}", userId);
        // Implementation would depend on token blacklisting strategy
    }
}
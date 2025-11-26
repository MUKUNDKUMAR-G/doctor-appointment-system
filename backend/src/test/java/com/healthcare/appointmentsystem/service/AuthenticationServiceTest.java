package com.healthcare.appointmentsystem.service;

import com.healthcare.appointmentsystem.dto.AuthRequest;
import com.healthcare.appointmentsystem.dto.AuthResponse;
import com.healthcare.appointmentsystem.dto.RegisterRequest;
import com.healthcare.appointmentsystem.entity.User;
import com.healthcare.appointmentsystem.entity.UserRole;
import com.healthcare.appointmentsystem.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AuthenticationServiceTest {

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private RegisterRequest validRegisterRequest;
    private AuthRequest validAuthRequest;

    @BeforeEach
    void setUp() {
        // Clean up database
        userRepository.deleteAll();

        // Create valid test data
        validRegisterRequest = new RegisterRequest();
        validRegisterRequest.setEmail("test@example.com");
        validRegisterRequest.setPassword("TestPass123!");
        validRegisterRequest.setFirstName("John");
        validRegisterRequest.setLastName("Doe");
        validRegisterRequest.setPhoneNumber("+1234567890");
        validRegisterRequest.setRole(UserRole.PATIENT);

        validAuthRequest = new AuthRequest();
        validAuthRequest.setEmail("test@example.com");
        validAuthRequest.setPassword("TestPass123!");
    }

    @Test
    void testSuccessfulRegistration() {
        // When
        AuthResponse response = authenticationService.register(validRegisterRequest);

        // Then
        assertNotNull(response);
        assertNotNull(response.getAccessToken());
        assertNotNull(response.getRefreshToken());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("John", response.getFirstName());
        assertEquals("Doe", response.getLastName());
        assertEquals(UserRole.PATIENT, response.getRole());
        assertNotNull(response.getUserId());

        // Verify user was created in database
        assertTrue(userService.existsByEmail("test@example.com"));
    }

    @Test
    void testRegistrationWithDuplicateEmail() {
        // Given - register first user
        authenticationService.register(validRegisterRequest);

        // When & Then - try to register with same email
        RegisterRequest duplicateRequest = new RegisterRequest();
        duplicateRequest.setEmail("test@example.com");
        duplicateRequest.setPassword("AnotherPass123!");
        duplicateRequest.setFirstName("Jane");
        duplicateRequest.setLastName("Smith");
        duplicateRequest.setPhoneNumber("+0987654321");
        duplicateRequest.setRole(UserRole.PATIENT);

        assertThrows(IllegalArgumentException.class, () -> {
            authenticationService.register(duplicateRequest);
        });
    }

    @Test
    void testRegistrationWithWeakPassword() {
        // Given
        validRegisterRequest.setPassword("weak");

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            authenticationService.register(validRegisterRequest);
        });
    }

    @Test
    void testSuccessfulAuthentication() {
        // Given - register user first
        authenticationService.register(validRegisterRequest);

        // When
        AuthResponse response = authenticationService.authenticate(validAuthRequest);

        // Then
        assertNotNull(response);
        assertNotNull(response.getAccessToken());
        assertNotNull(response.getRefreshToken());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("John", response.getFirstName());
        assertEquals("Doe", response.getLastName());
        assertEquals(UserRole.PATIENT, response.getRole());
    }

    @Test
    void testAuthenticationWithInvalidEmail() {
        // Given
        validAuthRequest.setEmail("nonexistent@example.com");

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            authenticationService.authenticate(validAuthRequest);
        });
    }

    @Test
    void testAuthenticationWithInvalidPassword() {
        // Given - register user first
        authenticationService.register(validRegisterRequest);
        validAuthRequest.setPassword("wrongpassword");

        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            authenticationService.authenticate(validAuthRequest);
        });
    }

    @Test
    void testRefreshTokenFunctionality() {
        // Given - register and authenticate user
        AuthResponse initialResponse = authenticationService.register(validRegisterRequest);
        String refreshToken = initialResponse.getRefreshToken();

        // When
        AuthResponse refreshedResponse = authenticationService.refreshToken(refreshToken);

        // Then
        assertNotNull(refreshedResponse);
        assertNotNull(refreshedResponse.getAccessToken());
        assertNotNull(refreshedResponse.getRefreshToken());
        assertEquals(initialResponse.getEmail(), refreshedResponse.getEmail());
        assertEquals(initialResponse.getUserId(), refreshedResponse.getUserId());
        
        // Tokens should be different (new ones generated)
        assertNotEquals(initialResponse.getAccessToken(), refreshedResponse.getAccessToken());
    }

    @Test
    void testRefreshTokenWithInvalidToken() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            authenticationService.refreshToken("invalid.token.here");
        });
    }

    @Test
    void testRefreshTokenWithEmptyToken() {
        // When & Then
        assertThrows(IllegalArgumentException.class, () -> {
            authenticationService.refreshToken("");
        });
    }

    @Test
    void testPasswordValidation() {
        // Test valid password
        assertTrue(userService.isPasswordValid("ValidPass123!"));
        
        // Test invalid passwords
        assertFalse(userService.isPasswordValid("short"));
        assertFalse(userService.isPasswordValid("nouppercase123!"));
        assertFalse(userService.isPasswordValid("NOLOWERCASE123!"));
        assertFalse(userService.isPasswordValid("NoNumbers!"));
        assertFalse(userService.isPasswordValid("NoSpecialChars123"));
    }

    @Test
    void testUserCreationWithValidData() {
        // When
        User user = userService.createUser(validRegisterRequest);

        // Then
        assertNotNull(user);
        assertNotNull(user.getId());
        assertEquals("test@example.com", user.getEmail());
        assertEquals("John", user.getFirstName());
        assertEquals("Doe", user.getLastName());
        assertEquals("+1234567890", user.getPhoneNumber());
        assertEquals(UserRole.PATIENT, user.getRole());
        assertTrue(user.isEnabled());
        assertTrue(user.isAccountNonLocked());
        assertTrue(user.isAccountNonExpired());
        assertTrue(user.isCredentialsNonExpired());
        
        // Password should be encoded
        assertNotEquals(validRegisterRequest.getPassword(), user.getPasswordHash());
        assertTrue(passwordEncoder.matches(validRegisterRequest.getPassword(), user.getPasswordHash()));
    }

    @Test
    void testEmailCaseInsensitivity() {
        // Given - register with lowercase email
        authenticationService.register(validRegisterRequest);

        // When - authenticate with uppercase email
        validAuthRequest.setEmail("TEST@EXAMPLE.COM");
        AuthResponse response = authenticationService.authenticate(validAuthRequest);

        // Then
        assertNotNull(response);
        assertEquals("test@example.com", response.getEmail()); // Should be stored as lowercase
    }
}
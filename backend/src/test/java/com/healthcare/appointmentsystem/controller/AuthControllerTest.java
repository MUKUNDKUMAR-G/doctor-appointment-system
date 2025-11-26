package com.healthcare.appointmentsystem.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.appointmentsystem.dto.AuthRequest;
import com.healthcare.appointmentsystem.dto.RegisterRequest;
import com.healthcare.appointmentsystem.dto.RefreshTokenRequest;
import com.healthcare.appointmentsystem.entity.UserRole;
import com.healthcare.appointmentsystem.repository.UserRepository;
import com.healthcare.appointmentsystem.service.AuthenticationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
class AuthControllerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthenticationService authenticationService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        objectMapper = new ObjectMapper();
        userRepository.deleteAll();
    }

    @Test
    void testSuccessfulRegistration() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setPassword("TestPass123!");
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPhoneNumber("+1234567890");
        request.setRole(UserRole.PATIENT);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.lastName").value("Doe"))
                .andExpect(jsonPath("$.role").value("PATIENT"));
    }

    @Test
    void testRegistrationWithInvalidEmail() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("invalid-email");
        request.setPassword("TestPass123!");
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPhoneNumber("+1234567890");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.email").exists());
    }

    @Test
    void testRegistrationWithWeakPassword() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setPassword("weak");
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPhoneNumber("+1234567890");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.password").exists());
    }

    @Test
    void testRegistrationWithMissingFields() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        // Missing required fields

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testSuccessfulLogin() throws Exception {
        // First register a user
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("TestPass123!");
        registerRequest.setFirstName("John");
        registerRequest.setLastName("Doe");
        registerRequest.setPhoneNumber("+1234567890");
        registerRequest.setRole(UserRole.PATIENT);
        
        authenticationService.register(registerRequest);

        // Then try to login
        AuthRequest loginRequest = new AuthRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("TestPass123!");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.lastName").value("Doe"));
    }

    @Test
    void testLoginWithInvalidCredentials() throws Exception {
        AuthRequest request = new AuthRequest();
        request.setEmail("nonexistent@example.com");
        request.setPassword("wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void testLoginWithInvalidEmail() throws Exception {
        AuthRequest request = new AuthRequest();
        request.setEmail("invalid-email");
        request.setPassword("TestPass123!");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.email").exists());
    }

    @Test
    void testRefreshToken() throws Exception {
        // First register and get tokens
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("TestPass123!");
        registerRequest.setFirstName("John");
        registerRequest.setLastName("Doe");
        registerRequest.setPhoneNumber("+1234567890");
        registerRequest.setRole(UserRole.PATIENT);
        
        var authResponse = authenticationService.register(registerRequest);

        // Then refresh token
        RefreshTokenRequest refreshRequest = new RefreshTokenRequest();
        refreshRequest.setRefreshToken(authResponse.getRefreshToken());

        mockMvc.perform(post("/api/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void testRefreshTokenWithInvalidToken() throws Exception {
        RefreshTokenRequest request = new RefreshTokenRequest();
        request.setRefreshToken("invalid.token.here");

        mockMvc.perform(post("/api/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void testLogout() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out successfully"));
    }

    @Test
    void testValidateTokenEndpoint() throws Exception {
        mockMvc.perform(get("/api/auth/validate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Token is valid"));
    }
}
package com.healthcare.appointmentsystem.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthcare.appointmentsystem.dto.AuthRequest;
import com.healthcare.appointmentsystem.dto.AuthResponse;
import com.healthcare.appointmentsystem.dto.RegisterRequest;
import com.healthcare.appointmentsystem.dto.RefreshTokenRequest;
import com.healthcare.appointmentsystem.entity.UserRole;
import com.healthcare.appointmentsystem.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
class AuthenticationIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private UserRepository userRepository;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        objectMapper = new ObjectMapper();
        userRepository.deleteAll();
    }

    @Test
    void testCompleteAuthenticationFlow() throws Exception {
        // Step 1: Register a new user
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setEmail("integration@test.com");
        registerRequest.setPassword("IntegrationTest123!");
        registerRequest.setFirstName("Integration");
        registerRequest.setLastName("Test");
        registerRequest.setPhoneNumber("+1234567890");
        registerRequest.setRole(UserRole.PATIENT);

        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.email").value("integration@test.com"))
                .andReturn();

        String registerResponseJson = registerResult.getResponse().getContentAsString();
        AuthResponse registerResponse = objectMapper.readValue(registerResponseJson, AuthResponse.class);

        assertNotNull(registerResponse.getAccessToken());
        assertNotNull(registerResponse.getRefreshToken());
        assertEquals("integration@test.com", registerResponse.getEmail());

        // Step 2: Login with the registered user
        AuthRequest loginRequest = new AuthRequest();
        loginRequest.setEmail("integration@test.com");
        loginRequest.setPassword("IntegrationTest123!");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.email").value("integration@test.com"))
                .andReturn();

        String loginResponseJson = loginResult.getResponse().getContentAsString();
        AuthResponse loginResponse = objectMapper.readValue(loginResponseJson, AuthResponse.class);

        assertNotNull(loginResponse.getAccessToken());
        assertNotNull(loginResponse.getRefreshToken());
        assertEquals(registerResponse.getUserId(), loginResponse.getUserId());

        // Step 3: Use refresh token to get new access token
        RefreshTokenRequest refreshRequest = new RefreshTokenRequest();
        refreshRequest.setRefreshToken(loginResponse.getRefreshToken());

        MvcResult refreshResult = mockMvc.perform(post("/api/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.email").value("integration@test.com"))
                .andReturn();

        String refreshResponseJson = refreshResult.getResponse().getContentAsString();
        AuthResponse refreshResponse = objectMapper.readValue(refreshResponseJson, AuthResponse.class);

        assertNotNull(refreshResponse.getAccessToken());
        assertNotNull(refreshResponse.getRefreshToken());
        assertEquals(loginResponse.getUserId(), refreshResponse.getUserId());

        // Verify that new tokens are different from previous ones
        assertNotEquals(loginResponse.getAccessToken(), refreshResponse.getAccessToken());
        assertNotEquals(loginResponse.getRefreshToken(), refreshResponse.getRefreshToken());

        // Step 4: Test logout
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out successfully"));
    }

    @Test
    void testRegistrationValidationFlow() throws Exception {
        // Test with invalid email
        RegisterRequest invalidEmailRequest = new RegisterRequest();
        invalidEmailRequest.setEmail("invalid-email");
        invalidEmailRequest.setPassword("ValidPass123!");
        invalidEmailRequest.setFirstName("Test");
        invalidEmailRequest.setLastName("User");
        invalidEmailRequest.setPhoneNumber("+1234567890");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidEmailRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.email").exists());

        // Test with weak password
        RegisterRequest weakPasswordRequest = new RegisterRequest();
        weakPasswordRequest.setEmail("test@example.com");
        weakPasswordRequest.setPassword("weak");
        weakPasswordRequest.setFirstName("Test");
        weakPasswordRequest.setLastName("User");
        weakPasswordRequest.setPhoneNumber("+1234567890");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(weakPasswordRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.password").exists());
    }

    @Test
    void testLoginValidationFlow() throws Exception {
        // First register a user
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setEmail("logintest@example.com");
        registerRequest.setPassword("LoginTest123!");
        registerRequest.setFirstName("Login");
        registerRequest.setLastName("Test");
        registerRequest.setPhoneNumber("+1234567890");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated());

        // Test with wrong password
        AuthRequest wrongPasswordRequest = new AuthRequest();
        wrongPasswordRequest.setEmail("logintest@example.com");
        wrongPasswordRequest.setPassword("WrongPassword123!");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(wrongPasswordRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").exists());

        // Test with non-existent user
        AuthRequest nonExistentUserRequest = new AuthRequest();
        nonExistentUserRequest.setEmail("nonexistent@example.com");
        nonExistentUserRequest.setPassword("SomePassword123!");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nonExistentUserRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void testDuplicateRegistrationFlow() throws Exception {
        // Register first user
        RegisterRequest firstRequest = new RegisterRequest();
        firstRequest.setEmail("duplicate@test.com");
        firstRequest.setPassword("FirstUser123!");
        firstRequest.setFirstName("First");
        firstRequest.setLastName("User");
        firstRequest.setPhoneNumber("+1234567890");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(firstRequest)))
                .andExpect(status().isCreated());

        // Try to register second user with same email
        RegisterRequest duplicateRequest = new RegisterRequest();
        duplicateRequest.setEmail("duplicate@test.com");
        duplicateRequest.setPassword("SecondUser123!");
        duplicateRequest.setFirstName("Second");
        duplicateRequest.setLastName("User");
        duplicateRequest.setPhoneNumber("+0987654321");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(duplicateRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }
}
package com.healthcare.appointmentsystem.config;

import com.healthcare.appointmentsystem.service.CustomUserDetailsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CustomUserDetailsService userDetailsService;

    @Test
    void shouldAllowAccessToPublicEndpoints() throws Exception {
        mockMvc.perform(get("/api/auth/login"))
                .andExpect(status().isMethodNotAllowed()); // GET not allowed, but endpoint is accessible

        mockMvc.perform(get("/health"))
                .andExpect(status().isNotFound()); // Endpoint doesn't exist but security allows it
    }

    @Test
    void shouldDenyAccessToProtectedEndpointsWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/appointments"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/doctors/profile/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    void shouldAllowPatientAccessToPatientEndpoints() throws Exception {
        mockMvc.perform(get("/api/appointments/patient/1"))
                .andExpect(status().isNotFound()); // Endpoint accessible but doesn't exist
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    void shouldDenyPatientAccessToDoctorEndpoints() throws Exception {
        mockMvc.perform(get("/api/doctors/availability/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "DOCTOR")
    void shouldAllowDoctorAccessToDoctorEndpoints() throws Exception {
        mockMvc.perform(get("/api/doctors/availability/1"))
                .andExpect(status().isNotFound()); // Endpoint accessible but doesn't exist
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldAllowAdminAccessToAllEndpoints() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isNotFound()); // Endpoint accessible but doesn't exist

        mockMvc.perform(get("/api/appointments"))
                .andExpect(status().isNotFound()); // Endpoint accessible but doesn't exist
    }

    @Test
    void shouldIncludeSecurityHeaders() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().string("X-XSS-Protection", "1; mode=block"))
                .andExpect(header().exists("Content-Security-Policy"))
                .andExpect(header().exists("Permissions-Policy"));
    }
}
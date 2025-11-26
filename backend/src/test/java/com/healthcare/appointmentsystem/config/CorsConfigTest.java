package com.healthcare.appointmentsystem.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
class CorsConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldHandlePreflightRequestForApiEndpoints() throws Exception {
        mockMvc.perform(options("/api/appointments")
                .header("Origin", "http://localhost:3000")
                .header("Access-Control-Request-Method", "POST")
                .header("Access-Control-Request-Headers", "Content-Type,Authorization"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"))
                .andExpect(header().string("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"))
                .andExpect(header().exists("Access-Control-Max-Age"));
    }

    @Test
    void shouldHandlePreflightRequestForAuthEndpoints() throws Exception {
        mockMvc.perform(options("/api/auth/login")
                .header("Origin", "http://localhost:3000")
                .header("Access-Control-Request-Method", "POST")
                .header("Access-Control-Request-Headers", "Content-Type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"))
                .andExpect(header().string("Access-Control-Allow-Methods", "POST,OPTIONS"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    void shouldRejectUnauthorizedOrigin() throws Exception {
        mockMvc.perform(options("/api/appointments")
                .header("Origin", "http://malicious-site.com")
                .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isForbidden());
    }
}
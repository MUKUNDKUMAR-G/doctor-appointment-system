package com.healthcare.appointmentsystem.controller;

import com.healthcare.appointmentsystem.dto.AppointmentMapper;
import com.healthcare.appointmentsystem.dto.AppointmentRequest;
import com.healthcare.appointmentsystem.dto.AppointmentResponse;
import com.healthcare.appointmentsystem.entity.Appointment;
import com.healthcare.appointmentsystem.entity.Doctor;
import com.healthcare.appointmentsystem.entity.User;
import com.healthcare.appointmentsystem.service.AppointmentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AppointmentController.class)
class AppointmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AppointmentService appointmentService;

    @MockBean
    private AppointmentMapper appointmentMapper;

    @Autowired
    private ObjectMapper objectMapper;

    private AppointmentRequest appointmentRequest;
    private Appointment testAppointment;
    private AppointmentResponse appointmentResponse;
    private User testPatient;
    private Doctor testDoctor;

    @BeforeEach
    void setUp() {
        testPatient = new User();
        testPatient.setId(1L);
        testPatient.setFirstName("John");
        testPatient.setLastName("Doe");
        testPatient.setEmail("john.doe@example.com");

        User doctorUser = new User();
        doctorUser.setId(2L);
        doctorUser.setFirstName("Dr. Jane");
        doctorUser.setLastName("Smith");

        testDoctor = new Doctor();
        testDoctor.setId(1L);
        testDoctor.setUser(doctorUser);
        testDoctor.setSpecialty("Cardiology");

        appointmentRequest = new AppointmentRequest();
        appointmentRequest.setDoctorId(1L);
        appointmentRequest.setAppointmentDateTime(LocalDateTime.now().plusDays(1));
        appointmentRequest.setReason("Regular checkup");
        appointmentRequest.setDurationMinutes(30);

        testAppointment = new Appointment(testPatient, testDoctor, 
                                        appointmentRequest.getAppointmentDateTime(), 
                                        appointmentRequest.getReason());
        testAppointment.setId(1L);

        appointmentResponse = new AppointmentResponse();
        appointmentResponse.setId(1L);
        appointmentResponse.setPatientId(1L);
        appointmentResponse.setDoctorId(1L);
        appointmentResponse.setAppointmentDateTime(appointmentRequest.getAppointmentDateTime());
        appointmentResponse.setReason("Regular checkup");
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    void testBookAppointment_Success() throws Exception {
        // Arrange
        when(appointmentService.bookAppointment(anyLong(), anyLong(), any(LocalDateTime.class), 
                                              anyString(), anyString(), anyInt()))
            .thenReturn(testAppointment);
        when(appointmentMapper.toResponse(testAppointment)).thenReturn(appointmentResponse);

        // Act & Assert
        mockMvc.perform(post("/api/appointments")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(appointmentRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.patientId").value(1L))
                .andExpect(jsonPath("$.doctorId").value(1L));

        verify(appointmentService).bookAppointment(anyLong(), eq(1L), any(LocalDateTime.class), 
                                                 eq("Regular checkup"), isNull(), eq(30));
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    void testGetMyAppointments_Success() throws Exception {
        // Arrange
        List<Appointment> appointments = Arrays.asList(testAppointment);
        List<AppointmentResponse> responses = Arrays.asList(appointmentResponse);
        
        when(appointmentService.getPatientAppointments(anyLong())).thenReturn(appointments);
        when(appointmentMapper.toResponse(testAppointment)).thenReturn(appointmentResponse);

        // Act & Assert
        mockMvc.perform(get("/api/appointments/my-appointments")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(1L));

        verify(appointmentService).getPatientAppointments(anyLong());
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    void testCheckTimeSlotAvailability_Available() throws Exception {
        // Arrange
        when(appointmentService.isTimeSlotAvailable(eq(1L), any(LocalDateTime.class), eq(30)))
            .thenReturn(true);

        // Act & Assert
        mockMvc.perform(get("/api/appointments/availability/check")
                .param("doctorId", "1")
                .param("appointmentDateTime", "2024-12-01T10:00:00")
                .param("durationMinutes", "30")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(true));

        verify(appointmentService).isTimeSlotAvailable(eq(1L), any(LocalDateTime.class), eq(30));
    }

    @Test
    void testBookAppointment_Unauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/appointments")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(appointmentRequest)))
                .andExpect(status().isUnauthorized());

        verify(appointmentService, never()).bookAppointment(anyLong(), anyLong(), any(LocalDateTime.class), 
                                                          anyString(), anyString(), anyInt());
    }
}
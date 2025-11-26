package com.healthcare.appointmentsystem.service;

import com.healthcare.appointmentsystem.entity.*;
import com.healthcare.appointmentsystem.repository.NotificationLogRepository;
import com.healthcare.appointmentsystem.repository.NotificationTemplateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationLogRepository notificationLogRepository;

    @Mock
    private NotificationTemplateRepository notificationTemplateRepository;

    @InjectMocks
    private NotificationService notificationService;

    private Appointment testAppointment;
    private User testPatient;
    private Doctor testDoctor;

    @BeforeEach
    void setUp() {
        // Set up test data
        testPatient = new User();
        testPatient.setId(1L);
        testPatient.setFirstName("John");
        testPatient.setLastName("Doe");
        testPatient.setEmail("john.doe@example.com");
        testPatient.setPhoneNumber("+1234567890");

        User doctorUser = new User();
        doctorUser.setId(2L);
        doctorUser.setFirstName("Dr. Jane");
        doctorUser.setLastName("Smith");
        doctorUser.setEmail("jane.smith@example.com");

        testDoctor = new Doctor();
        testDoctor.setId(1L);
        testDoctor.setUser(doctorUser);
        testDoctor.setSpecialty("Cardiology");

        testAppointment = new Appointment(testPatient, testDoctor, LocalDateTime.now().plusDays(1), "Regular checkup");
        testAppointment.setId(1L);
        testAppointment.setDurationMinutes(30);

        // Set up notification service properties
        ReflectionTestUtils.setField(notificationService, "emailNotificationEnabled", true);
        ReflectionTestUtils.setField(notificationService, "smsNotificationEnabled", false);
        ReflectionTestUtils.setField(notificationService, "fromEmail", "noreply@healthcareapp.com");
        ReflectionTestUtils.setField(notificationService, "fromName", "Healthcare Appointment System");
    }

    @Test
    void testSendAppointmentConfirmation_Success() throws Exception {
        // Arrange
        NotificationLog savedLog = new NotificationLog(testAppointment, NotificationType.APPOINTMENT_CONFIRMATION, 
                                                      NotificationChannel.EMAIL, testPatient.getEmail(), 
                                                      "Test Subject", "Test Body");
        savedLog.setId(1L);
        
        when(notificationLogRepository.save(any(NotificationLog.class))).thenReturn(savedLog);

        // Act
        CompletableFuture<Void> result = notificationService.sendAppointmentConfirmation(testAppointment);

        // Assert
        assertNotNull(result);
        result.get(); // Wait for async completion
        
        verify(notificationLogRepository, atLeast(1)).save(any(NotificationLog.class));
    }

    @Test
    void testSendAppointmentCancellation_Success() throws Exception {
        // Arrange
        testAppointment.setCancellationReason("Personal emergency");
        NotificationLog savedLog = new NotificationLog(testAppointment, NotificationType.APPOINTMENT_CANCELLATION, 
                                                      NotificationChannel.EMAIL, testPatient.getEmail(), 
                                                      "Test Subject", "Test Body");
        savedLog.setId(1L);
        
        when(notificationLogRepository.save(any(NotificationLog.class))).thenReturn(savedLog);

        // Act
        CompletableFuture<Void> result = notificationService.sendAppointmentCancellation(testAppointment);

        // Assert
        assertNotNull(result);
        result.get(); // Wait for async completion
        
        verify(notificationLogRepository, atLeast(1)).save(any(NotificationLog.class));
    }

    @Test
    void testSendAppointmentReschedule_Success() throws Exception {
        // Arrange
        LocalDateTime oldDateTime = LocalDateTime.now().plusDays(1);
        testAppointment.setAppointmentDateTime(LocalDateTime.now().plusDays(2));
        
        NotificationLog savedLog = new NotificationLog(testAppointment, NotificationType.APPOINTMENT_RESCHEDULE, 
                                                      NotificationChannel.EMAIL, testPatient.getEmail(), 
                                                      "Test Subject", "Test Body");
        savedLog.setId(1L);
        
        when(notificationLogRepository.save(any(NotificationLog.class))).thenReturn(savedLog);

        // Act
        CompletableFuture<Void> result = notificationService.sendAppointmentReschedule(testAppointment, oldDateTime);

        // Assert
        assertNotNull(result);
        result.get(); // Wait for async completion
        
        verify(notificationLogRepository, atLeast(1)).save(any(NotificationLog.class));
    }

    @Test
    void testSendAppointmentReminder_Success() throws Exception {
        // Arrange
        NotificationLog savedLog = new NotificationLog(testAppointment, NotificationType.APPOINTMENT_REMINDER, 
                                                      NotificationChannel.EMAIL, testPatient.getEmail(), 
                                                      "Test Subject", "Test Body");
        savedLog.setId(1L);
        
        when(notificationLogRepository.save(any(NotificationLog.class))).thenReturn(savedLog);

        // Act
        CompletableFuture<Void> result = notificationService.sendAppointmentReminder(testAppointment);

        // Assert
        assertNotNull(result);
        result.get(); // Wait for async completion
        
        verify(notificationLogRepository, atLeast(1)).save(any(NotificationLog.class));
    }

    @Test
    void testSendAppointmentConfirmation_EmailDisabled() throws Exception {
        // Arrange
        ReflectionTestUtils.setField(notificationService, "emailNotificationEnabled", false);
        ReflectionTestUtils.setField(notificationService, "smsNotificationEnabled", false);

        // Act
        CompletableFuture<Void> result = notificationService.sendAppointmentConfirmation(testAppointment);

        // Assert
        assertNotNull(result);
        result.get(); // Wait for async completion
        
        // Should not save any notification logs when both email and SMS are disabled
        verify(notificationLogRepository, never()).save(any(NotificationLog.class));
    }

    @Test
    void testSendAppointmentConfirmation_WithSMS() throws Exception {
        // Arrange
        ReflectionTestUtils.setField(notificationService, "smsNotificationEnabled", true);
        
        NotificationLog savedLog = new NotificationLog(testAppointment, NotificationType.APPOINTMENT_CONFIRMATION, 
                                                      NotificationChannel.EMAIL, testPatient.getEmail(), 
                                                      "Test Subject", "Test Body");
        savedLog.setId(1L);
        
        when(notificationLogRepository.save(any(NotificationLog.class))).thenReturn(savedLog);

        // Act
        CompletableFuture<Void> result = notificationService.sendAppointmentConfirmation(testAppointment);

        // Assert
        assertNotNull(result);
        result.get(); // Wait for async completion
        
        // Should save both email and SMS notification logs
        verify(notificationLogRepository, atLeast(2)).save(any(NotificationLog.class));
    }

    @Test
    void testNotificationFailure_HandledGracefully() throws Exception {
        // Arrange
        when(notificationLogRepository.save(any(NotificationLog.class)))
            .thenThrow(new RuntimeException("Database error"));

        // Act & Assert
        CompletableFuture<Void> result = notificationService.sendAppointmentConfirmation(testAppointment);
        
        // Should not throw exception even if notification fails
        assertDoesNotThrow(() -> result.get());
    }
}
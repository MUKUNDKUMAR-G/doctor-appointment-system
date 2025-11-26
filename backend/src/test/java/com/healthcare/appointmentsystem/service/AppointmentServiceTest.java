package com.healthcare.appointmentsystem.service;

import com.healthcare.appointmentsystem.entity.*;
import com.healthcare.appointmentsystem.exception.GlobalExceptionHandler.AppointmentConflictException;
import com.healthcare.appointmentsystem.exception.GlobalExceptionHandler.UserNotFoundException;
import com.healthcare.appointmentsystem.repository.AppointmentRepository;
import com.healthcare.appointmentsystem.repository.DoctorRepository;
import com.healthcare.appointmentsystem.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AppointmentService appointmentService;

    private User testPatient;
    private Doctor testDoctor;
    private LocalDateTime futureDateTime;

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
        doctorUser.setEmail("jane.smith@example.com");

        testDoctor = new Doctor();
        testDoctor.setId(1L);
        testDoctor.setUser(doctorUser);
        testDoctor.setSpecialty("Cardiology");

        futureDateTime = LocalDateTime.now().plusDays(1);
    }

    @Test
    void testBookAppointment_Success() {
        // Arrange
        Long patientId = 1L;
        Long doctorId = 1L;
        String reason = "Regular checkup";
        String notes = "Patient notes";
        Integer durationMinutes = 30;

        when(userRepository.findById(patientId)).thenReturn(Optional.of(testPatient));
        when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(testDoctor));
        when(appointmentRepository.findConflictingAppointments(eq(doctorId), any(), any()))
            .thenReturn(Arrays.asList());
        
        Appointment savedAppointment = new Appointment(testPatient, testDoctor, futureDateTime, reason);
        savedAppointment.setId(1L);
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(savedAppointment);
        when(appointmentRepository.findById(1L)).thenReturn(Optional.of(savedAppointment));

        // Act
        Appointment result = appointmentService.bookAppointment(patientId, doctorId, futureDateTime, reason, notes, durationMinutes);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(appointmentRepository, times(2)).save(any(Appointment.class)); // Reserve + Confirm
        verify(notificationService).sendAppointmentConfirmation(any(Appointment.class));
    }

    @Test
    void testBookAppointment_PatientNotFound() {
        // Arrange
        Long patientId = 999L;
        Long doctorId = 1L;

        when(userRepository.findById(patientId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UserNotFoundException.class, () -> {
            appointmentService.bookAppointment(patientId, doctorId, futureDateTime, "reason", "notes", 30);
        });
    }

    @Test
    void testBookAppointment_DoctorNotFound() {
        // Arrange
        Long patientId = 1L;
        Long doctorId = 999L;

        when(userRepository.findById(patientId)).thenReturn(Optional.of(testPatient));
        when(doctorRepository.findById(doctorId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UserNotFoundException.class, () -> {
            appointmentService.bookAppointment(patientId, doctorId, futureDateTime, "reason", "notes", 30);
        });
    }

    @Test
    void testBookAppointment_ConflictingAppointment() {
        // Arrange
        Long patientId = 1L;
        Long doctorId = 1L;

        when(userRepository.findById(patientId)).thenReturn(Optional.of(testPatient));
        when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(testDoctor));
        
        Appointment conflictingAppointment = new Appointment();
        when(appointmentRepository.findConflictingAppointments(eq(doctorId), any(), any()))
            .thenReturn(Arrays.asList(conflictingAppointment));

        // Act & Assert
        assertThrows(AppointmentConflictException.class, () -> {
            appointmentService.bookAppointment(patientId, doctorId, futureDateTime, "reason", "notes", 30);
        });
    }

    @Test
    void testCancelAppointment_Success() {
        // Arrange
        Long appointmentId = 1L;
        String cancellationReason = "Personal emergency";
        
        // Set appointment time to be more than 24 hours in the future
        LocalDateTime farFutureDateTime = LocalDateTime.now().plusDays(2);
        Appointment appointment = new Appointment(testPatient, testDoctor, farFutureDateTime, "reason");
        appointment.setId(appointmentId);
        
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        // Act
        appointmentService.cancelAppointment(appointmentId, cancellationReason);

        // Assert
        verify(appointmentRepository).save(appointment);
        verify(notificationService).sendAppointmentCancellation(appointment);
        assertEquals(AppointmentStatus.CANCELLED, appointment.getStatus());
    }

    @Test
    void testRescheduleAppointment_Success() {
        // Arrange
        Long appointmentId = 1L;
        LocalDateTime newDateTime = futureDateTime.plusDays(3);
        String reason = "Schedule conflict";
        
        // Set appointment time to be more than 24 hours in the future
        LocalDateTime farFutureDateTime = LocalDateTime.now().plusDays(2);
        Appointment appointment = new Appointment(testPatient, testDoctor, farFutureDateTime, "original reason");
        appointment.setId(appointmentId);
        appointment.setDurationMinutes(30);
        
        when(appointmentRepository.findById(appointmentId)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.findConflictingAppointments(eq(testDoctor.getId()), any(), any()))
            .thenReturn(Arrays.asList());
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(appointment);

        // Act
        Appointment result = appointmentService.rescheduleAppointment(appointmentId, newDateTime, reason);

        // Assert
        assertNotNull(result);
        assertEquals(newDateTime, result.getAppointmentDateTime());
        assertEquals(AppointmentStatus.RESCHEDULED, result.getStatus());
        verify(appointmentRepository).save(appointment);
        verify(notificationService).sendAppointmentReschedule(eq(appointment), eq(farFutureDateTime));
    }

    @Test
    void testGetPatientAppointments() {
        // Arrange
        Long patientId = 1L;
        List<Appointment> appointments = Arrays.asList(
            new Appointment(testPatient, testDoctor, futureDateTime, "reason1"),
            new Appointment(testPatient, testDoctor, futureDateTime.plusDays(1), "reason2")
        );
        
        when(appointmentRepository.findByPatientId(patientId)).thenReturn(appointments);

        // Act
        List<Appointment> result = appointmentService.getPatientAppointments(patientId);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(appointmentRepository).findByPatientId(patientId);
    }

    @Test
    void testGetDoctorAppointments() {
        // Arrange
        Long doctorId = 1L;
        List<Appointment> appointments = Arrays.asList(
            new Appointment(testPatient, testDoctor, futureDateTime, "reason1")
        );
        
        when(appointmentRepository.findByDoctorId(doctorId)).thenReturn(appointments);

        // Act
        List<Appointment> result = appointmentService.getDoctorAppointments(doctorId);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(appointmentRepository).findByDoctorId(doctorId);
    }

    @Test
    void testIsTimeSlotAvailable_Available() {
        // Arrange
        Long doctorId = 1L;
        Integer durationMinutes = 30;
        
        when(appointmentRepository.findConflictingAppointments(eq(doctorId), any(), any()))
            .thenReturn(Arrays.asList());

        // Act
        boolean result = appointmentService.isTimeSlotAvailable(doctorId, futureDateTime, durationMinutes);

        // Assert
        assertTrue(result);
    }

    @Test
    void testIsTimeSlotAvailable_NotAvailable() {
        // Arrange
        Long doctorId = 1L;
        Integer durationMinutes = 30;
        
        Appointment conflictingAppointment = new Appointment();
        when(appointmentRepository.findConflictingAppointments(eq(doctorId), any(), any()))
            .thenReturn(Arrays.asList(conflictingAppointment));

        // Act
        boolean result = appointmentService.isTimeSlotAvailable(doctorId, futureDateTime, durationMinutes);

        // Assert
        assertFalse(result);
    }
}
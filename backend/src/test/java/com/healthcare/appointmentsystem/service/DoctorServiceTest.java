package com.healthcare.appointmentsystem.service;

import com.healthcare.appointmentsystem.dto.DoctorResponse;
import com.healthcare.appointmentsystem.entity.Doctor;
import com.healthcare.appointmentsystem.entity.User;
import com.healthcare.appointmentsystem.repository.AppointmentRepository;
import com.healthcare.appointmentsystem.repository.DoctorAvailabilityRepository;
import com.healthcare.appointmentsystem.repository.DoctorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DoctorServiceTest {

    @Mock
    private DoctorRepository doctorRepository;

    @Mock
    private DoctorAvailabilityRepository availabilityRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @InjectMocks
    private DoctorService doctorService;

    private Doctor testDoctor1;
    private Doctor testDoctor2;

    @BeforeEach
    void setUp() {
        User user1 = new User();
        user1.setId(1L);
        user1.setFirstName("Dr. John");
        user1.setLastName("Smith");
        user1.setEmail("john.smith@example.com");
        user1.setEnabled(true);

        testDoctor1 = new Doctor();
        testDoctor1.setId(1L);
        testDoctor1.setUser(user1);
        testDoctor1.setSpecialty("Cardiology");
        testDoctor1.setExperienceYears(10);
        testDoctor1.setConsultationFee(new BigDecimal("150.00"));
        testDoctor1.setIsAvailable(true);
        testDoctor1.setCreatedAt(LocalDateTime.now());

        User user2 = new User();
        user2.setId(2L);
        user2.setFirstName("Dr. Jane");
        user2.setLastName("Doe");
        user2.setEmail("jane.doe@example.com");
        user2.setEnabled(true);

        testDoctor2 = new Doctor();
        testDoctor2.setId(2L);
        testDoctor2.setUser(user2);
        testDoctor2.setSpecialty("Dermatology");
        testDoctor2.setExperienceYears(8);
        testDoctor2.setConsultationFee(new BigDecimal("120.00"));
        testDoctor2.setIsAvailable(true);
        testDoctor2.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void testGetAllAvailableDoctors() {
        // Arrange
        List<Doctor> doctors = Arrays.asList(testDoctor1, testDoctor2);
        when(doctorRepository.findAllAvailableDoctors()).thenReturn(doctors);

        // Act
        List<DoctorResponse> result = doctorService.getAllAvailableDoctors();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Dr. John", result.get(0).getFirstName());
        assertEquals("Cardiology", result.get(0).getSpecialty());
        verify(doctorRepository).findAllAvailableDoctors();
    }

    @Test
    void testSearchDoctorsBySpecialty() {
        // Arrange
        String specialty = "Cardiology";
        List<Doctor> doctors = Arrays.asList(testDoctor1);
        when(doctorRepository.findAvailableDoctorsBySpecialty(specialty)).thenReturn(doctors);

        // Act
        List<DoctorResponse> result = doctorService.searchDoctorsBySpecialty(specialty);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Cardiology", result.get(0).getSpecialty());
        verify(doctorRepository).findAvailableDoctorsBySpecialty(specialty);
    }

    @Test
    void testSearchDoctorsBySpecialty_EmptySpecialty() {
        // Arrange
        List<Doctor> doctors = Arrays.asList(testDoctor1, testDoctor2);
        when(doctorRepository.findAllAvailableDoctors()).thenReturn(doctors);

        // Act
        List<DoctorResponse> result = doctorService.searchDoctorsBySpecialty("");

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(doctorRepository).findAllAvailableDoctors();
    }

    @Test
    void testSearchDoctors() {
        // Arrange
        String searchTerm = "John";
        List<Doctor> doctors = Arrays.asList(testDoctor1);
        when(doctorRepository.searchDoctors(searchTerm)).thenReturn(doctors);

        // Act
        List<DoctorResponse> result = doctorService.searchDoctors(searchTerm);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Dr. John", result.get(0).getFirstName());
        verify(doctorRepository).searchDoctors(searchTerm);
    }

    @Test
    void testSearchDoctors_EmptySearchTerm() {
        // Arrange
        List<Doctor> doctors = Arrays.asList(testDoctor1, testDoctor2);
        when(doctorRepository.findAllAvailableDoctors()).thenReturn(doctors);

        // Act
        List<DoctorResponse> result = doctorService.searchDoctors("");

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(doctorRepository).findAllAvailableDoctors();
    }

    @Test
    void testGetDoctorById_Found() {
        // Arrange
        Long doctorId = 1L;
        when(doctorRepository.findById(doctorId)).thenReturn(Optional.of(testDoctor1));

        // Act
        Optional<DoctorResponse> result = doctorService.getDoctorById(doctorId);

        // Assert
        assertTrue(result.isPresent());
        assertEquals("Dr. John", result.get().getFirstName());
        assertEquals("Cardiology", result.get().getSpecialty());
        verify(doctorRepository).findById(doctorId);
    }

    @Test
    void testGetDoctorById_NotFound() {
        // Arrange
        Long doctorId = 999L;
        when(doctorRepository.findById(doctorId)).thenReturn(Optional.empty());

        // Act
        Optional<DoctorResponse> result = doctorService.getDoctorById(doctorId);

        // Assert
        assertFalse(result.isPresent());
        verify(doctorRepository).findById(doctorId);
    }

    @Test
    void testGetDoctorsByExperienceRange() {
        // Arrange
        Integer minYears = 5;
        Integer maxYears = 15;
        List<Doctor> doctors = Arrays.asList(testDoctor1, testDoctor2);
        when(doctorRepository.findByExperienceYearsRange(minYears, maxYears)).thenReturn(doctors);

        // Act
        List<DoctorResponse> result = doctorService.getDoctorsByExperienceRange(minYears, maxYears);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(doctorRepository).findByExperienceYearsRange(minYears, maxYears);
    }

    @Test
    void testGetDoctorsByFeeRange() {
        // Arrange
        Double minFee = 100.0;
        Double maxFee = 200.0;
        List<Doctor> doctors = Arrays.asList(testDoctor1, testDoctor2);
        when(doctorRepository.findByConsultationFeeRange(minFee, maxFee)).thenReturn(doctors);

        // Act
        List<DoctorResponse> result = doctorService.getDoctorsByFeeRange(minFee, maxFee);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(doctorRepository).findByConsultationFeeRange(minFee, maxFee);
    }

    @Test
    void testGetAllSpecialties() {
        // Arrange
        List<String> specialties = Arrays.asList("Cardiology", "Dermatology", "Neurology");
        when(doctorRepository.findAllSpecialties()).thenReturn(specialties);

        // Act
        List<String> result = doctorService.getAllSpecialties();

        // Assert
        assertNotNull(result);
        assertEquals(3, result.size());
        assertTrue(result.contains("Cardiology"));
        assertTrue(result.contains("Dermatology"));
        verify(doctorRepository).findAllSpecialties();
    }
}
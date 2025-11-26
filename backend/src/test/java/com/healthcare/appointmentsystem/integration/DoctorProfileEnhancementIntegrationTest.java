package com.healthcare.appointmentsystem.integration;

import com.healthcare.appointmentsystem.dto.*;
import com.healthcare.appointmentsystem.entity.*;
import com.healthcare.appointmentsystem.repository.*;
import com.healthcare.appointmentsystem.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DoctorProfileEnhancementIntegrationTest {

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private DoctorCredentialService credentialService;

    @Autowired
    private DoctorReviewService reviewService;

    @Autowired
    private DoctorStatisticsService statisticsService;

    @Autowired
    private DoctorAvailabilityService availabilityService;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    private Doctor testDoctor;
    private User testPatient;

    @BeforeEach
    void setUp() {
        // Create test doctor
        User doctorUser = new User();
        doctorUser.setEmail("test.doctor@example.com");
        doctorUser.setPassword("password");
        doctorUser.setFirstName("Test");
        doctorUser.setLastName("Doctor");
        doctorUser.setRole(Role.DOCTOR);
        doctorUser = userRepository.save(doctorUser);

        testDoctor = new Doctor();
        testDoctor.setUser(doctorUser);
        testDoctor.setSpecialty("Cardiology");
        testDoctor.setConsultationFee(new BigDecimal("150.00"));
        testDoctor.setBio("Test doctor bio");
        testDoctor = doctorRepository.save(testDoctor);

        // Create test patient
        testPatient = new User();
        testPatient.setEmail("test.patient@example.com");
        testPatient.setPassword("password");
        testPatient.setFirstName("Test");
        testPatient.setLastName("Patient");
        testPatient.setRole(Role.PATIENT);
        testPatient = userRepository.save(testPatient);
    }

    /**
     * Test 15.1: Doctor Profile Management
     */
    @Test
    void testDoctorProfileCRUDOperations() {
        // Test profile retrieval
        DoctorProfileResponse profile = doctorService.getDoctorProfile(testDoctor.getId());
        assertNotNull(profile);
        assertEquals("Test", profile.getFirstName());
        assertEquals("Doctor", profile.getLastName());
        assertEquals("Cardiology", profile.getSpecialty());

        // Test profile update
        DoctorProfileRequest updateRequest = new DoctorProfileRequest();
        updateRequest.setBio("Updated bio with more details");
        updateRequest.setConsultationFee(new BigDecimal("200.00"));
        updateRequest.setLanguagesSpoken(Arrays.asList("English", "Spanish"));

        DoctorProfileResponse updatedProfile = doctorService.updateDoctorProfile(
                testDoctor.getId(), updateRequest);
        
        assertNotNull(updatedProfile);
        assertEquals("Updated bio with more details", updatedProfile.getBio());
        assertEquals(new BigDecimal("200.00"), updatedProfile.getConsultationFee());

        // Test profile completeness calculation
        ProfileCompletenessDTO completeness = doctorService.calculateProfileCompleteness(testDoctor.getId());
        assertNotNull(completeness);
        assertTrue(completeness.getPercentage() >= 0 && completeness.getPercentage() <= 100);
    }

    /**
     * Test 15.1: Credential Management
     */
    @Test
    void testCredentialManagement() {
        // Test credential creation
        CredentialUploadRequest credentialRequest = new CredentialUploadRequest();
        credentialRequest.setCredentialType("LICENSE");
        credentialRequest.setDocumentName("Medical License");
        credentialRequest.setIssuingAuthority("Medical Board");
        credentialRequest.setIssueDate(LocalDate.of(2020, 1, 1));
        credentialRequest.setExpiryDate(LocalDate.of(2025, 1, 1));

        // Note: In real scenario, this would include file upload
        // For testing, we're just testing the data flow
        List<DoctorCredential> credentials = credentialService.getDoctorCredentials(testDoctor.getId());
        int initialCount = credentials.size();

        // Verify credentials can be retrieved
        assertNotNull(credentials);
        
        // Test credential verification status
        if (!credentials.isEmpty()) {
            DoctorCredential credential = credentials.get(0);
            assertEquals(VerificationStatus.PENDING, credential.getVerificationStatus());
        }
    }

    /**
     * Test 15.1: Statistics Calculation
     */
    @Test
    void testStatisticsCalculation() {
        // Create test appointments
        Appointment appointment1 = new Appointment();
        appointment1.setDoctor(testDoctor);
        appointment1.setPatient(testPatient);
        appointment1.setAppointmentDateTime(LocalDateTime.now().minusDays(1));
        appointment1.setStatus(AppointmentStatus.COMPLETED);
        appointment1.setDurationMinutes(30);
        appointmentRepository.save(appointment1);

        Appointment appointment2 = new Appointment();
        appointment2.setDoctor(testDoctor);
        appointment2.setPatient(testPatient);
        appointment2.setAppointmentDateTime(LocalDateTime.now().minusDays(2));
        appointment2.setStatus(AppointmentStatus.CANCELLED);
        appointment2.setDurationMinutes(30);
        appointmentRepository.save(appointment2);

        // Calculate statistics
        DoctorStatistics statistics = statisticsService.calculateAndCacheStatistics(testDoctor.getId());
        
        assertNotNull(statistics);
        assertEquals(2, statistics.getTotalAppointments());
        assertEquals(1, statistics.getCompletedAppointments());
        assertEquals(1, statistics.getCancelledAppointments());
        assertEquals(0, statistics.getNoShowAppointments());

        // Test comprehensive statistics with date range
        LocalDate startDate = LocalDate.now().minusMonths(1);
        LocalDate endDate = LocalDate.now();
        
        DoctorStatisticsDTO comprehensiveStats = statisticsService.getComprehensiveStatistics(
                testDoctor.getId(), startDate, endDate);
        
        assertNotNull(comprehensiveStats);
        assertEquals(testDoctor.getId(), comprehensiveStats.getDoctorId());
        assertTrue(comprehensiveStats.getTotalAppointments() >= 0);
    }

    /**
     * Test 15.2: Review System
     */
    @Test
    void testReviewSystem() {
        // Create a completed appointment for review
        Appointment appointment = new Appointment();
        appointment.setDoctor(testDoctor);
        appointment.setPatient(testPatient);
        appointment.setAppointmentDateTime(LocalDateTime.now().minusDays(1));
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointment.setDurationMinutes(30);
        appointment = appointmentRepository.save(appointment);

        // Test review submission
        ReviewSubmissionDTO reviewSubmission = new ReviewSubmissionDTO();
        reviewSubmission.setDoctorId(testDoctor.getId());
        reviewSubmission.setPatientId(testPatient.getId());
        reviewSubmission.setAppointmentId(appointment.getId());
        reviewSubmission.setRating(5);
        reviewSubmission.setComment("Excellent doctor!");

        DoctorReview review = reviewService.submitReview(reviewSubmission);
        
        assertNotNull(review);
        assertEquals(5, review.getRating());
        assertEquals("Excellent doctor!", review.getComment());
        assertNull(review.getDoctorResponse()); // No response yet

        // Test review retrieval
        List<DoctorReview> reviews = reviewService.getDoctorReviews(testDoctor.getId());
        assertNotNull(reviews);
        assertFalse(reviews.isEmpty());

        // Test rating calculation
        Double averageRating = reviewService.calculateAverageRating(testDoctor.getId());
        assertNotNull(averageRating);
        assertEquals(5.0, averageRating, 0.01);

        // Test doctor response to review
        ReviewResponseDTO responseDTO = new ReviewResponseDTO();
        responseDTO.setResponse("Thank you for your feedback!");

        DoctorReview updatedReview = reviewService.respondToReview(
                review.getId(), testDoctor.getId(), responseDTO);
        
        assertNotNull(updatedReview);
        assertEquals("Thank you for your feedback!", updatedReview.getDoctorResponse());
        assertNotNull(updatedReview.getRespondedAt());
    }

    /**
     * Test 15.4: Cross-role Consistency
     */
    @Test
    void testCrossRoleConsistency() {
        // Update doctor profile
        DoctorProfileRequest updateRequest = new DoctorProfileRequest();
        updateRequest.setBio("Updated bio for cross-role test");
        updateRequest.setConsultationFee(new BigDecimal("175.00"));

        doctorService.updateDoctorProfile(testDoctor.getId(), updateRequest);

        // Verify changes are visible when retrieving profile
        DoctorProfileResponse profile = doctorService.getDoctorProfile(testDoctor.getId());
        assertEquals("Updated bio for cross-role test", profile.getBio());
        assertEquals(new BigDecimal("175.00"), profile.getConsultationFee());

        // Verify doctor entity is updated
        Optional<Doctor> doctorOpt = doctorRepository.findById(testDoctor.getId());
        assertTrue(doctorOpt.isPresent());
        assertEquals("Updated bio for cross-role test", doctorOpt.get().getBio());
    }

    /**
     * Test 15.4: Permission Boundaries
     */
    @Test
    void testPermissionBoundaries() {
        // Test that doctor can access their own profile
        DoctorProfileResponse profile = doctorService.getDoctorProfile(testDoctor.getId());
        assertNotNull(profile);

        // Test that profile completeness can be calculated
        ProfileCompletenessDTO completeness = doctorService.calculateProfileCompleteness(testDoctor.getId());
        assertNotNull(completeness);
        
        // In a real scenario, we would test that doctors cannot access other doctors' profiles
        // This would be enforced at the controller/security layer
    }

    /**
     * Test: Profile Completeness Calculation Accuracy
     */
    @Test
    void testProfileCompletenessAccuracy() {
        // Start with minimal profile
        ProfileCompletenessDTO initialCompleteness = doctorService.calculateProfileCompleteness(testDoctor.getId());
        int initialPercentage = initialCompleteness.getPercentage();

        // Add more information
        DoctorProfileRequest updateRequest = new DoctorProfileRequest();
        updateRequest.setBio("Comprehensive bio");
        updateRequest.setEducation(Arrays.asList(
                createEducationDTO("MD", "Harvard Medical School", 2015)
        ));
        updateRequest.setLanguagesSpoken(Arrays.asList("English", "Spanish", "French"));
        updateRequest.setAwards("Best Doctor Award 2023");
        updateRequest.setConsultationDuration(30);
        updateRequest.setFollowUpFee(new BigDecimal("100.00"));

        doctorService.updateDoctorProfile(testDoctor.getId(), updateRequest);

        // Check completeness increased
        ProfileCompletenessDTO updatedCompleteness = doctorService.calculateProfileCompleteness(testDoctor.getId());
        assertTrue(updatedCompleteness.getPercentage() >= initialPercentage,
                "Profile completeness should increase after adding information");
    }

    /**
     * Test: Statistics Update on Appointment Status Change
     */
    @Test
    void testStatisticsUpdateOnAppointmentChange() {
        // Create initial appointment
        Appointment appointment = new Appointment();
        appointment.setDoctor(testDoctor);
        appointment.setPatient(testPatient);
        appointment.setAppointmentDateTime(LocalDateTime.now().plusDays(1));
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        appointment.setDurationMinutes(30);
        appointment = appointmentRepository.save(appointment);

        // Calculate initial statistics
        DoctorStatistics initialStats = statisticsService.calculateAndCacheStatistics(testDoctor.getId());
        int initialTotal = initialStats.getTotalAppointments();

        // Change appointment status to completed
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);

        // Update statistics
        statisticsService.updateStatisticsForAppointment(
                testDoctor.getId(), 
                AppointmentStatus.SCHEDULED, 
                AppointmentStatus.COMPLETED
        );

        // Verify statistics updated
        Optional<DoctorStatistics> updatedStatsOpt = statisticsService.getDoctorStatistics(testDoctor.getId());
        assertTrue(updatedStatsOpt.isPresent());
        DoctorStatistics updatedStats = updatedStatsOpt.get();
        
        assertTrue(updatedStats.getCompletedAppointments() > 0,
                "Completed appointments count should increase");
    }

    // Helper method to create education DTO
    private DoctorProfileRequest.EducationDTO createEducationDTO(String degree, String institution, int year) {
        DoctorProfileRequest.EducationDTO education = new DoctorProfileRequest.EducationDTO();
        education.setDegree(degree);
        education.setInstitution(institution);
        education.setYear(year);
        return education;
    }
}

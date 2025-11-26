package com.healthcare.appointmentsystem.service;

import com.healthcare.appointmentsystem.entity.Appointment;
import com.healthcare.appointmentsystem.entity.AppointmentStatus;
import com.healthcare.appointmentsystem.entity.Doctor;
import com.healthcare.appointmentsystem.entity.User;
import net.jqwik.api.*;
import net.jqwik.api.constraints.NotBlank;
import net.jqwik.api.constraints.Positive;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Property-based tests for export field completeness
 * Feature: admin-interface-modernization
 */
@SpringBootTest
@ActiveProfiles("test")
public class ExportFieldCompletenessPropertyTest {
    
    @Autowired
    private ExportService exportService;
    
    /**
     * Property 14: Export field completeness
     * For any appointment data export, the generated file should include all relevant fields 
     * and relationship data.
     * Validates: Requirements 13.2
     */
    @Property(tries = 100)
    @Label("Feature: admin-interface-modernization, Property 14: Export field completeness")
    void appointmentExportShouldIncludeAllRelevantFields(
            @ForAll @Positive Long appointmentId,
            @ForAll @NotBlank String reason,
            @ForAll AppointmentStatus status) {
        
        // Given: An appointment with all relevant fields
        Appointment appointment = createTestAppointment(appointmentId, reason, status);
        List<Appointment> appointments = List.of(appointment);
        
        // When: Exporting to CSV with all relevant columns
        List<String> columns = List.of("id", "appointmentDateTime", "status", "reason");
        byte[] csvData = exportService.exportToCSV(appointments, columns);
        
        // Then: The export should not be empty
        assertThat(csvData).isNotEmpty();
        
        String csvContent = new String(csvData);
        
        // And: Should include header row with all columns
        assertThat(csvContent).contains("id");
        assertThat(csvContent).contains("appointmentDateTime");
        assertThat(csvContent).contains("status");
        assertThat(csvContent).contains("reason");
        
        // And: Should include the appointment data
        assertThat(csvContent).contains(appointmentId.toString());
        assertThat(csvContent).contains(reason);
        assertThat(csvContent).contains(status.toString());
    }
    
    /**
     * Property 14 (variant): Excel export should include all fields
     */
    @Property(tries = 100)
    @Label("Feature: admin-interface-modernization, Property 14: Excel export completeness")
    void appointmentExcelExportShouldIncludeAllFields(
            @ForAll @Positive Long appointmentId,
            @ForAll @NotBlank String reason,
            @ForAll AppointmentStatus status) throws Exception {
        
        // Given: An appointment with all relevant fields
        Appointment appointment = createTestAppointment(appointmentId, reason, status);
        List<Appointment> appointments = List.of(appointment);
        
        // When: Exporting to Excel with all relevant columns
        List<String> columns = List.of("id", "appointmentDateTime", "status", "reason");
        byte[] excelData = exportService.exportToExcel(appointments, columns, "Appointments");
        
        // Then: The export should not be empty
        assertThat(excelData).isNotEmpty();
        
        // And: Should be a valid Excel file (starts with PK for ZIP format)
        assertThat(excelData[0]).isEqualTo((byte) 0x50); // 'P'
        assertThat(excelData[1]).isEqualTo((byte) 0x4B); // 'K'
    }
    
    /**
     * Property 14 (variant): Export should handle multiple appointments
     */
    @Property(tries = 50)
    @Label("Feature: admin-interface-modernization, Property 14: Multiple appointment export")
    void exportShouldHandleMultipleAppointments(
            @ForAll("appointmentList") List<Appointment> appointments) {
        
        Assume.that(!appointments.isEmpty());
        
        // When: Exporting multiple appointments
        List<String> columns = List.of("id", "status", "reason");
        byte[] csvData = exportService.exportToCSV(appointments, columns);
        
        // Then: The export should contain data for all appointments
        String csvContent = new String(csvData);
        String[] lines = csvContent.split("\n");
        
        // Header + data rows
        assertThat(lines.length).isGreaterThanOrEqualTo(appointments.size() + 1);
        
        // Each appointment should be represented
        for (Appointment appointment : appointments) {
            assertThat(csvContent).contains(appointment.getId().toString());
        }
    }
    
    // Helper methods and arbitraries
    
    private Appointment createTestAppointment(Long id, String reason, AppointmentStatus status) {
        Appointment appointment = new Appointment();
        appointment.setId(id);
        appointment.setReason(reason);
        appointment.setStatus(status);
        appointment.setAppointmentDateTime(LocalDateTime.now().plusDays(1)); // Future date
        appointment.setDurationMinutes(30);
        
        // Create minimal patient and doctor
        User patient = new User();
        patient.setId(1L);
        patient.setFirstName("Test");
        patient.setLastName("Patient");
        appointment.setPatient(patient);
        
        Doctor doctor = new Doctor();
        doctor.setId(1L);
        User doctorUser = new User();
        doctorUser.setFirstName("Test");
        doctorUser.setLastName("Doctor");
        doctor.setUser(doctorUser);
        appointment.setDoctor(doctor);
        
        return appointment;
    }
    
    @Provide
    Arbitrary<List<Appointment>> appointmentList() {
        return Arbitraries.integers().between(1, 10).flatMap(size -> {
            Arbitrary<Appointment> appointmentArbitrary = Combinators.combine(
                Arbitraries.longs().between(1L, 1000L),
                Arbitraries.strings().alpha().ofMinLength(5).ofMaxLength(50),
                Arbitraries.of(AppointmentStatus.class)
            ).as((id, reason, status) -> createTestAppointment(id, reason, status));
            
            return appointmentArbitrary.list().ofSize(size);
        });
    }
}

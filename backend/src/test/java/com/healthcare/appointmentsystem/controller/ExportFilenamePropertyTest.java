package com.healthcare.appointmentsystem.controller;

import com.healthcare.appointmentsystem.dto.ExportRequest;
import com.healthcare.appointmentsystem.entity.User;
import com.healthcare.appointmentsystem.entity.UserRole;
import com.healthcare.appointmentsystem.repository.AppointmentRepository;
import com.healthcare.appointmentsystem.repository.UserRepository;
import com.healthcare.appointmentsystem.service.ExportService;
import net.jqwik.api.*;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Property-based tests for export filename patterns
 * Feature: admin-interface-modernization
 */
@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
public class ExportFilenamePropertyTest {
    
    @Autowired
    private AdminController adminController;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    private User adminUser;
    private Authentication authentication;
    
    @BeforeEach
    public void setUp() {
        // Create admin user for authentication
        adminUser = new User();
        adminUser.setEmail("admin@test.com");
        adminUser.setFirstName("Test");
        adminUser.setLastName("Admin");
        adminUser.setPhoneNumber("+1234567890");
        adminUser.setPasswordHash("hashedpassword");
        adminUser.setRole(UserRole.ADMIN);
        adminUser.setEnabled(true);
        adminUser = userRepository.save(adminUser);
        
        authentication = new UsernamePasswordAuthenticationToken(
            adminUser, 
            null, 
            List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );
    }
    
    /**
     * Property 15: Export filename pattern
     * For any export generated, the filename should follow a consistent pattern 
     * including entity type, date, and format.
     * Validates: Requirements 13.5
     */
    @Property(tries = 100)
    @Label("Feature: admin-interface-modernization, Property 15: Export filename pattern")
    void userExportFilenamesShouldFollowPattern(
            @ForAll("exportFormats") String format) throws Exception {
        
        // Given: An export request for users
        ExportRequest request = new ExportRequest();
        request.setFormat(format);
        request.setColumns(List.of("id", "name", "email"));
        
        // When: Exporting users
        ResponseEntity<byte[]> response = adminController.exportUsers(request);
        
        // Then: The response should have a Content-Disposition header
        String contentDisposition = response.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION);
        assertThat(contentDisposition).isNotNull();
        assertThat(contentDisposition).startsWith("attachment; filename=");
        
        // And: The filename should follow the pattern: entityType_date.extension
        String filename = extractFilename(contentDisposition);
        assertThat(filename).isNotNull();
        
        // Should start with entity type
        assertThat(filename).startsWith("users_");
        
        // Should contain today's date
        String today = LocalDate.now().toString();
        assertThat(filename).contains(today);
        
        // Should have correct extension based on format
        String expectedExtension = getExpectedExtension(format);
        assertThat(filename).endsWith(expectedExtension);
        
        // Should match the complete pattern
        Pattern pattern = Pattern.compile("users_\\d{4}-\\d{2}-\\d{2}\\." + expectedExtension.replace(".", ""));
        assertThat(pattern.matcher(filename).matches()).isTrue();
    }
    
    /**
     * Property 15 (variant): Appointment export filenames should follow pattern
     */
    @Property(tries = 100)
    @Label("Feature: admin-interface-modernization, Property 15: Appointment export filename pattern")
    void appointmentExportFilenamesShouldFollowPattern(
            @ForAll("exportFormats") String format) throws Exception {
        
        // Given: An export request for appointments
        ExportRequest request = new ExportRequest();
        request.setFormat(format);
        request.setColumns(List.of("id", "status"));
        
        // When: Exporting appointments
        ResponseEntity<byte[]> response = adminController.exportAppointments(request);
        
        // Then: The filename should follow the pattern
        String contentDisposition = response.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION);
        String filename = extractFilename(contentDisposition);
        
        assertThat(filename).isNotNull();
        assertThat(filename).startsWith("appointments_");
        
        String today = LocalDate.now().toString();
        assertThat(filename).contains(today);
        
        String expectedExtension = getExpectedExtension(format);
        assertThat(filename).endsWith(expectedExtension);
        
        Pattern pattern = Pattern.compile("appointments_\\d{4}-\\d{2}-\\d{2}\\." + expectedExtension.replace(".", ""));
        assertThat(pattern.matcher(filename).matches()).isTrue();
    }
    
    /**
     * Property 15 (variant): Filenames should include date in ISO format
     */
    @Property(tries = 100)
    @Label("Feature: admin-interface-modernization, Property 15: Export filename date format")
    void exportFilenamesShouldIncludeDateInISOFormat(
            @ForAll("exportFormats") String format) throws Exception {
        
        // Given: An export request
        ExportRequest request = new ExportRequest();
        request.setFormat(format);
        request.setColumns(List.of("id", "name"));
        
        // When: Exporting
        ResponseEntity<byte[]> response = adminController.exportUsers(request);
        
        // Then: The filename should contain date in ISO format (YYYY-MM-DD)
        String contentDisposition = response.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION);
        String filename = extractFilename(contentDisposition);
        
        // Extract date portion
        Pattern datePattern = Pattern.compile("\\d{4}-\\d{2}-\\d{2}");
        assertThat(datePattern.matcher(filename).find()).isTrue();
        
        // Verify it's today's date
        String today = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
        assertThat(filename).contains(today);
    }
    
    // Helper methods and arbitraries
    
    private String extractFilename(String contentDisposition) {
        if (contentDisposition == null) return null;
        
        // Extract filename from: attachment; filename="filename.ext"
        int start = contentDisposition.indexOf("filename=\"");
        if (start == -1) return null;
        
        start += "filename=\"".length();
        int end = contentDisposition.indexOf("\"", start);
        if (end == -1) return null;
        
        return contentDisposition.substring(start, end);
    }
    
    private String getExpectedExtension(String format) {
        if (format == null) return ".csv";
        
        switch (format.toUpperCase()) {
            case "EXCEL":
                return ".xlsx";
            case "PDF":
                return ".pdf";
            default:
                return ".csv";
        }
    }
    
    @Provide
    Arbitrary<String> exportFormats() {
        return Arbitraries.of("CSV", "EXCEL", "PDF", "csv", "excel", "pdf");
    }
}

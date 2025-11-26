package com.healthcare.appointmentsystem.controller;

import com.healthcare.appointmentsystem.dto.*;
import com.healthcare.appointmentsystem.entity.*;
import com.healthcare.appointmentsystem.service.AuditLogService;
import com.healthcare.appointmentsystem.service.AnalyticsService;
import com.healthcare.appointmentsystem.service.ExportService;
import com.healthcare.appointmentsystem.repository.AppointmentRepository;
import com.healthcare.appointmentsystem.repository.UserRepository;
import com.healthcare.appointmentsystem.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private AppointmentMapper appointmentMapper;

    @Autowired
    private com.healthcare.appointmentsystem.repository.DoctorCredentialRepository credentialRepository;

    @Autowired
    private com.healthcare.appointmentsystem.repository.DoctorReviewRepository reviewRepository;
    
    @Autowired
    private com.healthcare.appointmentsystem.service.AuditLogService auditLogService;
    
    @Autowired
    private com.healthcare.appointmentsystem.service.AnalyticsService analyticsService;
    
    @Autowired
    private com.healthcare.appointmentsystem.service.ExportService exportService;
    
    @Autowired
    private com.healthcare.appointmentsystem.service.RealTimeUpdateService realTimeUpdateService;

    // Get all users
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserResponse> userResponses = users.stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userResponses);
    }

    // Update user status
    @PutMapping("/users/{userId}/status")
    public ResponseEntity<Map<String, String>> updateUserStatus(
            @PathVariable Long userId,
            @RequestBody Map<String, Boolean> request,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Boolean enabled = request.get("enabled");
        user.setEnabled(enabled);
        userRepository.save(user);
        
        // Log audit action
        String action = enabled ? "ENABLE_USER" : "DISABLE_USER";
        String details = (enabled ? "Enabled" : "Disabled") + " user: " + 
            user.getEmail() + " (" + user.getFullName() + ")";
        logAuditAction(action, "User", userId, details, authentication, httpRequest);
        
        // Broadcast real-time update
        realTimeUpdateService.broadcastUserUpdate("STATUS_CHANGED", new UserResponse(user));
        
        return ResponseEntity.ok(Map.of("message", "User status updated successfully"));
    }

    // Delete user
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Map<String, String>> deleteUser(
            @PathVariable Long userId,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Don't allow deleting admin users
        if (user.getRole() != null && "ADMIN".equals(user.getRole().name())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Cannot delete admin users"));
        }
        
        // Log audit before deletion
        logAuditAction("DELETE_USER", "User", userId, 
            "Deleted user: " + user.getEmail() + " (" + user.getFullName() + ")", 
            authentication, httpRequest);
        
        userRepository.delete(user);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    // Update doctor availability
    @PutMapping("/doctors/{doctorId}/availability")
    public ResponseEntity<Map<String, String>> updateDoctorAvailability(
            @PathVariable Long doctorId,
            @RequestBody Map<String, Boolean> request,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        var doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        Boolean isAvailable = request.get("isAvailable");
        doctor.setIsAvailable(isAvailable);
        doctorRepository.save(doctor);
        
        // Log audit action
        String action = isAvailable ? "ENABLE_DOCTOR" : "DISABLE_DOCTOR";
        String details = (isAvailable ? "Enabled" : "Disabled") + " doctor: " + 
            doctor.getUser().getFullName() + " (Specialty: " + doctor.getSpecialty() + ")";
        logAuditAction(action, "Doctor", doctorId, details, authentication, httpRequest);
        
        return ResponseEntity.ok(Map.of("message", "Doctor availability updated successfully"));
    }

    // Get all appointments
    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentResponse>> getAllAppointments() {
        List<Appointment> appointments = appointmentRepository.findAll();
        List<AppointmentResponse> responses = appointments.stream()
                .map(appointmentMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    // Get system statistics
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        long totalUsers = userRepository.count();
        long totalDoctors = doctorRepository.count();
        long totalAppointments = appointmentRepository.count();
        long activeDoctors = doctorRepository.findAll().stream()
                .filter(d -> d.getIsAvailable() != null && d.getIsAvailable())
                .count();
        long todayAppointments = appointmentRepository.findAll().stream()
                .filter(a -> a.getAppointmentDateTime() != null && 
                        a.getAppointmentDateTime().toLocalDate().equals(LocalDate.now()))
                .count();
        
        Map<String, Object> stats = Map.of(
                "totalUsers", totalUsers,
                "totalDoctors", totalDoctors,
                "activeDoctors", activeDoctors,
                "totalAppointments", totalAppointments,
                "todayAppointments", todayAppointments
        );
        
        return ResponseEntity.ok(stats);
    }

    // Verify doctor
    @PutMapping("/doctors/{doctorId}/verify")
    public ResponseEntity<Map<String, String>> verifyDoctor(
            @PathVariable Long doctorId,
            @RequestBody Map<String, Boolean> request,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        var doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        Boolean isVerified = request.get("isVerified");
        doctor.setIsVerified(isVerified);
        doctorRepository.save(doctor);
        
        // Log audit action
        String action = isVerified ? "VERIFY_DOCTOR" : "UNVERIFY_DOCTOR";
        String details = (isVerified ? "Verified" : "Unverified") + " doctor: " + 
            doctor.getUser().getFullName() + " (Specialty: " + doctor.getSpecialty() + ")";
        logAuditAction(action, "Doctor", doctorId, details, authentication, httpRequest);
        
        // Broadcast real-time update
        realTimeUpdateService.broadcastDoctorUpdate("VERIFICATION_CHANGED", Map.of(
            "doctorId", doctorId,
            "isVerified", doctor.getIsVerified()
        ));
        
        return ResponseEntity.ok(Map.of("message", "Doctor verification status updated successfully"));
    }

    // Bulk enable doctors
    @PostMapping("/doctors/bulk/enable")
    public ResponseEntity<Map<String, String>> bulkEnableDoctors(@RequestBody Map<String, List<Long>> request) {
        List<Long> doctorIds = request.get("doctorIds");
        doctorIds.forEach(id -> {
            doctorRepository.findById(id).ifPresent(doctor -> {
                doctor.setIsAvailable(true);
                doctorRepository.save(doctor);
            });
        });
        return ResponseEntity.ok(Map.of("message", "Doctors enabled successfully"));
    }

    // Bulk disable doctors
    @PostMapping("/doctors/bulk/disable")
    public ResponseEntity<Map<String, String>> bulkDisableDoctors(@RequestBody Map<String, List<Long>> request) {
        List<Long> doctorIds = request.get("doctorIds");
        doctorIds.forEach(id -> {
            doctorRepository.findById(id).ifPresent(doctor -> {
                doctor.setIsAvailable(false);
                doctorRepository.save(doctor);
            });
        });
        return ResponseEntity.ok(Map.of("message", "Doctors disabled successfully"));
    }

    // Get pending credential verifications
    @GetMapping("/credentials/pending")
    public ResponseEntity<List<Map<String, Object>>> getPendingCredentials() {
        // Return empty list for now - credentials feature can be implemented later
        return ResponseEntity.ok(List.of());
    }

    // Get flagged reviews
    @GetMapping("/reviews/flagged")
    public ResponseEntity<List<Map<String, Object>>> getFlaggedReviews() {
        // Return empty list for now - review flagging feature can be implemented later
        return ResponseEntity.ok(List.of());
    }

    // Moderate review
    @PutMapping("/reviews/{reviewId}/moderate")
    public ResponseEntity<Map<String, String>> moderateReview(
            @PathVariable Long reviewId,
            @RequestBody Map<String, String> request) {
        var review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        // Review moderation logic can be implemented when needed
        reviewRepository.save(review);
        return ResponseEntity.ok(Map.of("message", "Review moderated successfully"));
    }

    // Delete review
    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<Map<String, String>> deleteReview(
            @PathVariable Long reviewId,
            @RequestBody Map<String, String> request,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        var review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        // Log audit before deletion
        String details = "Deleted review (Rating: " + review.getRating() + "/5) for doctor: " + 
            review.getDoctor().getUser().getFullName() + " by patient: " + review.getPatient().getFullName();
        logAuditAction("DELETE_REVIEW", "Review", reviewId, details, authentication, httpRequest);
        
        reviewRepository.delete(review);
        
        return ResponseEntity.ok(Map.of("message", "Review removed successfully"));
    }

    // Dismiss flag
    @PutMapping("/reviews/{reviewId}/dismiss-flag")
    public ResponseEntity<Map<String, String>> dismissFlag(
            @PathVariable Long reviewId,
            @RequestBody Map<String, String> request) {
        // Flag dismissal logic can be implemented when needed
        return ResponseEntity.ok(Map.of("message", "Flag dismissed successfully"));
    }
    
    // ==================== NEW BULK OPERATION ENDPOINTS ====================
    
    @PostMapping("/users/bulk/enable")
    public ResponseEntity<BulkOperationResult> bulkEnableUsers(
            @RequestBody BulkUserRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        BulkOperationResult result = new BulkOperationResult();
        
        for (Long userId : request.getUserIds()) {
            try {
                User user = userRepository.findById(userId).orElse(null);
                if (user != null) {
                    user.setEnabled(true);
                    userRepository.save(user);
                    result.incrementSuccess();
                    
                    // Log audit
                    logAuditAction("BULK_ENABLE_USER", "User", userId, 
                        "Enabled user: " + user.getEmail(), authentication, httpRequest);
                } else {
                    result.addError(userId, "User not found");
                }
            } catch (Exception e) {
                result.addError(userId, e.getMessage());
            }
        }
        
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/users/bulk/disable")
    public ResponseEntity<BulkOperationResult> bulkDisableUsers(
            @RequestBody BulkUserRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        BulkOperationResult result = new BulkOperationResult();
        
        for (Long userId : request.getUserIds()) {
            try {
                User user = userRepository.findById(userId).orElse(null);
                if (user != null) {
                    // Don't allow disabling admin users
                    if (user.getRole() != null && "ADMIN".equals(user.getRole().name())) {
                        result.addError(userId, "Cannot disable admin users");
                        continue;
                    }
                    
                    user.setEnabled(false);
                    userRepository.save(user);
                    result.incrementSuccess();
                    
                    // Log audit
                    logAuditAction("BULK_DISABLE_USER", "User", userId, 
                        "Disabled user: " + user.getEmail(), authentication, httpRequest);
                } else {
                    result.addError(userId, "User not found");
                }
            } catch (Exception e) {
                result.addError(userId, e.getMessage());
            }
        }
        
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/doctors/bulk/verify")
    public ResponseEntity<BulkOperationResult> bulkVerifyDoctors(
            @RequestBody BulkDoctorRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        BulkOperationResult result = new BulkOperationResult();
        
        for (Long doctorId : request.getDoctorIds()) {
            try {
                var doctor = doctorRepository.findById(doctorId).orElse(null);
                if (doctor != null) {
                    doctor.setIsVerified(true);
                    doctorRepository.save(doctor);
                    result.incrementSuccess();
                    
                    // Log audit
                    logAuditAction("BULK_VERIFY_DOCTOR", "Doctor", doctorId, 
                        "Verified doctor: " + doctor.getUser().getFullName(), authentication, httpRequest);
                } else {
                    result.addError(doctorId, "Doctor not found");
                }
            } catch (Exception e) {
                result.addError(doctorId, e.getMessage());
            }
        }
        
        return ResponseEntity.ok(result);
    }
    
    // ==================== ANALYTICS ENDPOINTS ====================
    
    @GetMapping("/analytics/dashboard")
    public ResponseEntity<DashboardAnalytics> getDashboardAnalytics(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusDays(30);
        LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();
        
        DashboardAnalytics analytics = analyticsService.getDashboardAnalytics(start, end);
        return ResponseEntity.ok(analytics);
    }
    
    @GetMapping("/analytics/appointments/trends")
    public ResponseEntity<List<AppointmentTrendData>> getAppointmentTrends(
            @RequestParam(defaultValue = "30d") String period) {
        List<AppointmentTrendData> trends = analyticsService.getAppointmentTrends(period);
        return ResponseEntity.ok(trends);
    }
    
    @GetMapping("/analytics/users/growth")
    public ResponseEntity<List<UserGrowthData>> getUserGrowth(
            @RequestParam(defaultValue = "30d") String period) {
        List<UserGrowthData> growth = analyticsService.getUserGrowth(period);
        return ResponseEntity.ok(growth);
    }
    
    @GetMapping("/analytics/system-health")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        Map<String, Object> health = analyticsService.getSystemHealthMetrics();
        return ResponseEntity.ok(health);
    }
    
    @GetMapping("/analytics/doctor-performance")
    public ResponseEntity<List<DoctorPerformanceData>> getDoctorPerformance() {
        List<DoctorPerformanceData> performance = analyticsService.getDoctorPerformanceMetrics();
        return ResponseEntity.ok(performance);
    }
    
    // ==================== AUDIT LOG ENDPOINTS ====================
    
    @GetMapping("/activity")
    public ResponseEntity<Page<AuditLogEntry>> getRecentActivity(
            @RequestParam(defaultValue = "10") int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "timestamp"));
        Page<AuditLogEntry> logs = auditLogService.getAuditLogs(null, null, null, null, null, null, pageable);
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/audit-logs")
    public ResponseEntity<Page<AuditLogEntry>> getAuditLogs(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Long adminId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String severity,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        LocalDateTime start = startDate != null ? LocalDate.parse(startDate).atStartOfDay() : null;
        LocalDateTime end = endDate != null ? LocalDate.parse(endDate).plusDays(1).atStartOfDay() : null;
        Severity sev = severity != null ? Severity.valueOf(severity) : null;
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        Page<AuditLogEntry> logs = auditLogService.getAuditLogs(start, end, adminId, action, entityType, sev, pageable);
        
        return ResponseEntity.ok(logs);
    }
    
    // ==================== EXPORT ENDPOINTS ====================
    
    @PostMapping("/export/users")
    public ResponseEntity<byte[]> exportUsers(@RequestBody ExportRequest request) throws IOException {
        List<User> users = userRepository.findAll();
        List<String> columns = request.getColumns() != null ? request.getColumns() : 
            List.of("id", "name", "email", "role", "enabled");
        
        byte[] data;
        String filename;
        MediaType mediaType;
        
        String format = request.getFormat() != null ? request.getFormat().toUpperCase() : "CSV";
        
        switch (format) {
            case "EXCEL":
                data = exportService.exportToExcel(users, columns, "Users");
                filename = "users_" + LocalDate.now() + ".xlsx";
                mediaType = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                break;
            case "PDF":
                data = exportService.exportToPDF("Users Report", users, columns);
                filename = "users_" + LocalDate.now() + ".pdf";
                mediaType = MediaType.APPLICATION_PDF;
                break;
            default:
                data = exportService.exportToCSV(users, columns);
                filename = "users_" + LocalDate.now() + ".csv";
                mediaType = MediaType.parseMediaType("text/csv");
        }
        
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(mediaType)
            .body(data);
    }
    
    @PostMapping("/export/doctors")
    public ResponseEntity<byte[]> exportDoctors(@RequestBody ExportRequest request) throws IOException {
        List<Doctor> doctors = doctorRepository.findAll();
        List<String> columns = request.getColumns() != null ? request.getColumns() : 
            List.of("id", "specialization", "experienceYears", "consultationFee", "isVerified", "isAvailable");
        
        byte[] data;
        String filename;
        MediaType mediaType;
        
        String format = request.getFormat() != null ? request.getFormat().toUpperCase() : "CSV";
        
        switch (format) {
            case "EXCEL":
                data = exportService.exportToExcel(doctors, columns, "Doctors");
                filename = "doctors_" + LocalDate.now() + ".xlsx";
                mediaType = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                break;
            case "PDF":
                data = exportService.exportToPDF("Doctors Report", doctors, columns);
                filename = "doctors_" + LocalDate.now() + ".pdf";
                mediaType = MediaType.APPLICATION_PDF;
                break;
            default:
                data = exportService.exportToCSV(doctors, columns);
                filename = "doctors_" + LocalDate.now() + ".csv";
                mediaType = MediaType.parseMediaType("text/csv");
        }
        
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(mediaType)
            .body(data);
    }
    
    @PostMapping("/export/appointments")
    public ResponseEntity<byte[]> exportAppointments(@RequestBody ExportRequest request) throws IOException {
        List<Appointment> appointments = appointmentRepository.findAll();
        List<String> columns = request.getColumns() != null ? request.getColumns() : 
            List.of("id", "appointmentDateTime", "status", "reasonForVisit");
        
        byte[] data;
        String filename;
        MediaType mediaType;
        
        String format = request.getFormat() != null ? request.getFormat().toUpperCase() : "CSV";
        
        switch (format) {
            case "EXCEL":
                data = exportService.exportToExcel(appointments, columns, "Appointments");
                filename = "appointments_" + LocalDate.now() + ".xlsx";
                mediaType = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                break;
            case "PDF":
                data = exportService.exportToPDF("Appointments Report", appointments, columns);
                filename = "appointments_" + LocalDate.now() + ".pdf";
                mediaType = MediaType.APPLICATION_PDF;
                break;
            default:
                data = exportService.exportToCSV(appointments, columns);
                filename = "appointments_" + LocalDate.now() + ".csv";
                mediaType = MediaType.parseMediaType("text/csv");
        }
        
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(mediaType)
            .body(data);
    }
    
    @PostMapping("/export/audit-logs")
    public ResponseEntity<byte[]> exportAuditLogs(@RequestBody ExportRequest request) throws IOException {
        // Get audit logs based on filters
        Map<String, Object> filters = request.getFilters();
        LocalDateTime startDate = null;
        LocalDateTime endDate = null;
        Long adminId = null;
        String action = null;
        String entityType = null;
        Severity severity = null;
        
        if (filters != null) {
            if (filters.containsKey("startDate")) {
                startDate = LocalDate.parse(filters.get("startDate").toString()).atStartOfDay();
            }
            if (filters.containsKey("endDate")) {
                endDate = LocalDate.parse(filters.get("endDate").toString()).plusDays(1).atStartOfDay();
            }
            if (filters.containsKey("adminId")) {
                adminId = Long.parseLong(filters.get("adminId").toString());
            }
            if (filters.containsKey("action")) {
                action = filters.get("action").toString();
            }
            if (filters.containsKey("entityType")) {
                entityType = filters.get("entityType").toString();
            }
            if (filters.containsKey("severity")) {
                severity = Severity.valueOf(filters.get("severity").toString());
            }
        }
        
        // Get all audit logs matching filters
        Pageable pageable = PageRequest.of(0, 10000, Sort.by(Sort.Direction.DESC, "timestamp"));
        Page<AuditLogEntry> logsPage = auditLogService.getAuditLogs(startDate, endDate, adminId, action, entityType, severity, pageable);
        List<AuditLogEntry> logs = logsPage.getContent();
        
        List<String> columns = request.getColumns() != null ? request.getColumns() : 
            List.of("id", "timestamp", "adminName", "action", "entityType", "entityId", "severity", "details", "ipAddress");
        
        byte[] data;
        String filename;
        MediaType mediaType;
        
        String format = request.getFormat() != null ? request.getFormat().toUpperCase() : "CSV";
        
        switch (format) {
            case "EXCEL":
                data = exportService.exportToExcel(logs, columns, "Audit Logs");
                filename = "audit_logs_" + LocalDate.now() + ".xlsx";
                mediaType = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                break;
            case "PDF":
                data = exportService.exportToPDF("Audit Logs Report", logs, columns);
                filename = "audit_logs_" + LocalDate.now() + ".pdf";
                mediaType = MediaType.APPLICATION_PDF;
                break;
            default:
                data = exportService.exportToCSV(logs, columns);
                filename = "audit_logs_" + LocalDate.now() + ".csv";
                mediaType = MediaType.parseMediaType("text/csv");
        }
        
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(mediaType)
            .body(data);
    }
    
    // ==================== HELPER METHODS ====================
    
    private void logAuditAction(String action, String entityType, Long entityId, String details,
                               Authentication authentication, HttpServletRequest request) {
        try {
            System.out.println("=== AUDIT LOG ATTEMPT ===");
            System.out.println("Action: " + action);
            System.out.println("Entity Type: " + entityType);
            System.out.println("Entity ID: " + entityId);
            System.out.println("Details: " + details);
            
            User admin = (User) authentication.getPrincipal();
            String ipAddress = request.getRemoteAddr();
            
            System.out.println("Admin ID: " + admin.getId());
            System.out.println("Admin Name: " + admin.getFullName());
            System.out.println("IP Address: " + ipAddress);
            
            auditLogService.logAction(action, entityType, entityId, details, admin.getId(), admin.getFullName(), ipAddress);
            
            System.out.println("=== AUDIT LOG SUCCESS ===");
        } catch (Exception e) {
            // Log error but don't fail the operation
            System.err.println("=== AUDIT LOG FAILED ===");
            System.err.println("Failed to log audit action: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

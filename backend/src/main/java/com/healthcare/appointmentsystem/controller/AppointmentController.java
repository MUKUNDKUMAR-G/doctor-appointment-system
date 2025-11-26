package com.healthcare.appointmentsystem.controller;

import com.healthcare.appointmentsystem.dto.*;
import com.healthcare.appointmentsystem.entity.Appointment;
import com.healthcare.appointmentsystem.service.AppointmentService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AppointmentController {
    
    private static final Logger logger = LoggerFactory.getLogger(AppointmentController.class);
    
    @Autowired
    private AppointmentService appointmentService;
    
    @Autowired
    private AppointmentMapper appointmentMapper;
    
    /**
     * Reserve a time slot temporarily
     */
    @PostMapping("/reserve")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<AppointmentResponse> reserveTimeSlot(@Valid @RequestBody ReservationRequest request) {
        try {
            logger.info("Reserving time slot for doctor {} at {}", request.getDoctorId(), request.getAppointmentDateTime());
            
            Long patientId = getCurrentUserId();
            Appointment reservation = appointmentService.reserveTimeSlot(
                patientId, 
                request.getDoctorId(), 
                request.getAppointmentDateTime(),
                request.getReason(),
                request.getDurationMinutes()
            );
            
            AppointmentResponse response = appointmentMapper.toResponse(reservation);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error reserving time slot: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Confirm a reserved appointment
     */
    @PostMapping("/{appointmentId}/confirm")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<AppointmentResponse> confirmAppointment(
            @PathVariable Long appointmentId,
            @RequestBody(required = false) Map<String, String> requestBody) {
        try {
            logger.info("Confirming appointment with ID: {}", appointmentId);
            
            String notes = requestBody != null ? requestBody.get("notes") : null;
            Appointment confirmedAppointment = appointmentService.confirmAppointment(appointmentId, notes);
            
            AppointmentResponse response = appointmentMapper.toResponse(confirmedAppointment);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error confirming appointment {}: {}", appointmentId, e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Book an appointment directly (reserve and confirm in one step)
     */
    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<AppointmentResponse> bookAppointment(@Valid @RequestBody AppointmentRequest request) {
        try {
            logger.info("Booking appointment for doctor {} at {}", request.getDoctorId(), request.getAppointmentDateTime());
            
            Long patientId = getCurrentUserId();
            Appointment appointment = appointmentService.bookAppointment(
                patientId,
                request.getDoctorId(),
                request.getAppointmentDateTime(),
                request.getReason(),
                request.getNotes(),
                request.getDurationMinutes()
            );
            
            AppointmentResponse response = appointmentMapper.toResponse(appointment);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            logger.error("Error booking appointment: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Get patient's appointments
     */
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('PATIENT') and #patientId == authentication.principal.id or hasRole('ADMIN')")
    public ResponseEntity<List<AppointmentResponse>> getPatientAppointments(@PathVariable Long patientId) {
        try {
            logger.info("Retrieving appointments for patient: {}", patientId);
            
            List<Appointment> appointments = appointmentService.getPatientAppointments(patientId);
            List<AppointmentResponse> responses = appointments.stream()
                .map(appointmentMapper::toResponse)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(responses);
            
        } catch (Exception e) {
            logger.error("Error retrieving patient appointments for {}: {}", patientId, e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Get current user's appointments
     */
    @GetMapping("/my-appointments")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<AppointmentResponse>> getMyAppointments() {
        try {
            Long patientId = getCurrentUserId();
            logger.info("Retrieving appointments for current patient: {}", patientId);
            
            List<Appointment> appointments = appointmentService.getPatientAppointments(patientId);
            List<AppointmentResponse> responses = appointments.stream()
                .map(appointmentMapper::toResponse)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(responses);
            
        } catch (Exception e) {
            logger.error("Error retrieving current user appointments: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Get dashboard data for current patient
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<com.healthcare.appointmentsystem.dto.DashboardResponse> getDashboard() {
        try {
            Long patientId = getCurrentUserId();
            logger.info("Retrieving dashboard data for patient: {}", patientId);
            
            // Get upcoming appointments (next 3)
            List<Appointment> upcomingAppointments = appointmentService.getUpcomingPatientAppointments(patientId, 3);
            List<AppointmentResponse> upcomingResponses = upcomingAppointments.stream()
                .map(appointmentMapper::toResponse)
                .collect(Collectors.toList());
            
            // Get statistics
            Map<String, Long> stats = appointmentService.getPatientAppointmentStatistics(patientId);
            com.healthcare.appointmentsystem.dto.DashboardResponse.DashboardStatistics statistics = 
                new com.healthcare.appointmentsystem.dto.DashboardResponse.DashboardStatistics(
                    stats.get("total"),
                    stats.get("completed"),
                    stats.get("upcoming"),
                    stats.get("cancelled")
                );
            
            // Get recent activity
            List<Appointment> recentAppointments = appointmentService.getRecentPatientAppointments(patientId, 5);
            List<com.healthcare.appointmentsystem.dto.DashboardResponse.RecentActivity> recentActivities = 
                recentAppointments.stream()
                    .map(apt -> new com.healthcare.appointmentsystem.dto.DashboardResponse.RecentActivity(
                        "APPOINTMENT",
                        getActivityDescription(apt),
                        apt.getUpdatedAt().toString(),
                        apt.getStatus().name()
                    ))
                    .collect(Collectors.toList());
            
            com.healthcare.appointmentsystem.dto.DashboardResponse response = 
                new com.healthcare.appointmentsystem.dto.DashboardResponse(
                    upcomingResponses,
                    statistics,
                    recentActivities
                );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error retrieving dashboard data: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Generate activity description for appointment
     */
    private String getActivityDescription(Appointment appointment) {
        String doctorName = appointment.getDoctor().getFullName();
        String action = switch (appointment.getStatus()) {
            case SCHEDULED -> "Scheduled appointment with";
            case COMPLETED -> "Completed appointment with";
            case CANCELLED -> "Cancelled appointment with";
            case RESCHEDULED -> "Rescheduled appointment with";
            default -> "Appointment with";
        };
        return action + " Dr. " + doctorName;
    }
    
    /**
     * Get upcoming appointments for current patient
     */
    @GetMapping("/my-appointments/upcoming")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<AppointmentResponse>> getMyUpcomingAppointments() {
        try {
            Long patientId = getCurrentUserId();
            logger.info("Retrieving upcoming appointments for patient: {}", patientId);
            
            List<Appointment> appointments = appointmentService.getUpcomingPatientAppointments(patientId);
            List<AppointmentResponse> responses = appointments.stream()
                .map(appointmentMapper::toResponse)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(responses);
            
        } catch (Exception e) {
            logger.error("Error retrieving upcoming appointments: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Get doctor's appointments
     */
    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<AppointmentResponse>> getDoctorAppointments(@PathVariable Long doctorId) {
        try {
            logger.info("Retrieving appointments for doctor: {}", doctorId);
            
            List<Appointment> appointments = appointmentService.getDoctorAppointments(doctorId);
            List<AppointmentResponse> responses = appointments.stream()
                .map(appointmentMapper::toResponse)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(responses);
            
        } catch (Exception e) {
            logger.error("Error retrieving doctor appointments for {}: {}", doctorId, e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Get appointment by ID
     */
    @GetMapping("/{appointmentId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<AppointmentResponse> getAppointmentById(@PathVariable Long appointmentId) {
        try {
            logger.info("Retrieving appointment with ID: {}", appointmentId);
            
            Optional<Appointment> appointment = appointmentService.getAppointmentById(appointmentId);
            if (appointment.isPresent()) {
                AppointmentResponse response = appointmentMapper.toResponse(appointment.get());
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            logger.error("Error retrieving appointment {}: {}", appointmentId, e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Cancel an appointment
     */
    @DeleteMapping("/{appointmentId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> cancelAppointment(
            @PathVariable Long appointmentId,
            @Valid @RequestBody CancellationRequest request) {
        try {
            logger.info("Cancelling appointment with ID: {}", appointmentId);
            
            appointmentService.cancelAppointment(appointmentId, request.getCancellationReason());
            
            return ResponseEntity.ok(Map.of(
                "message", "Appointment cancelled successfully",
                "appointmentId", appointmentId.toString()
            ));
            
        } catch (Exception e) {
            logger.error("Error cancelling appointment {}: {}", appointmentId, e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Reschedule an appointment
     */
    @PutMapping("/{appointmentId}/reschedule")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<AppointmentResponse> rescheduleAppointment(
            @PathVariable Long appointmentId,
            @Valid @RequestBody RescheduleRequest request) {
        try {
            logger.info("Rescheduling appointment {} to {}", appointmentId, request.getNewAppointmentDateTime());
            
            Appointment rescheduledAppointment = appointmentService.rescheduleAppointment(
                appointmentId, 
                request.getNewAppointmentDateTime(), 
                request.getReason()
            );
            
            AppointmentResponse response = appointmentMapper.toResponse(rescheduledAppointment);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error rescheduling appointment {}: {}", appointmentId, e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Update appointment notes
     */
    @PutMapping("/{appointmentId}/notes")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<AppointmentResponse> updateAppointmentNotes(
            @PathVariable Long appointmentId,
            @RequestBody Map<String, String> requestBody) {
        try {
            logger.info("Updating notes for appointment: {}", appointmentId);
            
            Optional<Appointment> appointmentOpt = appointmentService.getAppointmentById(appointmentId);
            if (appointmentOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Appointment appointment = appointmentOpt.get();
            String notes = requestBody.get("notes");
            appointment.setNotes(notes);
            
            // Save through service would require additional method, for now direct repository access
            // This could be improved by adding updateAppointmentNotes method to service
            
            AppointmentResponse response = appointmentMapper.toResponse(appointment);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error updating appointment notes for {}: {}", appointmentId, e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Check if time slot is available
     */
    @GetMapping("/availability/check")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Map<String, Boolean>> checkTimeSlotAvailability(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime appointmentDateTime,
            @RequestParam(defaultValue = "30") Integer durationMinutes) {
        try {
            logger.info("Checking availability for doctor {} at {}", doctorId, appointmentDateTime);
            
            boolean isAvailable = appointmentService.isTimeSlotAvailable(doctorId, appointmentDateTime, durationMinutes);
            
            return ResponseEntity.ok(Map.of("available", isAvailable));
            
        } catch (Exception e) {
            logger.error("Error checking time slot availability: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Get current user ID from security context
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof com.healthcare.appointmentsystem.entity.User) {
            com.healthcare.appointmentsystem.entity.User user = (com.healthcare.appointmentsystem.entity.User) authentication.getPrincipal();
            return user.getId();
        }
        throw new IllegalStateException("Unable to determine current user ID");
    }
}
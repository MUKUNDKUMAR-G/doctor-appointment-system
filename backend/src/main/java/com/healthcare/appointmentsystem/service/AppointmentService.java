package com.healthcare.appointmentsystem.service;

import com.healthcare.appointmentsystem.entity.Appointment;
import com.healthcare.appointmentsystem.entity.AppointmentStatus;
import com.healthcare.appointmentsystem.entity.Doctor;
import com.healthcare.appointmentsystem.entity.User;
import com.healthcare.appointmentsystem.exception.GlobalExceptionHandler.AppointmentConflictException;
import com.healthcare.appointmentsystem.exception.GlobalExceptionHandler.UserNotFoundException;
import com.healthcare.appointmentsystem.repository.AppointmentRepository;
import com.healthcare.appointmentsystem.repository.DoctorRepository;
import com.healthcare.appointmentsystem.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AppointmentService {
    
    private static final Logger logger = LoggerFactory.getLogger(AppointmentService.class);
    private static final int RESERVATION_TIMEOUT_MINUTES = 10;
    private static final int MINIMUM_CANCELLATION_HOURS = 24;
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    /**
     * Reserve a time slot temporarily for booking
     */
    public Appointment reserveTimeSlot(Long patientId, Long doctorId, LocalDateTime appointmentDateTime, 
                                     String reason, Integer durationMinutes) {
        logger.info("Reserving time slot for patient {} with doctor {} at {}", 
                   patientId, doctorId, appointmentDateTime);
        
        // Validate input parameters
        validateBookingRequest(patientId, doctorId, appointmentDateTime, durationMinutes);
        
        // Get patient and doctor entities
        User patient = userRepository.findById(patientId)
            .orElseThrow(() -> new UserNotFoundException("Patient not found with ID: " + patientId));
        
        Doctor doctor = doctorRepository.findById(doctorId)
            .orElseThrow(() -> new UserNotFoundException("Doctor not found with ID: " + doctorId));
        
        // Check for appointment conflicts
        checkForConflicts(doctorId, appointmentDateTime, durationMinutes);
        
        // Create temporary reservation
        Appointment appointment = new Appointment(patient, doctor, appointmentDateTime, reason);
        appointment.setDurationMinutes(durationMinutes != null ? durationMinutes : 30);
        appointment.reserve(RESERVATION_TIMEOUT_MINUTES);
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        
        Appointment savedAppointment = appointmentRepository.save(appointment);
        logger.info("Time slot reserved successfully with ID: {}", savedAppointment.getId());
        
        return savedAppointment;
    }
    
    /**
     * Confirm a reserved appointment
     */
    public Appointment confirmAppointment(Long appointmentId, String notes) {
        logger.info("Confirming appointment with ID: {}", appointmentId);
        
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new IllegalArgumentException("Appointment not found with ID: " + appointmentId));
        
        // Check if reservation is still valid
        if (appointment.isExpiredReservation()) {
            appointmentRepository.delete(appointment);
            throw new AppointmentConflictException("Reservation has expired. Please select a new time slot.");
        }
        
        // Confirm the reservation
        appointment.confirmReservation();
        if (notes != null && !notes.trim().isEmpty()) {
            appointment.setNotes(notes.trim());
        }
        
        Appointment confirmedAppointment = appointmentRepository.save(appointment);
        
        // Send confirmation notification
        try {
            notificationService.sendAppointmentConfirmation(confirmedAppointment);
        } catch (Exception e) {
            logger.warn("Failed to send confirmation notification for appointment {}: {}", 
                       appointmentId, e.getMessage());
        }
        
        logger.info("Appointment confirmed successfully with ID: {}", confirmedAppointment.getId());
        return confirmedAppointment;
    }
    
    /**
     * Book an appointment directly (reserve and confirm in one step)
     */
    public Appointment bookAppointment(Long patientId, Long doctorId, LocalDateTime appointmentDateTime, 
                                     String reason, String notes, Integer durationMinutes) {
        logger.info("Booking appointment for patient {} with doctor {} at {}", 
                   patientId, doctorId, appointmentDateTime);
        
        // Reserve the time slot
        Appointment reservation = reserveTimeSlot(patientId, doctorId, appointmentDateTime, reason, durationMinutes);
        
        // Confirm the reservation immediately
        return confirmAppointment(reservation.getId(), notes);
    }
    
    /**
     * Cancel an appointment
     */
    public void cancelAppointment(Long appointmentId, String cancellationReason) {
        logger.info("Cancelling appointment with ID: {}", appointmentId);
        
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new IllegalArgumentException("Appointment not found with ID: " + appointmentId));
        
        // Check if appointment can be cancelled (24 hours in advance)
        if (!appointment.canBeCancelled()) {
            throw new IllegalArgumentException(
                "Appointment cannot be cancelled. Cancellation must be done at least 24 hours in advance.");
        }
        
        // Cancel the appointment
        appointment.cancel(cancellationReason);
        appointmentRepository.save(appointment);
        
        // Send cancellation notification
        try {
            notificationService.sendAppointmentCancellation(appointment);
        } catch (Exception e) {
            logger.warn("Failed to send cancellation notification for appointment {}: {}", 
                       appointmentId, e.getMessage());
        }
        
        logger.info("Appointment cancelled successfully with ID: {}", appointmentId);
    }
    
    /**
     * Reschedule an appointment
     */
    public Appointment rescheduleAppointment(Long appointmentId, LocalDateTime newDateTime, String reason) {
        logger.info("Rescheduling appointment {} to new time: {}", appointmentId, newDateTime);
        
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new IllegalArgumentException("Appointment not found with ID: " + appointmentId));
        
        // Check if appointment can be rescheduled
        if (!appointment.canBeCancelled()) {
            throw new IllegalArgumentException(
                "Appointment cannot be rescheduled. Changes must be made at least 24 hours in advance.");
        }
        
        // Check for conflicts at new time
        checkForConflicts(appointment.getDoctor().getId(), newDateTime, appointment.getDurationMinutes());
        
        // Update appointment details
        LocalDateTime oldDateTime = appointment.getAppointmentDateTime();
        appointment.setAppointmentDateTime(newDateTime);
        appointment.setStatus(AppointmentStatus.RESCHEDULED);
        if (reason != null && !reason.trim().isEmpty()) {
            appointment.setReason(reason.trim());
        }
        
        Appointment rescheduledAppointment = appointmentRepository.save(appointment);
        
        // Send reschedule notification
        try {
            notificationService.sendAppointmentReschedule(rescheduledAppointment, oldDateTime);
        } catch (Exception e) {
            logger.warn("Failed to send reschedule notification for appointment {}: {}", 
                       appointmentId, e.getMessage());
        }
        
        logger.info("Appointment rescheduled successfully with ID: {}", rescheduledAppointment.getId());
        return rescheduledAppointment;
    }
    
    /**
     * Get patient appointments
     */
    @Transactional(readOnly = true)
    public List<Appointment> getPatientAppointments(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }
    
    /**
     * Get doctor appointments
     */
    @Transactional(readOnly = true)
    public List<Appointment> getDoctorAppointments(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }
    
    /**
     * Get upcoming appointments for patient
     */
    @Transactional(readOnly = true)
    public List<Appointment> getUpcomingPatientAppointments(Long patientId) {
        return appointmentRepository.findUpcomingPatientAppointments(patientId, LocalDateTime.now());
    }
    
    /**
     * Get upcoming appointments for patient (limited)
     */
    @Transactional(readOnly = true)
    public List<Appointment> getUpcomingPatientAppointments(Long patientId, int limit) {
        List<Appointment> appointments = appointmentRepository.findUpcomingPatientAppointments(patientId, LocalDateTime.now());
        return appointments.stream()
                .limit(limit)
                .collect(java.util.stream.Collectors.toList());
    }
    
    /**
     * Get appointment statistics for patient
     */
    @Transactional(readOnly = true)
    public java.util.Map<String, Long> getPatientAppointmentStatistics(Long patientId) {
        List<Appointment> allAppointments = appointmentRepository.findByPatientId(patientId);
        
        long total = allAppointments.size();
        long completed = allAppointments.stream()
                .filter(apt -> apt.getStatus() == AppointmentStatus.COMPLETED)
                .count();
        long upcoming = allAppointments.stream()
                .filter(apt -> apt.getStatus() == AppointmentStatus.SCHEDULED && 
                              apt.getAppointmentDateTime().isAfter(LocalDateTime.now()))
                .count();
        long cancelled = allAppointments.stream()
                .filter(apt -> apt.getStatus() == AppointmentStatus.CANCELLED)
                .count();
        
        java.util.Map<String, Long> stats = new java.util.HashMap<>();
        stats.put("total", total);
        stats.put("completed", completed);
        stats.put("upcoming", upcoming);
        stats.put("cancelled", cancelled);
        
        return stats;
    }
    
    /**
     * Get recent appointments for patient
     */
    @Transactional(readOnly = true)
    public List<Appointment> getRecentPatientAppointments(Long patientId, int limit) {
        List<Appointment> appointments = appointmentRepository.findByPatientId(patientId);
        return appointments.stream()
                .sorted((a1, a2) -> a2.getUpdatedAt().compareTo(a1.getUpdatedAt()))
                .limit(limit)
                .collect(java.util.stream.Collectors.toList());
    }
    
    /**
     * Get appointment by ID
     */
    @Transactional(readOnly = true)
    public Optional<Appointment> getAppointmentById(Long appointmentId) {
        return appointmentRepository.findById(appointmentId);
    }
    
    /**
     * Check if a time slot is available
     */
    @Transactional(readOnly = true)
    public boolean isTimeSlotAvailable(Long doctorId, LocalDateTime appointmentDateTime, Integer durationMinutes) {
        try {
            checkForConflicts(doctorId, appointmentDateTime, durationMinutes != null ? durationMinutes : 30);
            return true;
        } catch (AppointmentConflictException e) {
            return false;
        }
    }
    
    /**
     * Validate booking request parameters
     */
    private void validateBookingRequest(Long patientId, Long doctorId, LocalDateTime appointmentDateTime, 
                                      Integer durationMinutes) {
        if (patientId == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }
        if (doctorId == null) {
            throw new IllegalArgumentException("Doctor ID is required");
        }
        if (appointmentDateTime == null) {
            throw new IllegalArgumentException("Appointment date and time is required");
        }
        if (appointmentDateTime.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Appointment must be scheduled for a future date and time");
        }
        if (durationMinutes != null && (durationMinutes < 15 || durationMinutes > 240)) {
            throw new IllegalArgumentException("Appointment duration must be between 15 and 240 minutes");
        }
    }
    
    /**
     * Check for appointment conflicts
     */
    private void checkForConflicts(Long doctorId, LocalDateTime startTime, Integer durationMinutes) {
        LocalDateTime endTime = startTime.plusMinutes(durationMinutes != null ? durationMinutes : 30);
        
        List<Appointment> conflictingAppointments = appointmentRepository.findConflictingAppointments(
            doctorId, startTime, endTime);
        
        if (!conflictingAppointments.isEmpty()) {
            throw new AppointmentConflictException(
                "The selected time slot conflicts with an existing appointment. Please choose a different time.");
        }
    }
    
    /**
     * Scheduled task to clean up expired reservations
     */
    @Scheduled(fixedRate = 300000) // Run every 5 minutes
    public void cleanupExpiredReservations() {
        try {
            List<Appointment> expiredReservations = appointmentRepository.findExpiredReservations(LocalDateTime.now());
            if (!expiredReservations.isEmpty()) {
                appointmentRepository.deleteAll(expiredReservations);
                logger.info("Cleaned up {} expired reservations", expiredReservations.size());
            }
        } catch (Exception e) {
            logger.error("Error cleaning up expired reservations: {}", e.getMessage(), e);
        }
    }
}
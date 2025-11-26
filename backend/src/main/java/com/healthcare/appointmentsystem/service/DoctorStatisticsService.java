package com.healthcare.appointmentsystem.service;

import com.healthcare.appointmentsystem.dto.DoctorStatisticsDTO;
import com.healthcare.appointmentsystem.entity.Appointment;
import com.healthcare.appointmentsystem.entity.AppointmentStatus;
import com.healthcare.appointmentsystem.entity.Doctor;
import com.healthcare.appointmentsystem.entity.DoctorStatistics;
import com.healthcare.appointmentsystem.repository.AppointmentRepository;
import com.healthcare.appointmentsystem.repository.DoctorRepository;
import com.healthcare.appointmentsystem.repository.DoctorReviewRepository;
import com.healthcare.appointmentsystem.repository.DoctorStatisticsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DoctorStatisticsService {
    
    private static final Logger logger = LoggerFactory.getLogger(DoctorStatisticsService.class);
    
    @Autowired
    private DoctorStatisticsRepository statisticsRepository;
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private DoctorReviewRepository reviewRepository;
    
    /**
     * Get statistics for a doctor
     */
    public Optional<DoctorStatistics> getDoctorStatistics(Long doctorId) {
        return statisticsRepository.findByDoctorId(doctorId);
    }
    
    /**
     * Get or create statistics for a doctor
     */
    @Transactional
    public DoctorStatistics getOrCreateStatistics(Long doctorId) {
        return statisticsRepository.findByDoctorId(doctorId)
                .orElseGet(() -> {
                    Doctor doctor = doctorRepository.findById(doctorId)
                            .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
                    
                    DoctorStatistics statistics = new DoctorStatistics();
                    statistics.setDoctor(doctor);
                    statistics.setLastCalculatedAt(LocalDateTime.now());
                    
                    return statisticsRepository.save(statistics);
                });
    }
    
    /**
     * Get comprehensive statistics DTO for a doctor
     */
    public DoctorStatisticsDTO getComprehensiveStatistics(Long doctorId, LocalDate startDate, LocalDate endDate) {
        // Get or create cached statistics
        DoctorStatistics cachedStats = getOrCreateStatistics(doctorId);
        
        // Calculate real-time statistics for the date range
        DoctorStatisticsDTO dto = new DoctorStatisticsDTO();
        dto.setDoctorId(doctorId);
        
        // Get appointments in date range
        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : LocalDateTime.now().minusMonths(12);
        LocalDateTime endDateTime = endDate != null ? endDate.atTime(23, 59, 59) : LocalDateTime.now();
        
        List<Appointment> appointments = appointmentRepository.findDoctorAppointmentsInDateRange(
                doctorId, startDateTime, endDateTime);
        
        // Calculate appointment statistics
        dto.setTotalAppointments(appointments.size());
        dto.setCompletedAppointments((int) appointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                .count());
        dto.setCancelledAppointments((int) appointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.CANCELLED)
                .count());
        dto.setNoShowAppointments((int) appointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.NO_SHOW)
                .count());
        
        // Calculate unique patients
        long uniquePatients = appointments.stream()
                .map(a -> a.getPatient().getId())
                .distinct()
                .count();
        dto.setTotalPatients((int) uniquePatients);
        
        // Calculate returning patients
        Map<Long, Long> patientAppointmentCounts = appointments.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getPatient().getId(),
                        Collectors.counting()
                ));
        long returningPatients = patientAppointmentCounts.values().stream()
                .filter(count -> count > 1)
                .count();
        dto.setReturningPatients((int) returningPatients);
        
        // Calculate average consultation time
        List<Appointment> completedAppointments = appointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                .collect(Collectors.toList());
        
        if (!completedAppointments.isEmpty()) {
            double avgDuration = completedAppointments.stream()
                    .mapToInt(Appointment::getDurationMinutes)
                    .average()
                    .orElse(0.0);
            dto.setAvgConsultationTime((int) Math.round(avgDuration));
        } else {
            dto.setAvgConsultationTime(0);
        }
        
        // Calculate revenue
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        
        BigDecimal totalRevenue = completedAppointments.stream()
                .map(a -> doctor.getConsultationFee() != null ? doctor.getConsultationFee() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalRevenue(totalRevenue);
        
        if (!completedAppointments.isEmpty()) {
            BigDecimal avgRevenue = totalRevenue.divide(
                    BigDecimal.valueOf(completedAppointments.size()), 
                    2, 
                    RoundingMode.HALF_UP
            );
            dto.setAvgRevenuePerAppointment(avgRevenue);
        } else {
            dto.setAvgRevenuePerAppointment(BigDecimal.ZERO);
        }
        
        // Calculate projected monthly revenue (not stored in DTO, just for display)
        // This would be calculated on the fly when needed
        
        // Get review statistics
        Double averageRating = reviewRepository.calculateAverageRating(doctorId);
        dto.setAvgRating(averageRating != null ? averageRating : 0.0);
        
        Long reviewCount = reviewRepository.countReviewsByDoctorId(doctorId);
        dto.setTotalReviews(reviewCount != null ? reviewCount.intValue() : 0);
        
        // Calculate patient retention rate
        if (uniquePatients > 0) {
            double retentionRate = (returningPatients * 100.0) / uniquePatients;
            dto.setPatientRetentionRate(BigDecimal.valueOf(retentionRate)
                    .setScale(1, RoundingMode.HALF_UP)
                    .doubleValue());
        } else {
            dto.setPatientRetentionRate(0.0);
        }
        
        // Calculate booking conversion rate (scheduled vs total)
        int scheduledCount = dto.getCompletedAppointments() + 
                (int) appointments.stream()
                        .filter(a -> a.getStatus() == AppointmentStatus.SCHEDULED)
                        .count();
        if (dto.getTotalAppointments() > 0) {
            double conversionRate = (scheduledCount * 100.0) / dto.getTotalAppointments();
            dto.setBookingConversionRate(BigDecimal.valueOf(conversionRate)
                    .setScale(1, RoundingMode.HALF_UP)
                    .doubleValue());
        } else {
            dto.setBookingConversionRate(0.0);
        }
        
        dto.setLastCalculatedAt(LocalDateTime.now());
        
        return dto;
    }
    
    /**
     * Calculate and cache statistics for a doctor
     */
    @Transactional
    public DoctorStatistics calculateAndCacheStatistics(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        
        // Get or create statistics entity
        DoctorStatistics statistics = statisticsRepository.findByDoctorId(doctorId)
                .orElse(new DoctorStatistics());
        
        if (statistics.getDoctor() == null) {
            statistics.setDoctor(doctor);
        }
        
        // Get all appointments for the doctor
        List<Appointment> allAppointments = appointmentRepository.findByDoctorId(doctorId);
        
        // Calculate appointment counts
        statistics.setTotalAppointments(allAppointments.size());
        statistics.setCompletedAppointments((int) allAppointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                .count());
        statistics.setCancelledAppointments((int) allAppointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.CANCELLED)
                .count());
        statistics.setNoShowAppointments((int) allAppointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.NO_SHOW)
                .count());
        
        // Calculate unique patients
        long uniquePatients = allAppointments.stream()
                .map(a -> a.getPatient().getId())
                .distinct()
                .count();
        statistics.setTotalPatients((int) uniquePatients);
        
        // Calculate returning patients
        Map<Long, Long> patientAppointmentCounts = allAppointments.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getPatient().getId(),
                        Collectors.counting()
                ));
        long returningPatients = patientAppointmentCounts.values().stream()
                .filter(count -> count > 1)
                .count();
        statistics.setReturningPatients((int) returningPatients);
        
        // Calculate average consultation time
        List<Appointment> completedAppointments = allAppointments.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                .collect(Collectors.toList());
        
        if (!completedAppointments.isEmpty()) {
            double avgDuration = completedAppointments.stream()
                    .mapToInt(Appointment::getDurationMinutes)
                    .average()
                    .orElse(0.0);
            statistics.setAvgConsultationTime((int) Math.round(avgDuration));
        } else {
            statistics.setAvgConsultationTime(0);
        }
        
        // Calculate total revenue
        BigDecimal totalRevenue = completedAppointments.stream()
                .map(a -> doctor.getConsultationFee() != null ? doctor.getConsultationFee() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        statistics.setTotalRevenue(totalRevenue);
        
        // Update timestamp
        statistics.setLastCalculatedAt(LocalDateTime.now());
        
        // Save statistics
        statistics = statisticsRepository.save(statistics);
        
        logger.info("Statistics calculated and cached for doctor {}: {} total appointments, {} completed", 
                doctorId, statistics.getTotalAppointments(), statistics.getCompletedAppointments());
        
        return statistics;
    }
    
    /**
     * Update statistics after appointment status change
     */
    @Transactional
    public void updateStatisticsForAppointment(Long doctorId, AppointmentStatus oldStatus, AppointmentStatus newStatus) {
        DoctorStatistics statistics = getOrCreateStatistics(doctorId);
        
        // Decrement old status count
        if (oldStatus != null) {
            decrementStatusCount(statistics, oldStatus);
        }
        
        // Increment new status count
        incrementStatusCount(statistics, newStatus);
        
        // Update total if it's a new appointment
        if (oldStatus == null) {
            statistics.setTotalAppointments(statistics.getTotalAppointments() + 1);
        }
        
        statistics.setLastCalculatedAt(LocalDateTime.now());
        statisticsRepository.save(statistics);
        
        logger.debug("Statistics updated for doctor {}: oldStatus={}, newStatus={}", 
                doctorId, oldStatus, newStatus);
    }
    
    /**
     * Recalculate statistics for all doctors (scheduled task)
     */
    @Transactional
    @Scheduled(cron = "0 0 2 * * ?") // Run at 2 AM daily
    public void recalculateAllStatistics() {
        logger.info("Starting scheduled statistics recalculation for all doctors");
        
        List<Doctor> doctors = doctorRepository.findAll();
        int successCount = 0;
        int errorCount = 0;
        
        for (Doctor doctor : doctors) {
            try {
                calculateAndCacheStatistics(doctor.getId());
                successCount++;
            } catch (Exception e) {
                logger.error("Error calculating statistics for doctor {}: {}", 
                        doctor.getId(), e.getMessage());
                errorCount++;
            }
        }
        
        logger.info("Completed scheduled statistics recalculation: {} successful, {} errors", 
                successCount, errorCount);
    }
    
    /**
     * Get appointment trend data
     */
    public Map<LocalDate, Integer> getAppointmentTrend(Long doctorId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        List<Appointment> appointments = appointmentRepository.findDoctorAppointmentsInDateRange(
                doctorId, startDateTime, endDateTime);
        
        // Group by date
        Map<LocalDate, Integer> trend = new HashMap<>();
        LocalDate currentDate = startDate;
        
        // Initialize all dates with 0
        while (!currentDate.isAfter(endDate)) {
            trend.put(currentDate, 0);
            currentDate = currentDate.plusDays(1);
        }
        
        // Count appointments per date
        for (Appointment appointment : appointments) {
            LocalDate date = appointment.getAppointmentDateTime().toLocalDate();
            trend.put(date, trend.getOrDefault(date, 0) + 1);
        }
        
        return trend;
    }
    
    /**
     * Get peak hours analysis
     */
    public Map<Integer, Integer> getPeakHoursAnalysis(Long doctorId) {
        List<Appointment> appointments = appointmentRepository.findByDoctorId(doctorId);
        
        Map<Integer, Integer> hourCounts = new HashMap<>();
        
        // Initialize all hours with 0
        for (int hour = 0; hour < 24; hour++) {
            hourCounts.put(hour, 0);
        }
        
        // Count appointments per hour
        for (Appointment appointment : appointments) {
            int hour = appointment.getAppointmentDateTime().getHour();
            hourCounts.put(hour, hourCounts.get(hour) + 1);
        }
        
        return hourCounts;
    }
    
    /**
     * Helper method to increment status count
     */
    private void incrementStatusCount(DoctorStatistics statistics, AppointmentStatus status) {
        switch (status) {
            case COMPLETED:
                statistics.setCompletedAppointments(statistics.getCompletedAppointments() + 1);
                break;
            case CANCELLED:
                statistics.setCancelledAppointments(statistics.getCancelledAppointments() + 1);
                break;
            case NO_SHOW:
                statistics.setNoShowAppointments(statistics.getNoShowAppointments() + 1);
                break;
            default:
                // SCHEDULED, RESCHEDULED don't have specific counters
                break;
        }
    }
    
    /**
     * Helper method to decrement status count
     */
    private void decrementStatusCount(DoctorStatistics statistics, AppointmentStatus status) {
        switch (status) {
            case COMPLETED:
                statistics.setCompletedAppointments(Math.max(0, statistics.getCompletedAppointments() - 1));
                break;
            case CANCELLED:
                statistics.setCancelledAppointments(Math.max(0, statistics.getCancelledAppointments() - 1));
                break;
            case NO_SHOW:
                statistics.setNoShowAppointments(Math.max(0, statistics.getNoShowAppointments() - 1));
                break;
            default:
                // SCHEDULED, RESCHEDULED don't have specific counters
                break;
        }
    }
}

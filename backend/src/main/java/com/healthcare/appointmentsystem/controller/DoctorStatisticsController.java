package com.healthcare.appointmentsystem.controller;

import com.healthcare.appointmentsystem.dto.DoctorStatisticsDTO;
import com.healthcare.appointmentsystem.service.DoctorStatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

/**
 * Controller for doctor statistics and analytics.
 * Handles performance metrics, analytics dashboards, and insights.
 */
@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DoctorStatisticsController {
    
    @Autowired
    private DoctorStatisticsService statisticsService;
    
    /**
     * Get comprehensive statistics for a doctor
     * Only the doctor themselves or admins can view statistics
     * 
     * @param doctorId Doctor ID
     * @return Doctor statistics
     */
    @GetMapping("/{doctorId}/statistics")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DOCTOR') and @doctorService.isDoctorOwner(#doctorId, authentication.principal.username))")
    public ResponseEntity<DoctorStatisticsDTO> getDoctorStatistics(@PathVariable Long doctorId) {
        DoctorStatisticsDTO statistics = statisticsService.getDoctorStatistics(doctorId)
                .map(DoctorStatisticsDTO::new)
                .orElseGet(() -> new DoctorStatisticsDTO(statisticsService.getOrCreateStatistics(doctorId)));
        return ResponseEntity.ok(statistics);
    }
    
    /**
     * Get analytics dashboard data for a doctor
     * Includes appointment trends, patient demographics, and performance metrics
     * 
     * @param doctorId Doctor ID
     * @param startDate Start date for analytics (optional)
     * @param endDate End date for analytics (optional)
     * @return Analytics dashboard data
     */
    @GetMapping("/{doctorId}/analytics/dashboard")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DOCTOR') and @doctorService.isDoctorOwner(#doctorId, authentication.principal.username))")
    public ResponseEntity<DoctorStatisticsDTO> getAnalyticsDashboard(
            @PathVariable Long doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        // Default to last 30 days if no dates provided
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        DoctorStatisticsDTO dashboard = statisticsService.getComprehensiveStatistics(doctorId, startDate, endDate);
        return ResponseEntity.ok(dashboard);
    }
    
    /**
     * Get appointment statistics with trends
     * 
     * @param doctorId Doctor ID
     * @param startDate Start date
     * @param endDate End date
     * @return Appointment statistics
     */
    @GetMapping("/{doctorId}/analytics/appointments")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DOCTOR') and @doctorService.isDoctorOwner(#doctorId, authentication.principal.username))")
    public ResponseEntity<Map<String, Object>> getAppointmentStatistics(
            @PathVariable Long doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        Map<String, Object> statistics = new java.util.HashMap<>();
        statistics.put("trend", statisticsService.getAppointmentTrend(doctorId, startDate, endDate));
        statistics.put("cached", statisticsService.getDoctorStatistics(doctorId)
                .map(DoctorStatisticsDTO::new)
                .orElse(null));
        return ResponseEntity.ok(statistics);
    }
    
    /**
     * Get patient demographics and insights
     * 
     * @param doctorId Doctor ID
     * @return Patient demographics data
     */
    @GetMapping("/{doctorId}/analytics/demographics")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DOCTOR') and @doctorService.isDoctorOwner(#doctorId, authentication.principal.username))")
    public ResponseEntity<Map<String, Object>> getPatientDemographics(@PathVariable Long doctorId) {
        Map<String, Object> demographics = new java.util.HashMap<>();
        DoctorStatisticsDTO stats = statisticsService.getComprehensiveStatistics(
                doctorId, LocalDate.now().minusMonths(6), LocalDate.now());
        demographics.put("totalPatients", stats.getTotalPatients());
        demographics.put("returningPatients", stats.getReturningPatients());
        return ResponseEntity.ok(demographics);
    }
    
    /**
     * Get revenue metrics
     * 
     * @param doctorId Doctor ID
     * @param startDate Start date
     * @param endDate End date
     * @return Revenue metrics
     */
    @GetMapping("/{doctorId}/analytics/revenue")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DOCTOR') and @doctorService.isDoctorOwner(#doctorId, authentication.principal.username))")
    public ResponseEntity<Map<String, Object>> getRevenueMetrics(
            @PathVariable Long doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        DoctorStatisticsDTO stats = statisticsService.getComprehensiveStatistics(doctorId, startDate, endDate);
        Map<String, Object> revenue = new java.util.HashMap<>();
        revenue.put("totalRevenue", stats.getTotalRevenue());
        revenue.put("averagePerAppointment", stats.getAvgRevenuePerAppointment());
        return ResponseEntity.ok(revenue);
    }
    
    /**
     * Get performance metrics
     * Includes consultation time averages, patient retention, booking conversion
     * 
     * @param doctorId Doctor ID
     * @return Performance metrics
     */
    @GetMapping("/{doctorId}/analytics/performance")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DOCTOR') and @doctorService.isDoctorOwner(#doctorId, authentication.principal.username))")
    public ResponseEntity<Map<String, Object>> getPerformanceMetrics(@PathVariable Long doctorId) {
        DoctorStatisticsDTO stats = statisticsService.getComprehensiveStatistics(
                doctorId, LocalDate.now().minusMonths(3), LocalDate.now());
        Map<String, Object> performance = new java.util.HashMap<>();
        performance.put("averageConsultationTime", stats.getAvgConsultationTime());
        performance.put("patientRetentionRate", stats.getPatientRetentionRate());
        return ResponseEntity.ok(performance);
    }
    
    /**
     * Get peak hours analysis
     * Identifies busiest time slots and days of the week
     * 
     * @param doctorId Doctor ID
     * @param startDate Start date
     * @param endDate End date
     * @return Peak hours data
     */
    @GetMapping("/{doctorId}/analytics/peak-hours")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DOCTOR') and @doctorService.isDoctorOwner(#doctorId, authentication.principal.username))")
    public ResponseEntity<Map<String, Object>> getPeakHours(
            @PathVariable Long doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Map<String, Object> peakHours = new java.util.HashMap<>();
        peakHours.put("hourlyDistribution", statisticsService.getPeakHoursAnalysis(doctorId));
        return ResponseEntity.ok(peakHours);
    }
    
    /**
     * Get actionable insights and recommendations
     * 
     * @param doctorId Doctor ID
     * @return Insights and recommendations
     */
    @GetMapping("/{doctorId}/analytics/insights")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DOCTOR') and @doctorService.isDoctorOwner(#doctorId, authentication.principal.username))")
    public ResponseEntity<Map<String, Object>> getInsights(@PathVariable Long doctorId) {
        Map<String, Object> insights = new java.util.HashMap<>();
        DoctorStatisticsDTO stats = statisticsService.getComprehensiveStatistics(
                doctorId, LocalDate.now().minusMonths(1), LocalDate.now());
        insights.put("statistics", stats);
        insights.put("recommendations", java.util.List.of(
                "Consider adding more availability during peak hours",
                "Follow up with patients who haven't returned in 3+ months"
        ));
        return ResponseEntity.ok(insights);
    }
    
    /**
     * Refresh/recalculate statistics cache
     * 
     * @param doctorId Doctor ID
     * @return Updated statistics
     */
    @PostMapping("/{doctorId}/statistics/refresh")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DOCTOR') and @doctorService.isDoctorOwner(#doctorId, authentication.principal.username))")
    public ResponseEntity<DoctorStatisticsDTO> refreshStatistics(@PathVariable Long doctorId) {
        DoctorStatisticsDTO statistics = new DoctorStatisticsDTO(
                statisticsService.calculateAndCacheStatistics(doctorId));
        return ResponseEntity.ok(statistics);
    }
}

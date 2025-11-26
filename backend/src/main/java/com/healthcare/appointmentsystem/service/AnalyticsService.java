package com.healthcare.appointmentsystem.service;

import com.healthcare.appointmentsystem.dto.AppointmentTrendData;
import com.healthcare.appointmentsystem.dto.DashboardAnalytics;
import com.healthcare.appointmentsystem.dto.DoctorPerformanceData;
import com.healthcare.appointmentsystem.dto.UserGrowthData;
import com.healthcare.appointmentsystem.entity.AppointmentStatus;
import com.healthcare.appointmentsystem.repository.AppointmentRepository;
import com.healthcare.appointmentsystem.repository.DoctorRepository;
import com.healthcare.appointmentsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    public DashboardAnalytics getDashboardAnalytics(LocalDate startDate, LocalDate endDate) {
        List<UserGrowthData> userGrowth = getUserGrowth("30d");
        List<AppointmentTrendData> appointmentTrends = getAppointmentTrends("30d");
        List<DoctorPerformanceData> doctorPerformance = getDoctorPerformanceMetrics();
        Map<String, Object> systemHealth = getSystemHealthMetrics();
        
        return new DashboardAnalytics(userGrowth, appointmentTrends, doctorPerformance, systemHealth);
    }
    
    public List<AppointmentTrendData> getAppointmentTrends(String period) {
        int days = parsePeriodToDays(period);
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);
        
        List<AppointmentTrendData> trends = new ArrayList<>();
        
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            LocalDateTime dayStart = date.atStartOfDay();
            LocalDateTime dayEnd = date.plusDays(1).atStartOfDay();
            
            long scheduled = appointmentRepository.countByAppointmentDateTimeBetweenAndStatus(
                dayStart, dayEnd, AppointmentStatus.SCHEDULED);
            long completed = appointmentRepository.countByAppointmentDateTimeBetweenAndStatus(
                dayStart, dayEnd, AppointmentStatus.COMPLETED);
            long cancelled = appointmentRepository.countByAppointmentDateTimeBetweenAndStatus(
                dayStart, dayEnd, AppointmentStatus.CANCELLED);
            
            trends.add(new AppointmentTrendData(date, scheduled, completed, cancelled));
        }
        
        return trends;
    }
    
    public List<UserGrowthData> getUserGrowth(String period) {
        int days = parsePeriodToDays(period);
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);
        
        List<UserGrowthData> growth = new ArrayList<>();
        long cumulativeCount = 0;
        
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            // In a real implementation, you'd query users created before this date
            // For now, we'll use a simple count
            long count = userRepository.count();
            growth.add(new UserGrowthData(date, count));
        }
        
        return growth;
    }
    
    public Map<String, Object> getSystemHealthMetrics() {
        Map<String, Object> health = new HashMap<>();
        
        long totalUsers = userRepository.count();
        long totalDoctors = doctorRepository.count();
        long totalAppointments = appointmentRepository.count();
        
        long completedAppointments = appointmentRepository.countByStatus(AppointmentStatus.COMPLETED);
        long cancelledAppointments = appointmentRepository.countByStatus(AppointmentStatus.CANCELLED);
        
        double completionRate = totalAppointments > 0 ? 
            (double) completedAppointments / totalAppointments * 100 : 0;
        double cancellationRate = totalAppointments > 0 ? 
            (double) cancelledAppointments / totalAppointments * 100 : 0;
        
        health.put("totalUsers", totalUsers);
        health.put("totalDoctors", totalDoctors);
        health.put("totalAppointments", totalAppointments);
        health.put("completionRate", completionRate);
        health.put("cancellationRate", cancellationRate);
        health.put("doctorToPatientRatio", totalUsers > 0 ? (double) totalDoctors / totalUsers : 0);
        
        return health;
    }
    
    public List<DoctorPerformanceData> getDoctorPerformanceMetrics() {
        return doctorRepository.findAll().stream()
            .map(doctor -> {
                long appointmentCount = appointmentRepository.countByDoctorId(doctor.getId());
                double rating = doctor.getRating() != null ? doctor.getRating() : 0.0;
                String name = doctor.getUser() != null ? doctor.getUser().getFullName() : "Unknown";
                return new DoctorPerformanceData(doctor.getId(), name, rating, appointmentCount);
            })
            .sorted((a, b) -> Long.compare(b.getAppointmentCount(), a.getAppointmentCount()))
            .limit(10)
            .collect(Collectors.toList());
    }
    
    private int parsePeriodToDays(String period) {
        if (period == null || period.isEmpty()) {
            return 30;
        }
        
        try {
            if (period.endsWith("d")) {
                return Integer.parseInt(period.substring(0, period.length() - 1));
            } else if (period.endsWith("m")) {
                return Integer.parseInt(period.substring(0, period.length() - 1)) * 30;
            } else if (period.endsWith("y")) {
                return Integer.parseInt(period.substring(0, period.length() - 1)) * 365;
            }
        } catch (NumberFormatException e) {
            // Return default
        }
        
        return 30;
    }
}

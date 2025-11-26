package com.healthcare.appointmentsystem.dto;

import com.healthcare.appointmentsystem.entity.DoctorStatistics;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class DoctorStatisticsDTO {
    
    private Long id;
    private Long doctorId;
    
    // Appointment statistics
    private Integer totalAppointments;
    private Integer completedAppointments;
    private Integer cancelledAppointments;
    private Integer noShowAppointments;
    
    // Patient statistics
    private Integer totalPatients;
    private Integer returningPatients;
    
    // Performance metrics
    private Integer avgConsultationTime; // in minutes
    private BigDecimal totalRevenue;
    private BigDecimal avgRevenuePerAppointment;
    
    // Rating and review statistics
    private Double avgRating;
    private Integer totalReviews;
    private Double patientSatisfactionRate; // percentage
    
    // Conversion metrics
    private Double bookingConversionRate; // percentage
    
    // Computed rates
    private Double completionRate; // percentage
    private Double cancellationRate; // percentage
    private Double noShowRate; // percentage
    private Double patientRetentionRate; // percentage
    
    // Timestamp
    private LocalDateTime lastCalculatedAt;
    
    // Trend data (optional)
    private List<AppointmentTrendData> appointmentTrends;
    private List<RevenueTrendData> revenueTrends;
    
    // Constructors
    public DoctorStatisticsDTO() {
        this.appointmentTrends = new ArrayList<>();
        this.revenueTrends = new ArrayList<>();
    }
    
    public DoctorStatisticsDTO(DoctorStatistics statistics) {
        this();
        if (statistics != null) {
            this.id = statistics.getId();
            this.doctorId = statistics.getDoctor() != null ? statistics.getDoctor().getId() : null;
            this.totalAppointments = statistics.getTotalAppointments();
            this.completedAppointments = statistics.getCompletedAppointments();
            this.cancelledAppointments = statistics.getCancelledAppointments();
            this.noShowAppointments = statistics.getNoShowAppointments();
            this.totalPatients = statistics.getTotalPatients();
            this.returningPatients = statistics.getReturningPatients();
            this.avgConsultationTime = statistics.getAvgConsultationTime();
            this.totalRevenue = statistics.getTotalRevenue();
            this.avgRevenuePerAppointment = statistics.getAvgRevenuePerAppointment();
            this.avgRating = statistics.getAvgRating();
            this.totalReviews = statistics.getTotalReviews();
            this.patientSatisfactionRate = statistics.getPatientSatisfactionRate();
            this.bookingConversionRate = statistics.getBookingConversionRate();
            this.completionRate = statistics.getCompletionRate();
            this.cancellationRate = statistics.getCancellationRate();
            this.noShowRate = statistics.getNoShowRate();
            this.patientRetentionRate = statistics.getPatientRetentionRate();
            this.lastCalculatedAt = statistics.getLastCalculatedAt();
        }
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getDoctorId() {
        return doctorId;
    }
    
    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }
    
    public Integer getTotalAppointments() {
        return totalAppointments;
    }
    
    public void setTotalAppointments(Integer totalAppointments) {
        this.totalAppointments = totalAppointments;
    }
    
    public Integer getCompletedAppointments() {
        return completedAppointments;
    }
    
    public void setCompletedAppointments(Integer completedAppointments) {
        this.completedAppointments = completedAppointments;
    }
    
    public Integer getCancelledAppointments() {
        return cancelledAppointments;
    }
    
    public void setCancelledAppointments(Integer cancelledAppointments) {
        this.cancelledAppointments = cancelledAppointments;
    }
    
    public Integer getNoShowAppointments() {
        return noShowAppointments;
    }
    
    public void setNoShowAppointments(Integer noShowAppointments) {
        this.noShowAppointments = noShowAppointments;
    }
    
    public Integer getTotalPatients() {
        return totalPatients;
    }
    
    public void setTotalPatients(Integer totalPatients) {
        this.totalPatients = totalPatients;
    }
    
    public Integer getReturningPatients() {
        return returningPatients;
    }
    
    public void setReturningPatients(Integer returningPatients) {
        this.returningPatients = returningPatients;
    }
    
    public Integer getAvgConsultationTime() {
        return avgConsultationTime;
    }
    
    public void setAvgConsultationTime(Integer avgConsultationTime) {
        this.avgConsultationTime = avgConsultationTime;
    }
    
    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }
    
    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }
    
    public BigDecimal getAvgRevenuePerAppointment() {
        return avgRevenuePerAppointment;
    }
    
    public void setAvgRevenuePerAppointment(BigDecimal avgRevenuePerAppointment) {
        this.avgRevenuePerAppointment = avgRevenuePerAppointment;
    }
    
    public Double getAvgRating() {
        return avgRating;
    }
    
    public void setAvgRating(Double avgRating) {
        this.avgRating = avgRating;
    }
    
    public Integer getTotalReviews() {
        return totalReviews;
    }
    
    public void setTotalReviews(Integer totalReviews) {
        this.totalReviews = totalReviews;
    }
    
    public Double getPatientSatisfactionRate() {
        return patientSatisfactionRate;
    }
    
    public void setPatientSatisfactionRate(Double patientSatisfactionRate) {
        this.patientSatisfactionRate = patientSatisfactionRate;
    }
    
    public Double getBookingConversionRate() {
        return bookingConversionRate;
    }
    
    public void setBookingConversionRate(Double bookingConversionRate) {
        this.bookingConversionRate = bookingConversionRate;
    }
    
    public Double getCompletionRate() {
        return completionRate;
    }
    
    public void setCompletionRate(Double completionRate) {
        this.completionRate = completionRate;
    }
    
    public Double getCancellationRate() {
        return cancellationRate;
    }
    
    public void setCancellationRate(Double cancellationRate) {
        this.cancellationRate = cancellationRate;
    }
    
    public Double getNoShowRate() {
        return noShowRate;
    }
    
    public void setNoShowRate(Double noShowRate) {
        this.noShowRate = noShowRate;
    }
    
    public Double getPatientRetentionRate() {
        return patientRetentionRate;
    }
    
    public void setPatientRetentionRate(Double patientRetentionRate) {
        this.patientRetentionRate = patientRetentionRate;
    }
    
    public LocalDateTime getLastCalculatedAt() {
        return lastCalculatedAt;
    }
    
    public void setLastCalculatedAt(LocalDateTime lastCalculatedAt) {
        this.lastCalculatedAt = lastCalculatedAt;
    }
    
    public List<AppointmentTrendData> getAppointmentTrends() {
        return appointmentTrends;
    }
    
    public void setAppointmentTrends(List<AppointmentTrendData> appointmentTrends) {
        this.appointmentTrends = appointmentTrends;
    }
    
    public List<RevenueTrendData> getRevenueTrends() {
        return revenueTrends;
    }
    
    public void setRevenueTrends(List<RevenueTrendData> revenueTrends) {
        this.revenueTrends = revenueTrends;
    }
    
    // Nested classes for trend data
    public static class AppointmentTrendData {
        private String period; // e.g., "2025-11", "Week 47", "2025-11-24"
        private Integer total;
        private Integer completed;
        private Integer cancelled;
        private Integer noShow;
        
        public AppointmentTrendData() {}
        
        public AppointmentTrendData(String period, Integer total, Integer completed, Integer cancelled, Integer noShow) {
            this.period = period;
            this.total = total;
            this.completed = completed;
            this.cancelled = cancelled;
            this.noShow = noShow;
        }
        
        public String getPeriod() {
            return period;
        }
        
        public void setPeriod(String period) {
            this.period = period;
        }
        
        public Integer getTotal() {
            return total;
        }
        
        public void setTotal(Integer total) {
            this.total = total;
        }
        
        public Integer getCompleted() {
            return completed;
        }
        
        public void setCompleted(Integer completed) {
            this.completed = completed;
        }
        
        public Integer getCancelled() {
            return cancelled;
        }
        
        public void setCancelled(Integer cancelled) {
            this.cancelled = cancelled;
        }
        
        public Integer getNoShow() {
            return noShow;
        }
        
        public void setNoShow(Integer noShow) {
            this.noShow = noShow;
        }
    }
    
    public static class RevenueTrendData {
        private String period; // e.g., "2025-11", "Week 47", "2025-11-24"
        private BigDecimal revenue;
        private Integer appointmentCount;
        
        public RevenueTrendData() {}
        
        public RevenueTrendData(String period, BigDecimal revenue, Integer appointmentCount) {
            this.period = period;
            this.revenue = revenue;
            this.appointmentCount = appointmentCount;
        }
        
        public String getPeriod() {
            return period;
        }
        
        public void setPeriod(String period) {
            this.period = period;
        }
        
        public BigDecimal getRevenue() {
            return revenue;
        }
        
        public void setRevenue(BigDecimal revenue) {
            this.revenue = revenue;
        }
        
        public Integer getAppointmentCount() {
            return appointmentCount;
        }
        
        public void setAppointmentCount(Integer appointmentCount) {
            this.appointmentCount = appointmentCount;
        }
    }
    
    @Override
    public String toString() {
        return "DoctorStatisticsDTO{" +
                "id=" + id +
                ", doctorId=" + doctorId +
                ", totalAppointments=" + totalAppointments +
                ", completedAppointments=" + completedAppointments +
                ", avgRating=" + avgRating +
                ", totalRevenue=" + totalRevenue +
                ", completionRate=" + completionRate +
                '}';
    }
}

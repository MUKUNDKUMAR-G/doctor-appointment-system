package com.healthcare.appointmentsystem.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctor_statistics", indexes = {
    @Index(name = "idx_doctor_statistics_doctor_id", columnList = "doctor_id")
})
public class DoctorStatistics {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false, unique = true)
    @NotNull(message = "Doctor is required")
    private Doctor doctor;
    
    @Column(name = "total_appointments", nullable = false)
    @Min(value = 0, message = "Total appointments cannot be negative")
    private Integer totalAppointments = 0;
    
    @Column(name = "completed_appointments", nullable = false)
    @Min(value = 0, message = "Completed appointments cannot be negative")
    private Integer completedAppointments = 0;
    
    @Column(name = "cancelled_appointments", nullable = false)
    @Min(value = 0, message = "Cancelled appointments cannot be negative")
    private Integer cancelledAppointments = 0;
    
    @Column(name = "no_show_appointments", nullable = false)
    @Min(value = 0, message = "No-show appointments cannot be negative")
    private Integer noShowAppointments = 0;
    
    @Column(name = "total_patients", nullable = false)
    @Min(value = 0, message = "Total patients cannot be negative")
    private Integer totalPatients = 0;
    
    @Column(name = "returning_patients", nullable = false)
    @Min(value = 0, message = "Returning patients cannot be negative")
    private Integer returningPatients = 0;
    
    @Column(name = "avg_consultation_time", nullable = false)
    @Min(value = 0, message = "Average consultation time cannot be negative")
    private Integer avgConsultationTime = 0; // in minutes
    
    @Column(name = "total_revenue", precision = 12, scale = 2, nullable = false)
    @Min(value = 0, message = "Total revenue cannot be negative")
    private BigDecimal totalRevenue = BigDecimal.ZERO;
    
    @Column(name = "avg_rating")
    private Double avgRating = 0.0;
    
    @Column(name = "total_reviews", nullable = false)
    @Min(value = 0, message = "Total reviews cannot be negative")
    private Integer totalReviews = 0;
    
    @Column(name = "patient_satisfaction_rate")
    private Double patientSatisfactionRate = 0.0; // percentage
    
    @Column(name = "booking_conversion_rate")
    private Double bookingConversionRate = 0.0; // percentage
    
    @UpdateTimestamp
    @Column(name = "last_calculated_at", nullable = false)
    private LocalDateTime lastCalculatedAt;
    
    // Constructors
    public DoctorStatistics() {}
    
    public DoctorStatistics(Doctor doctor) {
        this.doctor = doctor;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Doctor getDoctor() {
        return doctor;
    }
    
    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
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
    
    public LocalDateTime getLastCalculatedAt() {
        return lastCalculatedAt;
    }
    
    public void setLastCalculatedAt(LocalDateTime lastCalculatedAt) {
        this.lastCalculatedAt = lastCalculatedAt;
    }
    
    // Utility methods
    public Double getCompletionRate() {
        if (totalAppointments == 0) return 0.0;
        return (completedAppointments.doubleValue() / totalAppointments.doubleValue()) * 100;
    }
    
    public Double getCancellationRate() {
        if (totalAppointments == 0) return 0.0;
        return (cancelledAppointments.doubleValue() / totalAppointments.doubleValue()) * 100;
    }
    
    public Double getNoShowRate() {
        if (totalAppointments == 0) return 0.0;
        return (noShowAppointments.doubleValue() / totalAppointments.doubleValue()) * 100;
    }
    
    public Double getPatientRetentionRate() {
        if (totalPatients == 0) return 0.0;
        return (returningPatients.doubleValue() / totalPatients.doubleValue()) * 100;
    }
    
    public BigDecimal getAvgRevenuePerAppointment() {
        if (completedAppointments == 0) return BigDecimal.ZERO;
        return totalRevenue.divide(BigDecimal.valueOf(completedAppointments), 2, java.math.RoundingMode.HALF_UP);
    }
    
    public void incrementTotalAppointments() {
        this.totalAppointments++;
    }
    
    public void incrementCompletedAppointments() {
        this.completedAppointments++;
    }
    
    public void incrementCancelledAppointments() {
        this.cancelledAppointments++;
    }
    
    public void incrementNoShowAppointments() {
        this.noShowAppointments++;
    }
    
    public void addRevenue(BigDecimal amount) {
        this.totalRevenue = this.totalRevenue.add(amount);
    }
    
    @Override
    public String toString() {
        return "DoctorStatistics{" +
                "id=" + id +
                ", totalAppointments=" + totalAppointments +
                ", completedAppointments=" + completedAppointments +
                ", avgRating=" + avgRating +
                ", totalRevenue=" + totalRevenue +
                '}';
    }
}

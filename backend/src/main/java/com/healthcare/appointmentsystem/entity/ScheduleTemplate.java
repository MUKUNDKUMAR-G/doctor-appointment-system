package com.healthcare.appointmentsystem.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Entity representing a reusable schedule template for doctors
 */
@Entity
@Table(name = "schedule_templates", indexes = {
    @Index(name = "idx_schedule_template_doctor", columnList = "doctor_id"),
    @Index(name = "idx_schedule_template_name", columnList = "template_name")
})
public class ScheduleTemplate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;
    
    @Column(name = "template_name", nullable = false, length = 100)
    @NotBlank(message = "Template name is required")
    @Size(max = 100, message = "Template name cannot exceed 100 characters")
    private String templateName;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false, length = 10)
    @NotNull(message = "Day of week is required")
    private DayOfWeek dayOfWeek;
    
    @Column(name = "start_time", nullable = false)
    @NotNull(message = "Start time is required")
    private LocalTime startTime;
    
    @Column(name = "end_time", nullable = false)
    @NotNull(message = "End time is required")
    private LocalTime endTime;
    
    @Column(name = "slot_duration_minutes", nullable = false)
    @NotNull(message = "Slot duration is required")
    @Min(value = 15, message = "Slot duration must be at least 15 minutes")
    @Max(value = 240, message = "Slot duration cannot exceed 240 minutes")
    private Integer slotDurationMinutes = 30;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // Constructors
    public ScheduleTemplate() {}
    
    public ScheduleTemplate(Doctor doctor, String templateName, DayOfWeek dayOfWeek, 
                          LocalTime startTime, LocalTime endTime) {
        this.doctor = doctor;
        this.templateName = templateName;
        this.dayOfWeek = dayOfWeek;
        this.startTime = startTime;
        this.endTime = endTime;
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
    
    public String getTemplateName() {
        return templateName;
    }
    
    public void setTemplateName(String templateName) {
        this.templateName = templateName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public DayOfWeek getDayOfWeek() {
        return dayOfWeek;
    }
    
    public void setDayOfWeek(DayOfWeek dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }
    
    public LocalTime getStartTime() {
        return startTime;
    }
    
    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }
    
    public LocalTime getEndTime() {
        return endTime;
    }
    
    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }
    
    public Integer getSlotDurationMinutes() {
        return slotDurationMinutes;
    }
    
    public void setSlotDurationMinutes(Integer slotDurationMinutes) {
        this.slotDurationMinutes = slotDurationMinutes;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    @Override
    public String toString() {
        return "ScheduleTemplate{" +
                "id=" + id +
                ", templateName='" + templateName + '\'' +
                ", dayOfWeek=" + dayOfWeek +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", slotDurationMinutes=" + slotDurationMinutes +
                '}';
    }
}

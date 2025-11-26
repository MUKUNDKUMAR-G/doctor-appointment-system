package com.healthcare.appointmentsystem.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_templates")
public class NotificationTemplate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 100)
    @NotBlank(message = "Template name is required")
    private String name;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationType type;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationChannel channel;
    
    @Column(nullable = false, length = 200)
    @NotBlank(message = "Subject is required")
    private String subject;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    @NotBlank(message = "Body template is required")
    private String bodyTemplate;
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // Constructors
    public NotificationTemplate() {}
    
    public NotificationTemplate(String name, NotificationType type, NotificationChannel channel, 
                              String subject, String bodyTemplate) {
        this.name = name;
        this.type = type;
        this.channel = channel;
        this.subject = subject;
        this.bodyTemplate = bodyTemplate;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public NotificationType getType() {
        return type;
    }
    
    public void setType(NotificationType type) {
        this.type = type;
    }
    
    public NotificationChannel getChannel() {
        return channel;
    }
    
    public void setChannel(NotificationChannel channel) {
        this.channel = channel;
    }
    
    public String getSubject() {
        return subject;
    }
    
    public void setSubject(String subject) {
        this.subject = subject;
    }
    
    public String getBodyTemplate() {
        return bodyTemplate;
    }
    
    public void setBodyTemplate(String bodyTemplate) {
        this.bodyTemplate = bodyTemplate;
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
        return "NotificationTemplate{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", type=" + type +
                ", channel=" + channel +
                ", isActive=" + isActive +
                '}';
    }
}
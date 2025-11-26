package com.healthcare.appointmentsystem.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_logs", indexes = {
    @Index(name = "idx_notification_logs_appointment", columnList = "appointment_id"),
    @Index(name = "idx_notification_logs_recipient", columnList = "recipient_email"),
    @Index(name = "idx_notification_logs_status", columnList = "status"),
    @Index(name = "idx_notification_logs_sent_at", columnList = "sent_at")
})
public class NotificationLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationType type;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationChannel channel;
    
    @Column(nullable = false, length = 100)
    @NotBlank(message = "Recipient email is required")
    private String recipientEmail;
    
    @Column(length = 20)
    private String recipientPhone;
    
    @Column(nullable = false, length = 200)
    @NotBlank(message = "Subject is required")
    private String subject;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    @NotBlank(message = "Message content is required")
    private String messageContent;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationStatus status = NotificationStatus.PENDING;
    
    @Column(columnDefinition = "TEXT")
    private String errorMessage;
    
    @Column(name = "sent_at")
    private LocalDateTime sentAt;
    
    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;
    
    @Column(name = "read_at")
    private LocalDateTime readAt;
    
    @Column(name = "retry_count", nullable = false)
    private Integer retryCount = 0;
    
    @Column(name = "max_retries", nullable = false)
    private Integer maxRetries = 3;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Constructors
    public NotificationLog() {}
    
    public NotificationLog(Appointment appointment, NotificationType type, NotificationChannel channel,
                          String recipientEmail, String subject, String messageContent) {
        this.appointment = appointment;
        this.type = type;
        this.channel = channel;
        this.recipientEmail = recipientEmail;
        this.subject = subject;
        this.messageContent = messageContent;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Appointment getAppointment() {
        return appointment;
    }
    
    public void setAppointment(Appointment appointment) {
        this.appointment = appointment;
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
    
    public String getRecipientEmail() {
        return recipientEmail;
    }
    
    public void setRecipientEmail(String recipientEmail) {
        this.recipientEmail = recipientEmail;
    }
    
    public String getRecipientPhone() {
        return recipientPhone;
    }
    
    public void setRecipientPhone(String recipientPhone) {
        this.recipientPhone = recipientPhone;
    }
    
    public String getSubject() {
        return subject;
    }
    
    public void setSubject(String subject) {
        this.subject = subject;
    }
    
    public String getMessageContent() {
        return messageContent;
    }
    
    public void setMessageContent(String messageContent) {
        this.messageContent = messageContent;
    }
    
    public NotificationStatus getStatus() {
        return status;
    }
    
    public void setStatus(NotificationStatus status) {
        this.status = status;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    public LocalDateTime getSentAt() {
        return sentAt;
    }
    
    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }
    
    public LocalDateTime getDeliveredAt() {
        return deliveredAt;
    }
    
    public void setDeliveredAt(LocalDateTime deliveredAt) {
        this.deliveredAt = deliveredAt;
    }
    
    public LocalDateTime getReadAt() {
        return readAt;
    }
    
    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }
    
    public Integer getRetryCount() {
        return retryCount;
    }
    
    public void setRetryCount(Integer retryCount) {
        this.retryCount = retryCount;
    }
    
    public Integer getMaxRetries() {
        return maxRetries;
    }
    
    public void setMaxRetries(Integer maxRetries) {
        this.maxRetries = maxRetries;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    // Utility methods
    public boolean canRetry() {
        return retryCount < maxRetries && status == NotificationStatus.FAILED;
    }
    
    public void markAsSent() {
        this.status = NotificationStatus.SENT;
        this.sentAt = LocalDateTime.now();
    }
    
    public void markAsDelivered() {
        this.status = NotificationStatus.DELIVERED;
        this.deliveredAt = LocalDateTime.now();
    }
    
    public void markAsRead() {
        this.readAt = LocalDateTime.now();
    }
    
    public void markAsFailed(String errorMessage) {
        this.status = NotificationStatus.FAILED;
        this.errorMessage = errorMessage;
        this.retryCount++;
    }
    
    @Override
    public String toString() {
        return "NotificationLog{" +
                "id=" + id +
                ", type=" + type +
                ", channel=" + channel +
                ", recipientEmail='" + recipientEmail + '\'' +
                ", status=" + status +
                ", sentAt=" + sentAt +
                '}';
    }
}
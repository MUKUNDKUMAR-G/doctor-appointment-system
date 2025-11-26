package com.healthcare.appointmentsystem.repository;

import com.healthcare.appointmentsystem.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    
    /**
     * Find logs by appointment
     */
    List<NotificationLog> findByAppointment(Appointment appointment);
    
    /**
     * Find logs by appointment ID
     */
    List<NotificationLog> findByAppointmentId(Long appointmentId);
    
    /**
     * Find logs by recipient email
     */
    List<NotificationLog> findByRecipientEmail(String recipientEmail);
    
    /**
     * Find logs by status
     */
    List<NotificationLog> findByStatus(NotificationStatus status);
    
    /**
     * Find logs by type and status
     */
    List<NotificationLog> findByTypeAndStatus(NotificationType type, NotificationStatus status);
    
    /**
     * Find logs by channel and status
     */
    List<NotificationLog> findByChannelAndStatus(NotificationChannel channel, NotificationStatus status);
    
    /**
     * Find failed notifications that can be retried
     */
    @Query("SELECT n FROM NotificationLog n WHERE n.status = 'FAILED' AND n.retryCount < n.maxRetries")
    List<NotificationLog> findFailedNotificationsForRetry();
    
    /**
     * Find notifications sent in date range
     */
    @Query("SELECT n FROM NotificationLog n WHERE n.sentAt >= :startDate AND n.sentAt <= :endDate")
    List<NotificationLog> findNotificationsSentInDateRange(@Param("startDate") LocalDateTime startDate,
                                                          @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find pending notifications older than specified time
     */
    @Query("SELECT n FROM NotificationLog n WHERE n.status = 'PENDING' AND n.createdAt < :cutoffTime")
    List<NotificationLog> findPendingNotificationsOlderThan(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    /**
     * Count notifications by status
     */
    long countByStatus(NotificationStatus status);
    
    /**
     * Count notifications by type
     */
    long countByType(NotificationType type);
    
    /**
     * Count notifications by channel
     */
    long countByChannel(NotificationChannel channel);
    
    /**
     * Count notifications for appointment
     */
    long countByAppointmentId(Long appointmentId);
    
    /**
     * Find recent notifications for recipient
     */
    @Query("SELECT n FROM NotificationLog n WHERE n.recipientEmail = :email " +
           "AND n.createdAt >= :since ORDER BY n.createdAt DESC")
    List<NotificationLog> findRecentNotificationsForRecipient(@Param("email") String email,
                                                             @Param("since") LocalDateTime since);
    
    /**
     * Find delivery statistics for date range
     */
    @Query("SELECT n.status, COUNT(n) FROM NotificationLog n " +
           "WHERE n.createdAt >= :startDate AND n.createdAt <= :endDate " +
           "GROUP BY n.status")
    List<Object[]> findDeliveryStatistics(@Param("startDate") LocalDateTime startDate,
                                        @Param("endDate") LocalDateTime endDate);
}
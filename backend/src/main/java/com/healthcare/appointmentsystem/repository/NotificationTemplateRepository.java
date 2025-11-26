package com.healthcare.appointmentsystem.repository;

import com.healthcare.appointmentsystem.entity.NotificationChannel;
import com.healthcare.appointmentsystem.entity.NotificationTemplate;
import com.healthcare.appointmentsystem.entity.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, Long> {
    
    /**
     * Find template by name
     */
    Optional<NotificationTemplate> findByName(String name);
    
    /**
     * Find template by type and channel
     */
    Optional<NotificationTemplate> findByTypeAndChannel(NotificationType type, NotificationChannel channel);
    
    /**
     * Find active templates by type
     */
    List<NotificationTemplate> findByTypeAndIsActiveTrue(NotificationType type);
    
    /**
     * Find active templates by channel
     */
    List<NotificationTemplate> findByChannelAndIsActiveTrue(NotificationChannel channel);
    
    /**
     * Find all active templates
     */
    List<NotificationTemplate> findByIsActiveTrue();
    
    /**
     * Check if template exists by name
     */
    boolean existsByName(String name);
    
    /**
     * Count templates by type
     */
    long countByType(NotificationType type);
    
    /**
     * Count active templates
     */
    long countByIsActiveTrue();
}
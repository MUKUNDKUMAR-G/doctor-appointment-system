package com.healthcare.appointmentsystem.migration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

/**
 * Interface for alert notification services
 * Allows different notification implementations (email, SMS, etc.)
 * 
 * Requirements addressed:
 * - 4.1: Send alerts to administrators
 * - 4.2: Implement failure notification system
 */
public interface AlertNotificationService {
    
    /**
     * Sends an alert notification
     * 
     * @param alert The alert to send
     * @return true if notification was sent successfully
     */
    boolean sendAlert(MigrationAlert alert);
    
    /**
     * Sends multiple alerts in batch
     * 
     * @param alerts List of alerts to send
     * @return Number of successfully sent alerts
     */
    int sendAlerts(List<MigrationAlert> alerts);
    
    /**
     * Checks if this notification service is enabled
     * 
     * @return true if enabled
     */
    boolean isEnabled();
}

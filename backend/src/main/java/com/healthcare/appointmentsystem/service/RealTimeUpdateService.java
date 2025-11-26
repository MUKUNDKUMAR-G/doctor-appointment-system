package com.healthcare.appointmentsystem.service;

import com.healthcare.appointmentsystem.dto.RealTimeUpdateDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * Service for broadcasting real-time updates via WebSocket
 */
@Service
public class RealTimeUpdateService {
    
    private static final Logger log = LoggerFactory.getLogger(RealTimeUpdateService.class);
    
    private final SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    public RealTimeUpdateService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }
    
    /**
     * Broadcast stats update to all admin clients
     */
    public void broadcastStatsUpdate(Object stats) {
        RealTimeUpdateDTO update = new RealTimeUpdateDTO("STATS", "UPDATED", stats);
        messagingTemplate.convertAndSend("/topic/admin/stats", update);
        log.debug("Broadcasted stats update");
    }
    
    /**
     * Broadcast user status update
     */
    public void broadcastUserUpdate(String action, Object userData) {
        RealTimeUpdateDTO update = new RealTimeUpdateDTO("USER", action, userData);
        messagingTemplate.convertAndSend("/topic/admin/users", update);
        log.debug("Broadcasted user update: {}", action);
    }
    
    /**
     * Broadcast doctor verification update
     */
    public void broadcastDoctorUpdate(String action, Object doctorData) {
        RealTimeUpdateDTO update = new RealTimeUpdateDTO("DOCTOR", action, doctorData);
        messagingTemplate.convertAndSend("/topic/admin/doctors", update);
        log.debug("Broadcasted doctor update: {}", action);
    }
    
    /**
     * Broadcast appointment update
     */
    public void broadcastAppointmentUpdate(String action, Object appointmentData) {
        RealTimeUpdateDTO update = new RealTimeUpdateDTO("APPOINTMENT", action, appointmentData);
        messagingTemplate.convertAndSend("/topic/admin/appointments", update);
        log.debug("Broadcasted appointment update: {}", action);
    }
    
    /**
     * Broadcast notification to admin users
     */
    public void broadcastNotification(Object notificationData) {
        RealTimeUpdateDTO update = new RealTimeUpdateDTO("NOTIFICATION", "CREATED", notificationData);
        messagingTemplate.convertAndSend("/topic/admin/notifications", update);
        log.debug("Broadcasted notification");
    }
}

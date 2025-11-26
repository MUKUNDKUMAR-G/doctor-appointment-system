package com.healthcare.appointmentsystem.dto;

import java.time.LocalDateTime;

/**
 * DTO for real-time update messages sent via WebSocket
 */
public class RealTimeUpdateDTO {
    private String type; // STATS, USER, DOCTOR, APPOINTMENT, NOTIFICATION
    private String action; // CREATED, UPDATED, DELETED, STATUS_CHANGED
    private Object data;
    private LocalDateTime timestamp;
    
    public RealTimeUpdateDTO() {
    }
    
    public RealTimeUpdateDTO(String type, String action, Object data, LocalDateTime timestamp) {
        this.type = type;
        this.action = action;
        this.data = data;
        this.timestamp = timestamp;
    }
    
    public RealTimeUpdateDTO(String type, String action, Object data) {
        this.type = type;
        this.action = action;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getAction() {
        return action;
    }
    
    public void setAction(String action) {
        this.action = action;
    }
    
    public Object getData() {
        return data;
    }
    
    public void setData(Object data) {
        this.data = data;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}

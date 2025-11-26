package com.healthcare.appointmentsystem.dto;

import java.time.LocalDate;

public class AppointmentTrendData {
    private LocalDate date;
    private long scheduled;
    private long completed;
    private long cancelled;
    
    public AppointmentTrendData() {}
    
    public AppointmentTrendData(LocalDate date, long scheduled, long completed, long cancelled) {
        this.date = date;
        this.scheduled = scheduled;
        this.completed = completed;
        this.cancelled = cancelled;
    }
    
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public long getScheduled() {
        return scheduled;
    }
    
    public void setScheduled(long scheduled) {
        this.scheduled = scheduled;
    }
    
    public long getCompleted() {
        return completed;
    }
    
    public void setCompleted(long completed) {
        this.completed = completed;
    }
    
    public long getCancelled() {
        return cancelled;
    }
    
    public void setCancelled(long cancelled) {
        this.cancelled = cancelled;
    }
}

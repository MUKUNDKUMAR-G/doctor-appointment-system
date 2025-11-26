package com.healthcare.appointmentsystem.dto;

import java.util.List;

public class DashboardResponse {
    
    private List<AppointmentResponse> upcomingAppointments;
    private DashboardStatistics statistics;
    private List<RecentActivity> recentActivities;
    
    // Constructors
    public DashboardResponse() {}
    
    public DashboardResponse(List<AppointmentResponse> upcomingAppointments, 
                           DashboardStatistics statistics,
                           List<RecentActivity> recentActivities) {
        this.upcomingAppointments = upcomingAppointments;
        this.statistics = statistics;
        this.recentActivities = recentActivities;
    }
    
    // Getters and Setters
    public List<AppointmentResponse> getUpcomingAppointments() {
        return upcomingAppointments;
    }
    
    public void setUpcomingAppointments(List<AppointmentResponse> upcomingAppointments) {
        this.upcomingAppointments = upcomingAppointments;
    }
    
    public DashboardStatistics getStatistics() {
        return statistics;
    }
    
    public void setStatistics(DashboardStatistics statistics) {
        this.statistics = statistics;
    }
    
    public List<RecentActivity> getRecentActivities() {
        return recentActivities;
    }
    
    public void setRecentActivities(List<RecentActivity> recentActivities) {
        this.recentActivities = recentActivities;
    }
    
    // Inner class for statistics
    public static class DashboardStatistics {
        private Long totalAppointments;
        private Long completedAppointments;
        private Long upcomingAppointments;
        private Long cancelledAppointments;
        
        public DashboardStatistics() {}
        
        public DashboardStatistics(Long totalAppointments, Long completedAppointments, 
                                 Long upcomingAppointments, Long cancelledAppointments) {
            this.totalAppointments = totalAppointments;
            this.completedAppointments = completedAppointments;
            this.upcomingAppointments = upcomingAppointments;
            this.cancelledAppointments = cancelledAppointments;
        }
        
        public Long getTotalAppointments() {
            return totalAppointments;
        }
        
        public void setTotalAppointments(Long totalAppointments) {
            this.totalAppointments = totalAppointments;
        }
        
        public Long getCompletedAppointments() {
            return completedAppointments;
        }
        
        public void setCompletedAppointments(Long completedAppointments) {
            this.completedAppointments = completedAppointments;
        }
        
        public Long getUpcomingAppointments() {
            return upcomingAppointments;
        }
        
        public void setUpcomingAppointments(Long upcomingAppointments) {
            this.upcomingAppointments = upcomingAppointments;
        }
        
        public Long getCancelledAppointments() {
            return cancelledAppointments;
        }
        
        public void setCancelledAppointments(Long cancelledAppointments) {
            this.cancelledAppointments = cancelledAppointments;
        }
    }
    
    // Inner class for recent activity
    public static class RecentActivity {
        private String type;
        private String description;
        private String timestamp;
        private String status;
        
        public RecentActivity() {}
        
        public RecentActivity(String type, String description, String timestamp, String status) {
            this.type = type;
            this.description = description;
            this.timestamp = timestamp;
            this.status = status;
        }
        
        public String getType() {
            return type;
        }
        
        public void setType(String type) {
            this.type = type;
        }
        
        public String getDescription() {
            return description;
        }
        
        public void setDescription(String description) {
            this.description = description;
        }
        
        public String getTimestamp() {
            return timestamp;
        }
        
        public void setTimestamp(String timestamp) {
            this.timestamp = timestamp;
        }
        
        public String getStatus() {
            return status;
        }
        
        public void setStatus(String status) {
            this.status = status;
        }
    }
}

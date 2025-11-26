package com.healthcare.appointmentsystem.dto;

import java.util.List;
import java.util.Map;

public class DashboardAnalytics {
    private List<UserGrowthData> userGrowth;
    private List<AppointmentTrendData> appointmentTrends;
    private List<DoctorPerformanceData> doctorPerformance;
    private Map<String, Object> systemHealth;
    
    public DashboardAnalytics() {}
    
    public DashboardAnalytics(List<UserGrowthData> userGrowth, List<AppointmentTrendData> appointmentTrends, 
                             List<DoctorPerformanceData> doctorPerformance, Map<String, Object> systemHealth) {
        this.userGrowth = userGrowth;
        this.appointmentTrends = appointmentTrends;
        this.doctorPerformance = doctorPerformance;
        this.systemHealth = systemHealth;
    }
    
    public List<UserGrowthData> getUserGrowth() {
        return userGrowth;
    }
    
    public void setUserGrowth(List<UserGrowthData> userGrowth) {
        this.userGrowth = userGrowth;
    }
    
    public List<AppointmentTrendData> getAppointmentTrends() {
        return appointmentTrends;
    }
    
    public void setAppointmentTrends(List<AppointmentTrendData> appointmentTrends) {
        this.appointmentTrends = appointmentTrends;
    }
    
    public List<DoctorPerformanceData> getDoctorPerformance() {
        return doctorPerformance;
    }
    
    public void setDoctorPerformance(List<DoctorPerformanceData> doctorPerformance) {
        this.doctorPerformance = doctorPerformance;
    }
    
    public Map<String, Object> getSystemHealth() {
        return systemHealth;
    }
    
    public void setSystemHealth(Map<String, Object> systemHealth) {
        this.systemHealth = systemHealth;
    }
}

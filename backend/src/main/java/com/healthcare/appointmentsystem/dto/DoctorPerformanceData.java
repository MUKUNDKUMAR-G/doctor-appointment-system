package com.healthcare.appointmentsystem.dto;

public class DoctorPerformanceData {
    private Long doctorId;
    private String name;
    private double rating;
    private long appointmentCount;
    
    public DoctorPerformanceData() {}
    
    public DoctorPerformanceData(Long doctorId, String name, double rating, long appointmentCount) {
        this.doctorId = doctorId;
        this.name = name;
        this.rating = rating;
        this.appointmentCount = appointmentCount;
    }
    
    public Long getDoctorId() {
        return doctorId;
    }
    
    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public double getRating() {
        return rating;
    }
    
    public void setRating(double rating) {
        this.rating = rating;
    }
    
    public long getAppointmentCount() {
        return appointmentCount;
    }
    
    public void setAppointmentCount(long appointmentCount) {
        this.appointmentCount = appointmentCount;
    }
}

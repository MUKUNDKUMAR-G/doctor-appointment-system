package com.healthcare.appointmentsystem.dto;

import java.util.List;

public class BulkDoctorRequest {
    private List<Long> doctorIds;
    
    public BulkDoctorRequest() {}
    
    public BulkDoctorRequest(List<Long> doctorIds) {
        this.doctorIds = doctorIds;
    }
    
    public List<Long> getDoctorIds() {
        return doctorIds;
    }
    
    public void setDoctorIds(List<Long> doctorIds) {
        this.doctorIds = doctorIds;
    }
}

package com.healthcare.appointmentsystem.dto;

import jakarta.validation.constraints.Size;

public class CancellationRequest {
    
    @Size(max = 500, message = "Cancellation reason cannot exceed 500 characters")
    private String cancellationReason;
    
    // Constructors
    public CancellationRequest() {}
    
    public CancellationRequest(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }
    
    // Getters and Setters
    public String getCancellationReason() {
        return cancellationReason;
    }
    
    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }
    
    @Override
    public String toString() {
        return "CancellationRequest{" +
                "cancellationReason='" + cancellationReason + '\'' +
                '}';
    }
}
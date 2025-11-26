package com.healthcare.appointmentsystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ReviewResponseDTO {
    
    @NotBlank(message = "Response is required")
    @Size(min = 10, max = 2000, message = "Response must be between 10 and 2000 characters")
    private String response;
    
    // Constructors
    public ReviewResponseDTO() {}
    
    public ReviewResponseDTO(String response) {
        this.response = response;
    }
    
    // Getters and Setters
    public String getResponse() {
        return response;
    }
    
    public void setResponse(String response) {
        this.response = response;
    }
    
    @Override
    public String toString() {
        return "ReviewResponseDTO{" +
                "response='" + (response != null ? response.substring(0, Math.min(50, response.length())) + "..." : "null") + '\'' +
                '}';
    }
}

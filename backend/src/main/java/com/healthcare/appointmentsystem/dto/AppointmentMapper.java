package com.healthcare.appointmentsystem.dto;

import com.healthcare.appointmentsystem.entity.Appointment;
import org.springframework.stereotype.Component;

@Component
public class AppointmentMapper {
    
    /**
     * Convert Appointment entity to AppointmentResponse DTO
     */
    public AppointmentResponse toResponse(Appointment appointment) {
        if (appointment == null) {
            return null;
        }
        
        AppointmentResponse response = new AppointmentResponse();
        response.setId(appointment.getId());
        response.setAppointmentDateTime(appointment.getAppointmentDateTime());
        response.setStatus(appointment.getStatus());
        response.setReason(appointment.getReason());
        response.setNotes(appointment.getNotes());
        response.setDurationMinutes(appointment.getDurationMinutes());
        response.setIsReserved(appointment.getIsReserved());
        response.setReservationExpiresAt(appointment.getReservationExpiresAt());
        response.setCancelledAt(appointment.getCancelledAt());
        response.setCancellationReason(appointment.getCancellationReason());
        response.setCreatedAt(appointment.getCreatedAt());
        response.setUpdatedAt(appointment.getUpdatedAt());
        
        // Patient information
        if (appointment.getPatient() != null) {
            response.setPatientId(appointment.getPatient().getId());
            response.setPatientName(appointment.getPatient().getFullName());
            response.setPatientEmail(appointment.getPatient().getEmail());
        }
        
        // Doctor information
        if (appointment.getDoctor() != null) {
            response.setDoctorId(appointment.getDoctor().getId());
            response.setDoctorName(appointment.getDoctor().getFullName());
            response.setDoctorSpecialty(appointment.getDoctor().getSpecialty());
        }
        
        return response;
    }
}
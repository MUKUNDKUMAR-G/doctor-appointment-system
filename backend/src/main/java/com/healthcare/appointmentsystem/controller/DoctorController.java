package com.healthcare.appointmentsystem.controller;

import com.healthcare.appointmentsystem.dto.DoctorResponse;
import com.healthcare.appointmentsystem.dto.TimeSlotResponse;
import com.healthcare.appointmentsystem.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DoctorController {
    
    @Autowired
    private DoctorService doctorService;
    
    /**
     * Get all available doctors
     */
    @GetMapping
    public ResponseEntity<List<DoctorResponse>> getAllDoctors(
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer minExperience,
            @RequestParam(required = false) Integer maxExperience,
            @RequestParam(required = false) Double minFee,
            @RequestParam(required = false) Double maxFee) {
        
        List<DoctorResponse> doctors;
        
        // Apply filters based on parameters
        if (search != null && !search.trim().isEmpty()) {
            doctors = doctorService.searchDoctors(search);
        } else if (specialty != null && !specialty.trim().isEmpty()) {
            doctors = doctorService.searchDoctorsBySpecialty(specialty);
        } else if (minExperience != null && maxExperience != null) {
            doctors = doctorService.getDoctorsByExperienceRange(minExperience, maxExperience);
        } else if (minFee != null && maxFee != null) {
            doctors = doctorService.getDoctorsByFeeRange(minFee, maxFee);
        } else {
            doctors = doctorService.getAllAvailableDoctors();
        }
        
        return ResponseEntity.ok(doctors);
    }
    
    /**
     * Get doctor by ID
     */
    @GetMapping("/{doctorId}")
    public ResponseEntity<DoctorResponse> getDoctorById(@PathVariable Long doctorId) {
        Optional<DoctorResponse> doctor = doctorService.getDoctorById(doctorId);
        
        if (doctor.isPresent()) {
            return ResponseEntity.ok(doctor.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get enhanced doctor profile with avatar, rating, and next available date
     */
    @GetMapping("/{doctorId}/profile")
    public ResponseEntity<DoctorResponse> getDoctorProfile(@PathVariable Long doctorId) {
        Optional<DoctorResponse> doctor = doctorService.getDoctorById(doctorId);
        
        if (doctor.isPresent()) {
            return ResponseEntity.ok(doctor.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Search doctors by specialty
     */
    @GetMapping("/search/specialty")
    public ResponseEntity<List<DoctorResponse>> searchBySpecialty(
            @RequestParam String specialty) {
        
        List<DoctorResponse> doctors = doctorService.searchDoctorsBySpecialty(specialty);
        return ResponseEntity.ok(doctors);
    }
    
    /**
     * Search doctors by name or specialty
     */
    @GetMapping("/search")
    public ResponseEntity<List<DoctorResponse>> searchDoctors(
            @RequestParam String query) {
        
        List<DoctorResponse> doctors = doctorService.searchDoctors(query);
        return ResponseEntity.ok(doctors);
    }
    
    /**
     * Get all specialties
     */
    @GetMapping("/specialties")
    public ResponseEntity<List<String>> getAllSpecialties() {
        List<String> specialties = doctorService.getAllSpecialties();
        return ResponseEntity.ok(specialties);
    }
    
    /**
     * Get doctors by experience range
     */
    @GetMapping("/experience")
    public ResponseEntity<List<DoctorResponse>> getDoctorsByExperience(
            @RequestParam Integer minYears,
            @RequestParam Integer maxYears) {
        
        List<DoctorResponse> doctors = doctorService.getDoctorsByExperienceRange(minYears, maxYears);
        return ResponseEntity.ok(doctors);
    }
    
    /**
     * Get doctors by consultation fee range
     */
    @GetMapping("/fee-range")
    public ResponseEntity<List<DoctorResponse>> getDoctorsByFeeRange(
            @RequestParam Double minFee,
            @RequestParam Double maxFee) {
        
        List<DoctorResponse> doctors = doctorService.getDoctorsByFeeRange(minFee, maxFee);
        return ResponseEntity.ok(doctors);
    }
    
    /**
     * Get doctor availability for a specific date or month
     */
    @GetMapping("/{doctorId}/availability")
    public ResponseEntity<List<TimeSlotResponse>> getDoctorAvailability(
            @PathVariable Long doctorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String month) {
        
        List<TimeSlotResponse> availability;
        
        if (month != null && !month.trim().isEmpty()) {
            // Parse month in format "YYYY-MM"
            String[] parts = month.split("-");
            if (parts.length == 2) {
                try {
                    int year = Integer.parseInt(parts[0]);
                    int monthValue = Integer.parseInt(parts[1]);
                    LocalDate startDate = LocalDate.of(year, monthValue, 1);
                    LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
                    availability = doctorService.getDoctorAvailabilityRange(doctorId, startDate, endDate);
                } catch (Exception e) {
                    return ResponseEntity.badRequest().build();
                }
            } else {
                return ResponseEntity.badRequest().build();
            }
        } else if (date != null) {
            availability = doctorService.getDoctorAvailability(doctorId, date);
        } else {
            // Default to current date if neither parameter is provided
            availability = doctorService.getDoctorAvailability(doctorId, LocalDate.now());
        }
        
        return ResponseEntity.ok(availability);
    }
    
    /**
     * Get doctor availability for a date range
     */
    @GetMapping("/{doctorId}/availability/range")
    public ResponseEntity<List<TimeSlotResponse>> getDoctorAvailabilityRange(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<TimeSlotResponse> availability = doctorService.getDoctorAvailabilityRange(
                doctorId, startDate, endDate);
        return ResponseEntity.ok(availability);
    }
    
    /**
     * Get doctors available on a specific date
     */
    @GetMapping("/available-on-date")
    public ResponseEntity<List<DoctorResponse>> getDoctorsAvailableOnDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        List<DoctorResponse> doctors = doctorService.getDoctorsAvailableOnDate(date);
        return ResponseEntity.ok(doctors);
    }
    
    /**
     * Advanced search for doctors with multiple filters, sorting, and pagination
     */
    @GetMapping("/search/advanced")
    public ResponseEntity<List<DoctorResponse>> advancedSearch(
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) Integer minExperience,
            @RequestParam(required = false) Integer maxExperience,
            @RequestParam(required = false) Double minFee,
            @RequestParam(required = false) Double maxFee,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Boolean availableToday,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortOrder,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer size) {
        
        List<DoctorResponse> doctors = doctorService.advancedSearch(
                specialty, minExperience, maxExperience, minFee, maxFee, 
                minRating, availableToday, sortBy, sortOrder, page, size);
        
        return ResponseEntity.ok(doctors);
    }
}
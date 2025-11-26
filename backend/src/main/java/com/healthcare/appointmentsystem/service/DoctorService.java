package com.healthcare.appointmentsystem.service;

import com.healthcare.appointmentsystem.dto.DoctorCredentialDTO;
import com.healthcare.appointmentsystem.dto.DoctorProfileRequest;
import com.healthcare.appointmentsystem.dto.DoctorProfileResponse;
import com.healthcare.appointmentsystem.dto.DoctorResponse;
import com.healthcare.appointmentsystem.dto.DoctorReviewDTO;
import com.healthcare.appointmentsystem.dto.DoctorStatisticsDTO;
import com.healthcare.appointmentsystem.dto.ProfileCompletenessDTO;
import com.healthcare.appointmentsystem.dto.TimeSlotResponse;
import com.healthcare.appointmentsystem.entity.Appointment;
import com.healthcare.appointmentsystem.entity.AppointmentStatus;
import com.healthcare.appointmentsystem.entity.Doctor;
import com.healthcare.appointmentsystem.entity.DoctorAvailability;
import com.healthcare.appointmentsystem.entity.User;
import com.healthcare.appointmentsystem.repository.AppointmentRepository;
import com.healthcare.appointmentsystem.repository.DoctorAvailabilityRepository;
import com.healthcare.appointmentsystem.repository.DoctorCredentialRepository;
import com.healthcare.appointmentsystem.repository.DoctorRepository;
import com.healthcare.appointmentsystem.repository.DoctorReviewRepository;
import com.healthcare.appointmentsystem.repository.DoctorStatisticsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DoctorService {
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private DoctorAvailabilityRepository availabilityRepository;
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Autowired
    private DoctorCredentialRepository credentialRepository;
    
    @Autowired
    private DoctorReviewRepository reviewRepository;
    
    @Autowired
    private DoctorStatisticsRepository statisticsRepository;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    /**
     * Get all available doctors
     */
    public List<DoctorResponse> getAllAvailableDoctors() {
        List<Doctor> doctors = doctorRepository.findAllAvailableDoctors();
        return doctors.stream()
                .map(doctor -> {
                    DoctorResponse response = new DoctorResponse(doctor);
                    response.setNextAvailableDate(calculateNextAvailableDate(doctor.getId()));
                    return response;
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Search doctors by specialty
     */
    public List<DoctorResponse> searchDoctorsBySpecialty(String specialty) {
        List<Doctor> doctors;
        if (specialty == null || specialty.trim().isEmpty()) {
            doctors = doctorRepository.findAllAvailableDoctors();
        } else {
            doctors = doctorRepository.findAvailableDoctorsBySpecialty(specialty.trim());
        }
        return doctors.stream()
                .map(doctor -> {
                    DoctorResponse response = new DoctorResponse(doctor);
                    response.setNextAvailableDate(calculateNextAvailableDate(doctor.getId()));
                    return response;
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Search doctors by name or specialty
     */
    public List<DoctorResponse> searchDoctors(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getAllAvailableDoctors();
        }
        
        List<Doctor> doctors = doctorRepository.searchDoctors(searchTerm.trim());
        return doctors.stream()
                .map(doctor -> {
                    DoctorResponse response = new DoctorResponse(doctor);
                    response.setNextAvailableDate(calculateNextAvailableDate(doctor.getId()));
                    return response;
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Get doctor by ID
     */
    public Optional<DoctorResponse> getDoctorById(Long doctorId) {
        return doctorRepository.findById(doctorId)
                .filter(doctor -> doctor.getIsAvailable() && doctor.getUser().getEnabled())
                .map(doctor -> {
                    DoctorResponse response = new DoctorResponse(doctor);
                    response.setNextAvailableDate(calculateNextAvailableDate(doctorId));
                    return response;
                });
    }
    
    /**
     * Calculate next available date for a doctor
     */
    private String calculateNextAvailableDate(Long doctorId) {
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(30); // Check next 30 days
        
        LocalDate currentDate = today;
        while (!currentDate.isAfter(endDate)) {
            List<TimeSlotResponse> slots = getDoctorAvailability(doctorId, currentDate);
            
            // Check if there are any available slots
            boolean hasAvailableSlot = slots.stream()
                    .anyMatch(TimeSlotResponse::getIsAvailable);
            
            if (hasAvailableSlot) {
                return currentDate.toString();
            }
            
            currentDate = currentDate.plusDays(1);
        }
        
        return null; // No availability in next 30 days
    }
    
    /**
     * Get doctors by experience years range
     */
    public List<DoctorResponse> getDoctorsByExperienceRange(Integer minYears, Integer maxYears) {
        List<Doctor> doctors = doctorRepository.findByExperienceYearsRange(minYears, maxYears);
        return doctors.stream()
                .map(doctor -> {
                    DoctorResponse response = new DoctorResponse(doctor);
                    response.setNextAvailableDate(calculateNextAvailableDate(doctor.getId()));
                    return response;
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Get doctors by consultation fee range
     */
    public List<DoctorResponse> getDoctorsByFeeRange(Double minFee, Double maxFee) {
        List<Doctor> doctors = doctorRepository.findByConsultationFeeRange(minFee, maxFee);
        return doctors.stream()
                .map(doctor -> {
                    DoctorResponse response = new DoctorResponse(doctor);
                    response.setNextAvailableDate(calculateNextAvailableDate(doctor.getId()));
                    return response;
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Get all unique specialties
     */
    public List<String> getAllSpecialties() {
        return doctorRepository.findAllSpecialties();
    }
    
    /**
     * Advanced search for doctors with multiple filters
     */
    public List<DoctorResponse> advancedSearch(String specialty, Integer minExperience, Integer maxExperience,
                                              Double minFee, Double maxFee, Double minRating, 
                                              Boolean availableToday, String sortBy, String sortOrder,
                                              Integer page, Integer size) {
        // Start with all available doctors
        List<Doctor> doctors = doctorRepository.findAllAvailableDoctors();
        
        // Apply filters
        if (specialty != null && !specialty.trim().isEmpty()) {
            doctors = doctors.stream()
                    .filter(d -> d.getSpecialty().toLowerCase().contains(specialty.toLowerCase()))
                    .collect(Collectors.toList());
        }
        
        if (minExperience != null) {
            doctors = doctors.stream()
                    .filter(d -> d.getExperienceYears() >= minExperience)
                    .collect(Collectors.toList());
        }
        
        if (maxExperience != null) {
            doctors = doctors.stream()
                    .filter(d -> d.getExperienceYears() <= maxExperience)
                    .collect(Collectors.toList());
        }
        
        if (minFee != null) {
            doctors = doctors.stream()
                    .filter(d -> d.getConsultationFee() != null && 
                                d.getConsultationFee().doubleValue() >= minFee)
                    .collect(Collectors.toList());
        }
        
        if (maxFee != null) {
            doctors = doctors.stream()
                    .filter(d -> d.getConsultationFee() != null && 
                                d.getConsultationFee().doubleValue() <= maxFee)
                    .collect(Collectors.toList());
        }
        
        if (minRating != null) {
            doctors = doctors.stream()
                    .filter(d -> d.getRating() != null && d.getRating() >= minRating)
                    .collect(Collectors.toList());
        }
        
        if (availableToday != null && availableToday) {
            LocalDate today = LocalDate.now();
            doctors = doctors.stream()
                    .filter(d -> {
                        List<TimeSlotResponse> slots = getDoctorAvailability(d.getId(), today);
                        return slots.stream().anyMatch(TimeSlotResponse::getIsAvailable);
                    })
                    .collect(Collectors.toList());
        }
        
        // Apply sorting
        if (sortBy != null && !sortBy.trim().isEmpty()) {
            java.util.Comparator<Doctor> comparator = switch (sortBy.toLowerCase()) {
                case "experience" -> java.util.Comparator.comparing(Doctor::getExperienceYears);
                case "fee" -> java.util.Comparator.comparing(d -> d.getConsultationFee() != null ? 
                                                              d.getConsultationFee().doubleValue() : 0.0);
                case "rating" -> java.util.Comparator.comparing(d -> d.getRating() != null ? d.getRating() : 0.0);
                case "name" -> java.util.Comparator.comparing(d -> d.getUser().getFirstName());
                default -> java.util.Comparator.comparing(Doctor::getId);
            };
            
            if ("desc".equalsIgnoreCase(sortOrder)) {
                comparator = comparator.reversed();
            }
            
            doctors = doctors.stream()
                    .sorted(comparator)
                    .collect(Collectors.toList());
        }
        
        // Apply pagination
        int pageNum = page != null ? page : 0;
        int pageSize = size != null ? size : 10;
        int start = pageNum * pageSize;
        int end = Math.min(start + pageSize, doctors.size());
        
        if (start >= doctors.size()) {
            doctors = new ArrayList<>();
        } else {
            doctors = doctors.subList(start, end);
        }
        
        // Convert to response DTOs
        return doctors.stream()
                .map(doctor -> {
                    DoctorResponse response = new DoctorResponse(doctor);
                    response.setNextAvailableDate(calculateNextAvailableDate(doctor.getId()));
                    return response;
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Get doctor availability for a specific date
     */
    public List<TimeSlotResponse> getDoctorAvailability(Long doctorId, LocalDate date) {
        // Get doctor's availability for the specific date
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);
        
        List<DoctorAvailability> availabilities = availabilityRepository
                .findByDoctorIdAndDateRange(doctorId, startOfDay, endOfDay);
        
        // If no specific date availability, check recurring availability
        if (availabilities.isEmpty()) {
            DayOfWeek dayOfWeek = date.getDayOfWeek();
            availabilities = availabilityRepository
                    .findByDoctorIdAndDayOfWeekAndIsAvailableTrue(doctorId, dayOfWeek);
        }
        
        // Get existing appointments for the date
        List<Appointment> appointments = appointmentRepository
                .findByDoctorIdAndAppointmentDateTimeBetween(
                        doctorId, startOfDay, endOfDay)
                .stream()
                .filter(apt -> apt.getStatus() == AppointmentStatus.SCHEDULED)
                .collect(Collectors.toList());
        
        // Generate time slots
        List<TimeSlotResponse> timeSlots = new ArrayList<>();
        
        for (DoctorAvailability availability : availabilities) {
            List<TimeSlotResponse> slots = generateTimeSlots(
                    availability, date, appointments);
            timeSlots.addAll(slots);
        }
        
        return timeSlots.stream()
                .sorted((slot1, slot2) -> slot1.getStartTime().compareTo(slot2.getStartTime()))
                .collect(Collectors.toList());
    }
    
    /**
     * Get doctor availability for a date range
     */
    public List<TimeSlotResponse> getDoctorAvailabilityRange(Long doctorId, LocalDate startDate, LocalDate endDate) {
        List<TimeSlotResponse> allSlots = new ArrayList<>();
        
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            List<TimeSlotResponse> dailySlots = getDoctorAvailability(doctorId, currentDate);
            allSlots.addAll(dailySlots);
            currentDate = currentDate.plusDays(1);
        }
        
        return allSlots;
    }
    
    /**
     * Check if doctor is available at specific time
     */
    public boolean isDoctorAvailable(Long doctorId, LocalDateTime appointmentDateTime) {
        LocalDate date = appointmentDateTime.toLocalDate();
        LocalTime time = appointmentDateTime.toLocalTime();
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        
        // Check if there's availability at this time
        boolean hasAvailability = availabilityRepository
                .isDoctorAvailableAtTime(doctorId, dayOfWeek, appointmentDateTime, time);
        
        if (!hasAvailability) {
            return false;
        }
        
        // Check if there's already an appointment at this time
        List<Appointment> conflictingAppointments = appointmentRepository
                .findByDoctorIdAndAppointmentDateTime(doctorId, appointmentDateTime);
        
        return conflictingAppointments.stream()
                .noneMatch(apt -> apt.getStatus() == AppointmentStatus.SCHEDULED);
    }
    
    /**
     * Get doctors available on a specific date
     */
    public List<DoctorResponse> getDoctorsAvailableOnDate(LocalDate date) {
        LocalDateTime dateTime = date.atStartOfDay();
        List<Doctor> doctors = doctorRepository.findDoctorsAvailableOnDate(dateTime);
        return doctors.stream()
                .map(doctor -> {
                    DoctorResponse response = new DoctorResponse(doctor);
                    response.setNextAvailableDate(calculateNextAvailableDate(doctor.getId()));
                    return response;
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Generate time slots from availability
     */
    private List<TimeSlotResponse> generateTimeSlots(DoctorAvailability availability, 
                                                   LocalDate date, 
                                                   List<Appointment> appointments) {
        List<TimeSlotResponse> slots = new ArrayList<>();
        
        LocalTime currentTime = availability.getStartTime();
        LocalTime endTime = availability.getEndTime();
        Integer slotDuration = availability.getSlotDurationMinutes();
        
        while (currentTime.isBefore(endTime)) {
            LocalTime slotEndTime = currentTime.plusMinutes(slotDuration);
            
            // Don't create slot if it would exceed the availability end time
            if (slotEndTime.isAfter(endTime)) {
                break;
            }
            
            LocalDateTime slotDateTime = date.atTime(currentTime);
            
            // Check if this slot is booked
            boolean isBooked = appointments.stream()
                    .anyMatch(apt -> apt.getAppointmentDateTime().equals(slotDateTime));
            
            TimeSlotResponse slot = new TimeSlotResponse(
                    slotDateTime,
                    currentTime,
                    slotEndTime,
                    slotDuration,
                    availability.getIsAvailable() && !isBooked,
                    isBooked
            );
            
            slots.add(slot);
            currentTime = slotEndTime;
        }
        
        return slots;
    }
    
    // ==================== Profile Management Methods ====================
    
    /**
     * Get complete doctor profile with all related data
     */
    public DoctorProfileResponse getDoctorProfile(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found with id: " + doctorId));
        
        DoctorProfileResponse response = new DoctorProfileResponse(doctor);
        
        // Load credentials and convert to DTOs
        List<DoctorCredentialDTO> credentialDTOs = credentialRepository.findByDoctorId(doctorId)
                .stream()
                .map(DoctorCredentialDTO::new)
                .collect(Collectors.toList());
        response.setCredentials(credentialDTOs);
        
        // Load recent reviews and convert to DTOs
        List<DoctorReviewDTO> reviewDTOs = reviewRepository.findByDoctorIdAndIsPublicTrue(doctorId)
                .stream()
                .limit(10) // Only recent 10 reviews
                .map(DoctorReviewDTO::new)
                .collect(Collectors.toList());
        response.setRecentReviews(reviewDTOs);
        
        // Load statistics and convert to DTO
        statisticsRepository.findByDoctorId(doctorId)
                .ifPresent(stats -> response.setStatistics(new DoctorStatisticsDTO(stats)));
        
        return response;
    }
    
    /**
     * Update doctor profile
     */
    @Transactional
    public DoctorProfileResponse updateDoctorProfile(Long doctorId, DoctorProfileRequest request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found with id: " + doctorId));
        
        // Validate profile data
        validateProfileData(request);
        
        // Update basic information
        if (request.getBio() != null) {
            doctor.setBio(request.getBio());
        }
        if (request.getSpecialty() != null) {
            doctor.setSpecialty(request.getSpecialty());
        }
        if (request.getQualifications() != null) {
            doctor.setQualifications(request.getQualifications());
        }
        if (request.getExperienceYears() != null) {
            doctor.setExperienceYears(request.getExperienceYears());
        }
        
        // Update fees
        if (request.getConsultationFee() != null) {
            doctor.setConsultationFee(request.getConsultationFee());
        }
        if (request.getFollowUpFee() != null) {
            doctor.setFollowUpFee(request.getFollowUpFee());
        }
        if (request.getEmergencyFee() != null) {
            doctor.setEmergencyFee(request.getEmergencyFee());
        }
        
        // Update additional information (convert lists to JSON strings)
        if (request.getLanguagesSpoken() != null) {
            doctor.setLanguagesSpoken(convertListToJson(request.getLanguagesSpoken()));
        }
        if (request.getEducation() != null) {
            doctor.setEducation(convertEducationToJson(request.getEducation()));
        }
        if (request.getAwards() != null) {
            doctor.setAwards(convertListToJson(request.getAwards()));
        }
        if (request.getConsultationDuration() != null) {
            doctor.setConsultationDuration(request.getConsultationDuration());
        }
        
        // Calculate and update profile completeness
        Integer completeness = calculateProfileCompleteness(doctor);
        doctor.setProfileCompleteness(completeness);
        
        // Save doctor
        doctor = doctorRepository.save(doctor);
        
        // Return updated profile
        return getDoctorProfile(doctorId);
    }
    
    /**
     * Upload and update doctor profile photo
     */
    @Transactional
    public String uploadProfilePhoto(Long doctorId, MultipartFile file) throws IOException {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found with id: " + doctorId));
        
        User user = doctor.getUser();
        
        // Delete old avatar if exists
        if (user.getAvatarUrl() != null) {
            fileStorageService.deleteAvatar(user.getAvatarUrl());
        }
        
        // Store new avatar
        String avatarUrl = fileStorageService.storeAvatar(file);
        
        // Update user avatar
        user.setAvatarUrl(avatarUrl);
        
        // Recalculate profile completeness
        Integer completeness = calculateProfileCompleteness(doctor);
        doctor.setProfileCompleteness(completeness);
        
        doctorRepository.save(doctor);
        
        return avatarUrl;
    }
    
    /**
     * Delete doctor profile photo
     */
    @Transactional
    public void deleteProfilePhoto(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found with id: " + doctorId));
        
        User user = doctor.getUser();
        
        if (user.getAvatarUrl() != null) {
            fileStorageService.deleteAvatar(user.getAvatarUrl());
            user.setAvatarUrl(null);
            
            // Recalculate profile completeness
            Integer completeness = calculateProfileCompleteness(doctor);
            doctor.setProfileCompleteness(completeness);
            
            doctorRepository.save(doctor);
        }
    }
    
    /**
     * Get profile completeness information
     */
    public ProfileCompletenessDTO calculateProfileCompleteness(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found with id: " + doctorId));
        
        ProfileCompletenessDTO completeness = new ProfileCompletenessDTO();
        completeness.setPercentage(calculateProfileCompleteness(doctor));
        
        List<ProfileCompletenessDTO.MissingField> missingFields = new ArrayList<>();
        
        User user = doctor.getUser();
        
        // Check required fields
        if (doctor.getBio() == null || doctor.getBio().trim().isEmpty()) {
            missingFields.add(new ProfileCompletenessDTO.MissingField(
                    "bio", "Professional Biography", "high"));
        }
        if (user.getAvatarUrl() == null || user.getAvatarUrl().trim().isEmpty()) {
            missingFields.add(new ProfileCompletenessDTO.MissingField(
                    "avatarUrl", "Profile Photo", "high"));
        }
        if (doctor.getEducation() == null || doctor.getEducation().trim().isEmpty()) {
            missingFields.add(new ProfileCompletenessDTO.MissingField(
                    "education", "Education Details", "high"));
        }
        if (doctor.getLanguagesSpoken() == null || doctor.getLanguagesSpoken().trim().isEmpty()) {
            missingFields.add(new ProfileCompletenessDTO.MissingField(
                    "languagesSpoken", "Languages Spoken", "medium"));
        }
        if (doctor.getFollowUpFee() == null) {
            missingFields.add(new ProfileCompletenessDTO.MissingField(
                    "followUpFee", "Follow-up Consultation Fee", "medium"));
        }
        if (doctor.getEmergencyFee() == null) {
            missingFields.add(new ProfileCompletenessDTO.MissingField(
                    "emergencyFee", "Emergency Consultation Fee", "low"));
        }
        if (doctor.getAwards() == null || doctor.getAwards().trim().isEmpty()) {
            missingFields.add(new ProfileCompletenessDTO.MissingField(
                    "awards", "Awards and Recognition", "low"));
        }
        
        // Check for credentials
        long credentialCount = credentialRepository.countByDoctorId(doctorId);
        if (credentialCount == 0) {
            missingFields.add(new ProfileCompletenessDTO.MissingField(
                    "credentials", "Professional Credentials", "high"));
        }
        
        completeness.setMissingFields(missingFields);
        
        return completeness;
    }
    
    /**
     * Check if the authenticated user is the owner of the doctor profile
     */
    public boolean isDoctorOwner(Long doctorId, String username) {
        return doctorRepository.findById(doctorId)
                .map(doctor -> doctor.getUser().getEmail().equals(username))
                .orElse(false);
    }
    
    /**
     * Calculate profile completeness percentage
     */
    private Integer calculateProfileCompleteness(Doctor doctor) {
        int totalFields = 12; // Total number of profile fields
        int completedFields = 0;
        
        User user = doctor.getUser();
        
        // Required basic fields (always present)
        completedFields += 4; // firstName, lastName, email, specialty
        
        // Optional but important fields
        if (doctor.getBio() != null && !doctor.getBio().trim().isEmpty()) {
            completedFields++;
        }
        if (doctor.getQualifications() != null && !doctor.getQualifications().trim().isEmpty()) {
            completedFields++;
        }
        if (user != null && user.getAvatarUrl() != null && !user.getAvatarUrl().trim().isEmpty()) {
            completedFields++;
        }
        if (doctor.getEducation() != null && !doctor.getEducation().trim().isEmpty()) {
            completedFields++;
        }
        if (doctor.getLanguagesSpoken() != null && !doctor.getLanguagesSpoken().trim().isEmpty()) {
            completedFields++;
        }
        if (doctor.getFollowUpFee() != null) {
            completedFields++;
        }
        if (doctor.getEmergencyFee() != null) {
            completedFields++;
        }
        if (doctor.getAwards() != null && !doctor.getAwards().trim().isEmpty()) {
            completedFields++;
        }
        
        return (int) Math.round((completedFields * 100.0) / totalFields);
    }
    
    /**
     * Convert list of strings to JSON array string
     */
    private String convertListToJson(List<String> list) {
        if (list == null || list.isEmpty()) {
            return null;
        }
        // Simple JSON array conversion
        return "[\"" + String.join("\",\"", list) + "\"]";
    }
    
    /**
     * Convert list of education DTOs to JSON string
     */
    private String convertEducationToJson(List<DoctorProfileRequest.EducationDTO> educationList) {
        if (educationList == null || educationList.isEmpty()) {
            return null;
        }
        // Simple JSON conversion
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < educationList.size(); i++) {
            DoctorProfileRequest.EducationDTO edu = educationList.get(i);
            if (i > 0) json.append(",");
            json.append("{")
                .append("\"degree\":\"").append(edu.getDegree()).append("\",")
                .append("\"institution\":\"").append(edu.getInstitution()).append("\",")
                .append("\"year\":").append(edu.getYear())
                .append("}");
        }
        json.append("]");
        return json.toString();
    }
    
    /**
     * Validate profile data
     */
    private void validateProfileData(DoctorProfileRequest request) {
        // Validate bio length
        if (request.getBio() != null && request.getBio().length() > 2000) {
            throw new IllegalArgumentException("Bio cannot exceed 2000 characters");
        }
        
        // Validate experience years
        if (request.getExperienceYears() != null && 
            (request.getExperienceYears() < 0 || request.getExperienceYears() > 70)) {
            throw new IllegalArgumentException("Experience years must be between 0 and 70");
        }
        
        // Validate fees
        if (request.getConsultationFee() != null && 
            request.getConsultationFee().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Consultation fee cannot be negative");
        }
        if (request.getFollowUpFee() != null && 
            request.getFollowUpFee().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Follow-up fee cannot be negative");
        }
        if (request.getEmergencyFee() != null && 
            request.getEmergencyFee().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Emergency fee cannot be negative");
        }
        
        // Validate consultation duration
        if (request.getConsultationDuration() != null && 
            (request.getConsultationDuration() < 5 || request.getConsultationDuration() > 180)) {
            throw new IllegalArgumentException("Consultation duration must be between 5 and 180 minutes");
        }
    }
}
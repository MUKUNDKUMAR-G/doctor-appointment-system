package com.healthcare.appointmentsystem.service;

import com.healthcare.appointmentsystem.dto.ReviewResponseDTO;
import com.healthcare.appointmentsystem.dto.ReviewSubmissionDTO;
import com.healthcare.appointmentsystem.entity.Appointment;
import com.healthcare.appointmentsystem.entity.AppointmentStatus;
import com.healthcare.appointmentsystem.entity.Doctor;
import com.healthcare.appointmentsystem.entity.DoctorReview;
import com.healthcare.appointmentsystem.entity.User;
import com.healthcare.appointmentsystem.repository.AppointmentRepository;
import com.healthcare.appointmentsystem.repository.DoctorRepository;
import com.healthcare.appointmentsystem.repository.DoctorReviewRepository;
import com.healthcare.appointmentsystem.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class DoctorReviewService {
    
    private static final Logger logger = LoggerFactory.getLogger(DoctorReviewService.class);
    
    @Autowired
    private DoctorReviewRepository reviewRepository;
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    /**
     * Get all reviews for a doctor
     */
    public List<DoctorReview> getDoctorReviews(Long doctorId) {
        return reviewRepository.findByDoctorId(doctorId);
    }
    
    /**
     * Get public reviews for a doctor
     */
    public List<DoctorReview> getPublicDoctorReviews(Long doctorId) {
        return reviewRepository.findByDoctorIdAndIsPublicTrue(doctorId);
    }
    
    /**
     * Get public reviews for a doctor with pagination
     */
    public Page<DoctorReview> getPublicDoctorReviewsPaginated(Long doctorId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return reviewRepository.findPublicReviewsByDoctorId(doctorId, pageable);
    }
    
    /**
     * Get recent reviews for a doctor
     */
    public List<DoctorReview> getRecentDoctorReviews(Long doctorId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return reviewRepository.findRecentReviewsByDoctorId(doctorId, pageable);
    }
    
    /**
     * Get review by ID
     */
    public Optional<DoctorReview> getReviewById(Long reviewId) {
        return reviewRepository.findById(reviewId);
    }
    
    /**
     * Get reviews by patient
     */
    public List<DoctorReview> getPatientReviews(Long patientId) {
        return reviewRepository.findByPatientId(patientId);
    }
    
    /**
     * Get review by appointment
     */
    public Optional<DoctorReview> getReviewByAppointment(Long appointmentId) {
        return reviewRepository.findByAppointmentId(appointmentId);
    }
    
    /**
     * Submit a new review
     */
    @Transactional
    public DoctorReview submitReview(Long patientId, ReviewSubmissionDTO submissionDTO) {
        // Validate submission
        validateReviewSubmission(submissionDTO);
        
        // Get entities
        Doctor doctor = doctorRepository.findById(submissionDTO.getDoctorId())
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));
        
        Appointment appointment = null;
        if (submissionDTO.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(submissionDTO.getAppointmentId())
                    .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
            
            // Verify appointment is completed
            if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
                throw new IllegalArgumentException("Can only review completed appointments");
            }
            
            // Check if already reviewed
            if (reviewRepository.hasPatientReviewedAppointment(
                    submissionDTO.getAppointmentId(), patientId)) {
                throw new IllegalArgumentException("Appointment has already been reviewed");
            }
        }
        
        // Create review
        DoctorReview review = new DoctorReview();
        review.setDoctor(doctor);
        review.setPatient(patient);
        review.setAppointment(appointment);
        review.setRating(submissionDTO.getRating());
        review.setComment(submissionDTO.getComment());
        review.setIsPublic(submissionDTO.getIsPublic() != null ? submissionDTO.getIsPublic() : true);
        review.setIsVerified(appointment != null); // Verified if linked to appointment
        
        // Save review
        review = reviewRepository.save(review);
        
        // Update doctor's average rating
        updateDoctorRating(submissionDTO.getDoctorId());
        
        logger.info("Review submitted: doctorId={}, patientId={}, rating={}", 
                submissionDTO.getDoctorId(), patientId, submissionDTO.getRating());
        
        return review;
    }
    
    /**
     * Update an existing review
     */
    @Transactional
    public DoctorReview updateReview(Long reviewId, Long patientId, ReviewSubmissionDTO submissionDTO) {
        DoctorReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));
        
        // Validate that patient owns the review
        if (!review.getPatient().getId().equals(patientId)) {
            throw new IllegalArgumentException("Cannot update another patient's review");
        }
        
        // Update fields
        if (submissionDTO.getRating() != null) {
            review.setRating(submissionDTO.getRating());
        }
        if (submissionDTO.getComment() != null) {
            review.setComment(submissionDTO.getComment());
        }
        if (submissionDTO.getIsPublic() != null) {
            review.setIsPublic(submissionDTO.getIsPublic());
        }
        
        review = reviewRepository.save(review);
        
        // Update doctor's average rating
        updateDoctorRating(review.getDoctor().getId());
        
        logger.info("Review updated: reviewId={}, rating={}", reviewId, review.getRating());
        
        return review;
    }
    
    /**
     * Delete a review
     */
    @Transactional
    public void deleteReview(Long reviewId, Long patientId) {
        DoctorReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));
        
        // Validate that patient owns the review
        if (!review.getPatient().getId().equals(patientId)) {
            throw new IllegalArgumentException("Cannot delete another patient's review");
        }
        
        Long doctorId = review.getDoctor().getId();
        
        reviewRepository.delete(review);
        
        // Update doctor's average rating
        updateDoctorRating(doctorId);
        
        logger.info("Review deleted: reviewId={}, doctorId={}", reviewId, doctorId);
    }
    
    /**
     * Add doctor response to a review
     */
    @Transactional
    public DoctorReview addDoctorResponse(Long reviewId, Long doctorId, ReviewResponseDTO responseDTO) {
        DoctorReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));
        
        // Validate that doctor owns the review
        if (!review.getDoctor().getId().equals(doctorId)) {
            throw new IllegalArgumentException("Cannot respond to another doctor's review");
        }
        
        // Validate response
        if (responseDTO.getResponse() == null || responseDTO.getResponse().trim().isEmpty()) {
            throw new IllegalArgumentException("Response cannot be empty");
        }
        
        if (responseDTO.getResponse().length() > 2000) {
            throw new IllegalArgumentException("Response cannot exceed 2000 characters");
        }
        
        // Add response
        review.setDoctorResponse(responseDTO.getResponse());
        review.setRespondedAt(LocalDateTime.now());
        
        review = reviewRepository.save(review);
        
        logger.info("Doctor response added: reviewId={}, doctorId={}", reviewId, doctorId);
        
        return review;
    }
    
    /**
     * Update doctor response
     */
    @Transactional
    public DoctorReview updateDoctorResponse(Long reviewId, Long doctorId, ReviewResponseDTO responseDTO) {
        DoctorReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));
        
        // Validate that doctor owns the review
        if (!review.getDoctor().getId().equals(doctorId)) {
            throw new IllegalArgumentException("Cannot update another doctor's response");
        }
        
        // Validate response
        if (responseDTO.getResponse() == null || responseDTO.getResponse().trim().isEmpty()) {
            throw new IllegalArgumentException("Response cannot be empty");
        }
        
        if (responseDTO.getResponse().length() > 2000) {
            throw new IllegalArgumentException("Response cannot exceed 2000 characters");
        }
        
        // Update response
        review.setDoctorResponse(responseDTO.getResponse());
        review.setRespondedAt(LocalDateTime.now());
        
        review = reviewRepository.save(review);
        
        logger.info("Doctor response updated: reviewId={}, doctorId={}", reviewId, doctorId);
        
        return review;
    }
    
    /**
     * Delete doctor response
     */
    @Transactional
    public DoctorReview deleteDoctorResponse(Long reviewId, Long doctorId) {
        DoctorReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));
        
        // Validate that doctor owns the review
        if (!review.getDoctor().getId().equals(doctorId)) {
            throw new IllegalArgumentException("Cannot delete another doctor's response");
        }
        
        review.setDoctorResponse(null);
        review.setRespondedAt(null);
        
        review = reviewRepository.save(review);
        
        logger.info("Doctor response deleted: reviewId={}, doctorId={}", reviewId, doctorId);
        
        return review;
    }
    
    /**
     * Get reviews without doctor response
     */
    public List<DoctorReview> getReviewsWithoutResponse(Long doctorId) {
        return reviewRepository.findReviewsWithoutResponse(doctorId);
    }
    
    /**
     * Moderate review (admin action) - hide/show
     */
    @Transactional
    public DoctorReview moderateReview(Long reviewId, boolean isPublic) {
        DoctorReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));
        
        review.setIsPublic(isPublic);
        review = reviewRepository.save(review);
        
        // Update doctor's average rating since visibility changed
        updateDoctorRating(review.getDoctor().getId());
        
        logger.info("Review moderated: reviewId={}, isPublic={}", reviewId, isPublic);
        
        return review;
    }
    
    /**
     * Get average rating for a doctor
     */
    public Double getAverageRating(Long doctorId) {
        Double average = reviewRepository.calculateAverageRating(doctorId);
        return average != null ? average : 0.0;
    }
    
    /**
     * Get review count for a doctor
     */
    public Long getReviewCount(Long doctorId) {
        return reviewRepository.countReviewsByDoctorId(doctorId);
    }
    
    /**
     * Get rating distribution for a doctor
     */
    public java.util.Map<Integer, Long> getRatingDistribution(Long doctorId) {
        List<Object[]> results = reviewRepository.countReviewsByRating(doctorId);
        java.util.Map<Integer, Long> distribution = new java.util.HashMap<>();
        
        // Initialize all ratings with 0
        for (int i = 1; i <= 5; i++) {
            distribution.put(i, 0L);
        }
        
        // Fill in actual counts
        for (Object[] result : results) {
            Integer rating = (Integer) result[0];
            Long count = (Long) result[1];
            distribution.put(rating, count);
        }
        
        return distribution;
    }
    
    /**
     * Update doctor's average rating
     */
    @Transactional
    private void updateDoctorRating(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        
        Double averageRating = reviewRepository.calculateAverageRating(doctorId);
        
        if (averageRating != null) {
            // Round to 1 decimal place
            BigDecimal rounded = BigDecimal.valueOf(averageRating)
                    .setScale(1, RoundingMode.HALF_UP);
            doctor.setRating(rounded.doubleValue());
        } else {
            doctor.setRating(null);
        }
        
        doctorRepository.save(doctor);
        
        logger.debug("Doctor rating updated: doctorId={}, rating={}", doctorId, doctor.getRating());
    }
    
    /**
     * Validate review submission
     */
    private void validateReviewSubmission(ReviewSubmissionDTO submissionDTO) {
        if (submissionDTO.getDoctorId() == null) {
            throw new IllegalArgumentException("Doctor ID is required");
        }
        
        if (submissionDTO.getRating() == null) {
            throw new IllegalArgumentException("Rating is required");
        }
        
        if (submissionDTO.getRating() < 1 || submissionDTO.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        
        if (submissionDTO.getComment() != null && submissionDTO.getComment().length() > 2000) {
            throw new IllegalArgumentException("Comment cannot exceed 2000 characters");
        }
    }
}

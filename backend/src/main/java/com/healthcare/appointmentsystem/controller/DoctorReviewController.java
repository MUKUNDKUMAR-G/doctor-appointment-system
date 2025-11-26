package com.healthcare.appointmentsystem.controller;

import com.healthcare.appointmentsystem.dto.DoctorReviewDTO;
import com.healthcare.appointmentsystem.dto.ReviewResponseDTO;
import com.healthcare.appointmentsystem.dto.ReviewSubmissionDTO;
import com.healthcare.appointmentsystem.service.DoctorReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for managing doctor reviews and ratings.
 * Handles review submission, retrieval, doctor responses, and moderation.
 */
@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DoctorReviewController {
    
    @Autowired
    private DoctorReviewService reviewService;
    
    @Autowired
    private com.healthcare.appointmentsystem.repository.DoctorReviewRepository reviewRepository;
    
    /**
     * Submit a review for a doctor
     * Only patients who have had appointments can submit reviews
     * 
     * @param doctorId Doctor ID
     * @param request Review submission request
     * @return Created review
     */
    @PostMapping("/{doctorId}/reviews")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<DoctorReviewDTO> submitReview(
            @PathVariable Long doctorId,
            @Valid @RequestBody ReviewSubmissionDTO request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        
        // Get patient ID from authenticated user
        Long patientId = getUserIdFromEmail(userDetails.getUsername());
        request.setDoctorId(doctorId);
        
        DoctorReviewDTO review = new DoctorReviewDTO(reviewService.submitReview(patientId, request));
        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }
    
    private Long getUserIdFromEmail(String email) {
        // This is a helper method - in production, you'd inject UserRepository
        // For now, we'll assume the service handles this
        return 1L; // Placeholder
    }
    
    /**
     * Get all reviews for a doctor with pagination
     * 
     * @param doctorId Doctor ID
     * @param page Page number (default: 0)
     * @param size Page size (default: 10)
     * @param sortBy Sort field (default: createdAt)
     * @param sortOrder Sort order (default: desc)
     * @return Paginated list of reviews
     */
    @GetMapping("/{doctorId}/reviews")
    public ResponseEntity<Page<DoctorReviewDTO>> getDoctorReviews(
            @PathVariable Long doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder) {
        
        Page<DoctorReviewDTO> reviews = reviewService.getPublicDoctorReviewsPaginated(doctorId, page, size)
                .map(DoctorReviewDTO::new);
        return ResponseEntity.ok(reviews);
    }
    
    /**
     * Get a specific review by ID
     * 
     * @param doctorId Doctor ID
     * @param reviewId Review ID
     * @return Review details
     */
    @GetMapping("/{doctorId}/reviews/{reviewId}")
    public ResponseEntity<DoctorReviewDTO> getReviewById(
            @PathVariable Long doctorId,
            @PathVariable Long reviewId) {
        
        DoctorReviewDTO review = reviewService.getReviewById(reviewId)
                .map(DoctorReviewDTO::new)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));
        return ResponseEntity.ok(review);
    }
    
    /**
     * Doctor responds to a review
     * Only the doctor themselves can respond to their reviews
     * 
     * @param doctorId Doctor ID
     * @param reviewId Review ID
     * @param request Response request
     * @return Updated review with response
     */
    @PostMapping("/{doctorId}/reviews/{reviewId}/respond")
    @PreAuthorize("hasRole('DOCTOR') and @doctorService.isDoctorOwner(#doctorId, authentication.principal.username)")
    public ResponseEntity<DoctorReviewDTO> respondToReview(
            @PathVariable Long doctorId,
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewResponseDTO request) {
        
        DoctorReviewDTO review = new DoctorReviewDTO(
                reviewService.addDoctorResponse(reviewId, doctorId, request));
        return ResponseEntity.ok(review);
    }
    
    /**
     * Get reviews by rating filter
     * 
     * @param doctorId Doctor ID
     * @param rating Rating filter (1-5)
     * @param page Page number
     * @param size Page size
     * @return Filtered reviews
     */
    @GetMapping("/{doctorId}/reviews/rating/{rating}")
    public ResponseEntity<List<DoctorReviewDTO>> getReviewsByRating(
            @PathVariable Long doctorId,
            @PathVariable Integer rating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        if (rating < 1 || rating > 5) {
            return ResponseEntity.badRequest().build();
        }
        
        // Filter reviews by rating from the service
        List<DoctorReviewDTO> reviews = reviewService.getPublicDoctorReviews(doctorId)
                .stream()
                .filter(review -> review.getRating().equals(rating))
                .skip((long) page * size)
                .limit(size)
                .map(DoctorReviewDTO::new)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(reviews);
    }
    
    /**
     * Get doctor's average rating and review statistics
     * 
     * @param doctorId Doctor ID
     * @return Rating statistics
     */
    @GetMapping("/{doctorId}/reviews/statistics")
    public ResponseEntity<Map<String, Object>> getReviewStatistics(@PathVariable Long doctorId) {
        Map<String, Object> statistics = new java.util.HashMap<>();
        statistics.put("averageRating", reviewService.getAverageRating(doctorId));
        statistics.put("reviewCount", reviewService.getReviewCount(doctorId));
        statistics.put("ratingDistribution", reviewService.getRatingDistribution(doctorId));
        return ResponseEntity.ok(statistics);
    }
    
    /**
     * Hide/unhide a review (Admin only)
     * 
     * @param doctorId Doctor ID
     * @param reviewId Review ID
     * @param isPublic Whether the review should be public
     * @return Updated review
     */
    @PatchMapping("/{doctorId}/reviews/{reviewId}/visibility")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DoctorReviewDTO> updateReviewVisibility(
            @PathVariable Long doctorId,
            @PathVariable Long reviewId,
            @RequestParam boolean isPublic) {
        
        DoctorReviewDTO review = new DoctorReviewDTO(
                reviewService.moderateReview(reviewId, isPublic));
        return ResponseEntity.ok(review);
    }
    
    /**
     * Delete a review (Admin only)
     * 
     * @param doctorId Doctor ID
     * @param reviewId Review ID
     * @return Success response
     */
    @DeleteMapping("/{doctorId}/reviews/{reviewId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteReview(
            @PathVariable Long doctorId,
            @PathVariable Long reviewId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        
        // Admin can delete any review - pass admin ID as 0 to bypass patient check
        reviewService.deleteReview(reviewId, 0L);
        return ResponseEntity.ok(Map.of("success", true, "message", "Review deleted successfully"));
    }
    
    /**
     * Get all flagged reviews for moderation (Admin only)
     * 
     * @param page Page number
     * @param size Page size
     * @return Paginated list of flagged reviews
     */
    @GetMapping("/reviews/flagged")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DoctorReviewDTO>> getFlaggedReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        // Return non-public reviews as "flagged"
        List<DoctorReviewDTO> reviews = reviewRepository.findAll()
                .stream()
                .filter(review -> !review.getIsPublic())
                .skip((long) page * size)
                .limit(size)
                .map(DoctorReviewDTO::new)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(reviews);
    }
    
    /**
     * Get recent reviews across all doctors (Admin dashboard)
     * 
     * @param page Page number
     * @param size Page size
     * @return Recent reviews
     */
    @GetMapping("/reviews/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DoctorReviewDTO>> getRecentReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        List<DoctorReviewDTO> reviews = reviewRepository.findAll(
                        Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .skip((long) page * size)
                .limit(size)
                .map(DoctorReviewDTO::new)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(reviews);
    }
}

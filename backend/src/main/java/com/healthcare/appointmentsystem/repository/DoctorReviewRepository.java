package com.healthcare.appointmentsystem.repository;

import com.healthcare.appointmentsystem.entity.DoctorReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorReviewRepository extends JpaRepository<DoctorReview, Long> {
    
    /**
     * Find all reviews for a specific doctor
     */
    List<DoctorReview> findByDoctorId(Long doctorId);
    
    /**
     * Find all public reviews for a specific doctor
     */
    List<DoctorReview> findByDoctorIdAndIsPublicTrue(Long doctorId);
    
    /**
     * Find all public reviews for a specific doctor with pagination
     */
    @Query("SELECT dr FROM DoctorReview dr WHERE dr.doctor.id = :doctorId AND dr.isPublic = true ORDER BY dr.createdAt DESC")
    Page<DoctorReview> findPublicReviewsByDoctorId(@Param("doctorId") Long doctorId, Pageable pageable);
    
    /**
     * Find all reviews by a specific patient
     */
    List<DoctorReview> findByPatientId(Long patientId);
    
    /**
     * Find review by appointment
     */
    Optional<DoctorReview> findByAppointmentId(Long appointmentId);
    
    /**
     * Find reviews by doctor and rating
     */
    @Query("SELECT dr FROM DoctorReview dr WHERE dr.doctor.id = :doctorId AND dr.rating = :rating")
    List<DoctorReview> findByDoctorIdAndRating(@Param("doctorId") Long doctorId, @Param("rating") Integer rating);
    
    /**
     * Calculate average rating for a doctor
     */
    @Query("SELECT AVG(dr.rating) FROM DoctorReview dr WHERE dr.doctor.id = :doctorId AND dr.isPublic = true")
    Double calculateAverageRating(@Param("doctorId") Long doctorId);
    
    /**
     * Count total reviews for a doctor
     */
    @Query("SELECT COUNT(dr) FROM DoctorReview dr WHERE dr.doctor.id = :doctorId AND dr.isPublic = true")
    Long countReviewsByDoctorId(@Param("doctorId") Long doctorId);
    
    /**
     * Find reviews without doctor response
     */
    @Query("SELECT dr FROM DoctorReview dr WHERE dr.doctor.id = :doctorId AND dr.doctorResponse IS NULL ORDER BY dr.createdAt DESC")
    List<DoctorReview> findReviewsWithoutResponse(@Param("doctorId") Long doctorId);
    
    /**
     * Find recent reviews for a doctor
     */
    @Query("SELECT dr FROM DoctorReview dr WHERE dr.doctor.id = :doctorId AND dr.isPublic = true ORDER BY dr.createdAt DESC")
    List<DoctorReview> findRecentReviewsByDoctorId(@Param("doctorId") Long doctorId, Pageable pageable);
    
    /**
     * Check if patient has already reviewed a specific appointment
     */
    @Query("SELECT CASE WHEN COUNT(dr) > 0 THEN true ELSE false END FROM DoctorReview dr WHERE dr.appointment.id = :appointmentId AND dr.patient.id = :patientId")
    boolean hasPatientReviewedAppointment(@Param("appointmentId") Long appointmentId, @Param("patientId") Long patientId);
    
    /**
     * Find verified reviews for a doctor
     */
    @Query("SELECT dr FROM DoctorReview dr WHERE dr.doctor.id = :doctorId AND dr.isVerified = true AND dr.isPublic = true ORDER BY dr.createdAt DESC")
    List<DoctorReview> findVerifiedReviewsByDoctorId(@Param("doctorId") Long doctorId);
    
    /**
     * Count reviews by rating for a doctor
     */
    @Query("SELECT dr.rating, COUNT(dr) FROM DoctorReview dr WHERE dr.doctor.id = :doctorId AND dr.isPublic = true GROUP BY dr.rating")
    List<Object[]> countReviewsByRating(@Param("doctorId") Long doctorId);
}

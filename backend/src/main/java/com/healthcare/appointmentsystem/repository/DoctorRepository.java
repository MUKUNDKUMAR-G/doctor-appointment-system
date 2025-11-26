package com.healthcare.appointmentsystem.repository;

import com.healthcare.appointmentsystem.entity.Doctor;
import com.healthcare.appointmentsystem.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    
    /**
     * Find doctor by user
     */
    Optional<Doctor> findByUser(User user);
    
    /**
     * Find doctor by user ID
     */
    Optional<Doctor> findByUserId(Long userId);
    
    /**
     * Find doctors by specialty (case insensitive)
     */
    List<Doctor> findBySpecialtyContainingIgnoreCase(String specialty);
    
    /**
     * Find available doctors by specialty
     */
    @Query("SELECT d FROM Doctor d WHERE LOWER(d.specialty) LIKE LOWER(CONCAT('%', :specialty, '%')) " +
           "AND d.isAvailable = true AND d.user.enabled = true")
    List<Doctor> findAvailableDoctorsBySpecialty(@Param("specialty") String specialty);
    
    /**
     * Find all available doctors
     */
    @Query("SELECT d FROM Doctor d WHERE d.isAvailable = true AND d.user.enabled = true")
    List<Doctor> findAllAvailableDoctors();
    
    /**
     * Find doctors by experience years range
     */
    @Query("SELECT d FROM Doctor d WHERE d.experienceYears >= :minYears AND d.experienceYears <= :maxYears " +
           "AND d.isAvailable = true AND d.user.enabled = true")
    List<Doctor> findByExperienceYearsRange(@Param("minYears") Integer minYears, 
                                           @Param("maxYears") Integer maxYears);
    
    /**
     * Find doctors with availability on a specific date
     */
    @Query("SELECT DISTINCT d FROM Doctor d " +
           "JOIN d.availabilities da " +
           "WHERE da.availableDate = :date AND da.isAvailable = true " +
           "AND d.isAvailable = true AND d.user.enabled = true")
    List<Doctor> findDoctorsAvailableOnDate(@Param("date") LocalDateTime date);
    
    /**
     * Find doctors by specialty with availability
     */
    @Query("SELECT DISTINCT d FROM Doctor d " +
           "JOIN d.availabilities da " +
           "WHERE LOWER(d.specialty) LIKE LOWER(CONCAT('%', :specialty, '%')) " +
           "AND da.isAvailable = true AND d.isAvailable = true AND d.user.enabled = true")
    List<Doctor> findBySpecialtyWithAvailability(@Param("specialty") String specialty);
    
    /**
     * Search doctors by name or specialty
     */
    @Query("SELECT d FROM Doctor d " +
           "WHERE (LOWER(CONCAT(d.user.firstName, ' ', d.user.lastName)) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(d.specialty) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "AND d.isAvailable = true AND d.user.enabled = true")
    List<Doctor> searchDoctors(@Param("searchTerm") String searchTerm);
    
    /**
     * Find doctors by consultation fee range
     */
    @Query("SELECT d FROM Doctor d WHERE d.consultationFee >= :minFee AND d.consultationFee <= :maxFee " +
           "AND d.isAvailable = true AND d.user.enabled = true")
    List<Doctor> findByConsultationFeeRange(@Param("minFee") Double minFee, 
                                           @Param("maxFee") Double maxFee);
    
    /**
     * Count doctors by specialty
     */
    long countBySpecialtyContainingIgnoreCase(String specialty);
    
    /**
     * Count available doctors
     */
    long countByIsAvailableTrueAndUserEnabledTrue();
    
    /**
     * Find top doctors by experience
     */
    @Query("SELECT d FROM Doctor d WHERE d.isAvailable = true AND d.user.enabled = true " +
           "ORDER BY d.experienceYears DESC")
    List<Doctor> findTopDoctorsByExperience();
    
    /**
     * Find doctors with license number
     */
    Optional<Doctor> findByLicenseNumber(String licenseNumber);
    
    /**
     * Check if license number exists
     */
    boolean existsByLicenseNumber(String licenseNumber);
    
    /**
     * Find doctors created after a specific date
     */
    List<Doctor> findByCreatedAtAfter(LocalDateTime date);
    
    /**
     * Get all unique specialties
     */
    @Query("SELECT DISTINCT d.specialty FROM Doctor d WHERE d.isAvailable = true AND d.user.enabled = true")
    List<String> findAllSpecialties();
    
    /**
     * Find doctors by rating range
     */
    @Query("SELECT d FROM Doctor d WHERE d.rating >= :minRating " +
           "AND d.isAvailable = true AND d.user.enabled = true")
    List<Doctor> findByRatingGreaterThanEqual(@Param("minRating") Double minRating);
}
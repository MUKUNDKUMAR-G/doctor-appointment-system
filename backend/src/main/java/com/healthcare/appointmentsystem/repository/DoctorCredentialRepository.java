package com.healthcare.appointmentsystem.repository;

import com.healthcare.appointmentsystem.entity.DoctorCredential;
import com.healthcare.appointmentsystem.entity.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorCredentialRepository extends JpaRepository<DoctorCredential, Long> {
    
    /**
     * Find all credentials for a specific doctor
     */
    List<DoctorCredential> findByDoctorId(Long doctorId);
    
    /**
     * Count all credentials for a specific doctor
     */
    long countByDoctorId(Long doctorId);
    
    /**
     * Find credentials by doctor ID and verification status
     */
    @Query("SELECT dc FROM DoctorCredential dc WHERE dc.doctor.id = :doctorId AND dc.verificationStatus = :status")
    List<DoctorCredential> findByDoctorIdAndVerificationStatus(
        @Param("doctorId") Long doctorId, 
        @Param("status") VerificationStatus status
    );
    
    /**
     * Find all credentials with a specific verification status
     */
    @Query("SELECT dc FROM DoctorCredential dc WHERE dc.verificationStatus = :status")
    List<DoctorCredential> findByVerificationStatus(
        @Param("status") VerificationStatus status
    );
    
    /**
     * Find credentials by credential type for a doctor
     */
    @Query("SELECT dc FROM DoctorCredential dc WHERE dc.doctor.id = :doctorId AND dc.credentialType = :type")
    List<DoctorCredential> findByDoctorIdAndCredentialType(
        @Param("doctorId") Long doctorId, 
        @Param("type") String type
    );
    
    /**
     * Count verified credentials for a doctor
     */
    @Query("SELECT COUNT(dc) FROM DoctorCredential dc WHERE dc.doctor.id = :doctorId AND dc.verificationStatus = 'VERIFIED'")
    Long countVerifiedCredentialsByDoctorId(@Param("doctorId") Long doctorId);
    
    /**
     * Check if doctor has any verified credentials
     */
    @Query("SELECT CASE WHEN COUNT(dc) > 0 THEN true ELSE false END FROM DoctorCredential dc WHERE dc.doctor.id = :doctorId AND dc.verificationStatus = 'VERIFIED'")
    boolean hasVerifiedCredentials(@Param("doctorId") Long doctorId);
    
    /**
     * Find expired credentials
     */
    @Query("SELECT dc FROM DoctorCredential dc WHERE dc.expiryDate < :currentDate")
    List<DoctorCredential> findExpiredCredentials(@Param("currentDate") java.time.LocalDate currentDate);
    
    /**
     * Find credentials expiring soon (within specified days)
     */
    @Query("SELECT dc FROM DoctorCredential dc WHERE dc.expiryDate BETWEEN :currentDate AND :expiryDate")
    List<DoctorCredential> findCredentialsExpiringSoon(
            @Param("currentDate") java.time.LocalDate currentDate,
            @Param("expiryDate") java.time.LocalDate expiryDate
    );
}

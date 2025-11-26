package com.healthcare.appointmentsystem.repository;

import com.healthcare.appointmentsystem.entity.DoctorStatistics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DoctorStatisticsRepository extends JpaRepository<DoctorStatistics, Long> {
    
    /**
     * Find statistics by doctor ID
     */
    Optional<DoctorStatistics> findByDoctorId(Long doctorId);
    
    /**
     * Check if statistics exist for a doctor
     */
    boolean existsByDoctorId(Long doctorId);
    
    /**
     * Delete statistics by doctor ID
     */
    void deleteByDoctorId(Long doctorId);
}

package com.healthcare.appointmentsystem.repository;

import com.healthcare.appointmentsystem.entity.ScheduleTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

/**
 * Repository for ScheduleTemplate entity
 */
@Repository
public interface ScheduleTemplateRepository extends JpaRepository<ScheduleTemplate, Long> {
    
    /**
     * Find all templates for a doctor
     */
    List<ScheduleTemplate> findByDoctorId(Long doctorId);
    
    /**
     * Find active templates for a doctor
     */
    List<ScheduleTemplate> findByDoctorIdAndIsActiveTrue(Long doctorId);
    
    /**
     * Find template by doctor and name
     */
    Optional<ScheduleTemplate> findByDoctorIdAndTemplateName(Long doctorId, String templateName);
    
    /**
     * Find templates by doctor and day of week
     */
    List<ScheduleTemplate> findByDoctorIdAndDayOfWeek(Long doctorId, DayOfWeek dayOfWeek);
    
    /**
     * Find active templates by doctor and day of week
     */
    List<ScheduleTemplate> findByDoctorIdAndDayOfWeekAndIsActiveTrue(Long doctorId, DayOfWeek dayOfWeek);
    
    /**
     * Check if template name exists for doctor
     */
    boolean existsByDoctorIdAndTemplateName(Long doctorId, String templateName);
    
    /**
     * Count templates for a doctor
     */
    long countByDoctorId(Long doctorId);
    
    /**
     * Count active templates for a doctor
     */
    long countByDoctorIdAndIsActiveTrue(Long doctorId);
}

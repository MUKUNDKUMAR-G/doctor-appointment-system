package com.healthcare.appointmentsystem.repository;

import com.healthcare.appointmentsystem.entity.Doctor;
import com.healthcare.appointmentsystem.entity.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {
    
    /**
     * Find availability by doctor
     */
    List<DoctorAvailability> findByDoctor(Doctor doctor);
    
    /**
     * Find availability by doctor ID
     */
    List<DoctorAvailability> findByDoctorId(Long doctorId);
    
    /**
     * Find available slots by doctor and day of week
     */
    List<DoctorAvailability> findByDoctorIdAndDayOfWeekAndIsAvailableTrue(Long doctorId, DayOfWeek dayOfWeek);
    
    /**
     * Find availability by doctor and specific date
     */
    List<DoctorAvailability> findByDoctorIdAndAvailableDateAndIsAvailableTrue(Long doctorId, LocalDateTime availableDate);
    
    /**
     * Find availability by doctor in date range
     */
    @Query("SELECT da FROM DoctorAvailability da WHERE da.doctor.id = :doctorId " +
           "AND da.availableDate >= :startDate AND da.availableDate <= :endDate " +
           "AND da.isAvailable = true ORDER BY da.availableDate, da.startTime")
    List<DoctorAvailability> findByDoctorIdAndDateRange(@Param("doctorId") Long doctorId,
                                                       @Param("startDate") LocalDateTime startDate,
                                                       @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find availability by doctor and time range
     */
    @Query("SELECT da FROM DoctorAvailability da WHERE da.doctor.id = :doctorId " +
           "AND da.startTime <= :endTime AND da.endTime >= :startTime " +
           "AND da.isAvailable = true")
    List<DoctorAvailability> findByDoctorIdAndTimeRange(@Param("doctorId") Long doctorId,
                                                       @Param("startTime") LocalTime startTime,
                                                       @Param("endTime") LocalTime endTime);
    
    /**
     * Check if doctor is available at specific time
     */
    @Query("SELECT COUNT(da) > 0 FROM DoctorAvailability da WHERE da.doctor.id = :doctorId " +
           "AND ((da.dayOfWeek = :dayOfWeek AND da.availableDate IS NULL) " +
           "OR (da.availableDate = :specificDate)) " +
           "AND da.startTime <= :time AND da.endTime > :time " +
           "AND da.isAvailable = true")
    boolean isDoctorAvailableAtTime(@Param("doctorId") Long doctorId,
                                   @Param("dayOfWeek") DayOfWeek dayOfWeek,
                                   @Param("specificDate") LocalDateTime specificDate,
                                   @Param("time") LocalTime time);
    
    /**
     * Find recurring availability (by day of week)
     */
    List<DoctorAvailability> findByDoctorIdAndDayOfWeekIsNotNullAndIsAvailableTrue(Long doctorId);
    
    /**
     * Find specific date availability
     */
    List<DoctorAvailability> findByDoctorIdAndAvailableDateIsNotNullAndIsAvailableTrue(Long doctorId);
    
    /**
     * Find overlapping availability slots
     */
    @Query("SELECT da FROM DoctorAvailability da WHERE da.doctor.id = :doctorId " +
           "AND ((da.dayOfWeek = :dayOfWeek AND da.availableDate IS NULL) " +
           "OR (DATE(da.availableDate) = DATE(:date))) " +
           "AND ((da.startTime <= :startTime AND da.endTime > :startTime) " +
           "OR (da.startTime < :endTime AND da.endTime >= :endTime) " +
           "OR (da.startTime >= :startTime AND da.endTime <= :endTime))")
    List<DoctorAvailability> findOverlappingAvailability(@Param("doctorId") Long doctorId,
                                                        @Param("dayOfWeek") DayOfWeek dayOfWeek,
                                                        @Param("date") LocalDateTime date,
                                                        @Param("startTime") LocalTime startTime,
                                                        @Param("endTime") LocalTime endTime);
    
    /**
     * Delete availability by doctor and date
     */
    void deleteByDoctorIdAndAvailableDate(Long doctorId, LocalDateTime availableDate);
    
    /**
     * Delete availability by doctor and day of week
     */
    void deleteByDoctorIdAndDayOfWeek(Long doctorId, DayOfWeek dayOfWeek);
}
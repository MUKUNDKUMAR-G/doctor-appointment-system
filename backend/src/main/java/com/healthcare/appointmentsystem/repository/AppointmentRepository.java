package com.healthcare.appointmentsystem.repository;

import com.healthcare.appointmentsystem.entity.Appointment;
import com.healthcare.appointmentsystem.entity.AppointmentStatus;
import com.healthcare.appointmentsystem.entity.Doctor;
import com.healthcare.appointmentsystem.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    /**
     * Find appointments by patient
     */
    List<Appointment> findByPatient(User patient);
    
    /**
     * Find appointments by patient ID
     */
    List<Appointment> findByPatientId(Long patientId);
    
    /**
     * Find appointments by doctor
     */
    List<Appointment> findByDoctor(Doctor doctor);
    
    /**
     * Find appointments by doctor ID
     */
    List<Appointment> findByDoctorId(Long doctorId);
    
    /**
     * Find appointments by status
     */
    List<Appointment> findByStatus(AppointmentStatus status);
    
    /**
     * Find patient appointments by status
     */
    List<Appointment> findByPatientIdAndStatus(Long patientId, AppointmentStatus status);
    
    /**
     * Find doctor appointments by status
     */
    List<Appointment> findByDoctorIdAndStatus(Long doctorId, AppointmentStatus status);
    
    /**
     * Check for appointment conflicts (same doctor, overlapping time)
     */
    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId " +
           "AND a.status IN ('SCHEDULED', 'RESCHEDULED') " +
           "AND ((:startTime < FUNCTION('DATEADD', MINUTE, a.durationMinutes, a.appointmentDateTime) AND :endTime > a.appointmentDateTime))")
    List<Appointment> findConflictingAppointments(@Param("doctorId") Long doctorId,
                                                 @Param("startTime") LocalDateTime startTime,
                                                 @Param("endTime") LocalDateTime endTime);
    
    /**
     * Check if doctor has appointment at specific time
     */
    @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE a.doctor.id = :doctorId " +
           "AND a.appointmentDateTime = :appointmentTime " +
           "AND a.status IN ('SCHEDULED', 'RESCHEDULED')")
    boolean existsByDoctorIdAndAppointmentDateTime(@Param("doctorId") Long doctorId,
                                                  @Param("appointmentTime") LocalDateTime appointmentTime);
    
    /**
     * Find appointments in date range
     */
    @Query("SELECT a FROM Appointment a WHERE a.appointmentDateTime >= :startDate " +
           "AND a.appointmentDateTime <= :endDate ORDER BY a.appointmentDateTime")
    List<Appointment> findAppointmentsInDateRange(@Param("startDate") LocalDateTime startDate,
                                                 @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find patient appointments in date range
     */
    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId " +
           "AND a.appointmentDateTime >= :startDate AND a.appointmentDateTime <= :endDate " +
           "ORDER BY a.appointmentDateTime")
    List<Appointment> findPatientAppointmentsInDateRange(@Param("patientId") Long patientId,
                                                        @Param("startDate") LocalDateTime startDate,
                                                        @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find doctor appointments in date range
     */
    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId " +
           "AND a.appointmentDateTime >= :startDate AND a.appointmentDateTime <= :endDate " +
           "ORDER BY a.appointmentDateTime")
    List<Appointment> findDoctorAppointmentsInDateRange(@Param("doctorId") Long doctorId,
                                                       @Param("startDate") LocalDateTime startDate,
                                                       @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find upcoming appointments for patient
     */
    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId " +
           "AND a.appointmentDateTime > :currentTime AND a.status = 'SCHEDULED' " +
           "ORDER BY a.appointmentDateTime")
    List<Appointment> findUpcomingPatientAppointments(@Param("patientId") Long patientId,
                                                     @Param("currentTime") LocalDateTime currentTime);
    
    /**
     * Find upcoming appointments for doctor
     */
    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId " +
           "AND a.appointmentDateTime > :currentTime AND a.status = 'SCHEDULED' " +
           "ORDER BY a.appointmentDateTime")
    List<Appointment> findUpcomingDoctorAppointments(@Param("doctorId") Long doctorId,
                                                    @Param("currentTime") LocalDateTime currentTime);
    
    /**
     * Find past appointments for patient
     */
    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId " +
           "AND a.appointmentDateTime < :currentTime " +
           "ORDER BY a.appointmentDateTime DESC")
    List<Appointment> findPastPatientAppointments(@Param("patientId") Long patientId,
                                                 @Param("currentTime") LocalDateTime currentTime);
    
    /**
     * Find expired reservations
     */
    @Query("SELECT a FROM Appointment a WHERE a.isReserved = true " +
           "AND a.reservationExpiresAt < :currentTime")
    List<Appointment> findExpiredReservations(@Param("currentTime") LocalDateTime currentTime);
    
    /**
     * Clean up expired reservations
     */
    @Modifying
    @Query("DELETE FROM Appointment a WHERE a.isReserved = true " +
           "AND a.reservationExpiresAt < :currentTime")
    void deleteExpiredReservations(@Param("currentTime") LocalDateTime currentTime);
    
    /**
     * Find appointments that can be cancelled (24+ hours in advance)
     */
    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId " +
           "AND a.status = 'SCHEDULED' AND a.appointmentDateTime > :minimumCancellationTime")
    List<Appointment> findCancellableAppointments(@Param("patientId") Long patientId,
                                                 @Param("minimumCancellationTime") LocalDateTime minimumCancellationTime);
    
    /**
     * Count appointments by status
     */
    long countByStatus(AppointmentStatus status);
    
    /**
     * Count patient appointments by status
     */
    long countByPatientIdAndStatus(Long patientId, AppointmentStatus status);
    
    /**
     * Count doctor appointments by status
     */
    long countByDoctorIdAndStatus(Long doctorId, AppointmentStatus status);
    
    /**
     * Find appointments by patient and doctor
     */
    List<Appointment> findByPatientIdAndDoctorId(Long patientId, Long doctorId);
    
    /**
     * Find today's appointments for doctor
     */
    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId " +
           "AND FUNCTION('DATE', a.appointmentDateTime) = FUNCTION('DATE', :today) " +
           "AND a.status IN ('SCHEDULED', 'RESCHEDULED') " +
           "ORDER BY a.appointmentDateTime")
    List<Appointment> findTodayAppointmentsForDoctor(@Param("doctorId") Long doctorId,
                                                    @Param("today") LocalDateTime today);
    
    /**
     * Find appointments needing reminders (24 hours before)
     */
    @Query("SELECT a FROM Appointment a WHERE a.status = 'SCHEDULED' " +
           "AND a.appointmentDateTime BETWEEN :reminderStart AND :reminderEnd")
    List<Appointment> findAppointmentsNeedingReminders(@Param("reminderStart") LocalDateTime reminderStart,
                                                      @Param("reminderEnd") LocalDateTime reminderEnd);
    
    /**
     * Find appointments by doctor ID and date time between
     */
    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId " +
           "AND a.appointmentDateTime >= :startDateTime AND a.appointmentDateTime <= :endDateTime " +
           "ORDER BY a.appointmentDateTime")
    List<Appointment> findByDoctorIdAndAppointmentDateTimeBetween(@Param("doctorId") Long doctorId,
                                                                 @Param("startDateTime") LocalDateTime startDateTime,
                                                                 @Param("endDateTime") LocalDateTime endDateTime);
    
    /**
     * Find appointments by doctor ID and exact appointment date time
     */
    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId " +
           "AND a.appointmentDateTime = :appointmentDateTime")
    List<Appointment> findByDoctorIdAndAppointmentDateTime(@Param("doctorId") Long doctorId,
                                                          @Param("appointmentDateTime") LocalDateTime appointmentDateTime);
    
    /**
     * Count appointments by doctor ID
     */
    long countByDoctorId(Long doctorId);
    
    /**
     * Count appointments by appointment time between and status
     */
    long countByAppointmentDateTimeBetweenAndStatus(LocalDateTime startTime, LocalDateTime endTime, AppointmentStatus status);
}
package com.healthcare.appointmentsystem.scheduler;

import com.healthcare.appointmentsystem.repository.AppointmentRepository;
import com.healthcare.appointmentsystem.repository.DoctorRepository;
import com.healthcare.appointmentsystem.repository.UserRepository;
import com.healthcare.appointmentsystem.service.RealTimeUpdateService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Map;

/**
 * Scheduler for broadcasting real-time stats updates to admin clients
 */
@Component
public class RealTimeStatsScheduler {
    
    private static final Logger log = LoggerFactory.getLogger(RealTimeStatsScheduler.class);
    
    private final RealTimeUpdateService realTimeUpdateService;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    
    @Autowired
    public RealTimeStatsScheduler(
            RealTimeUpdateService realTimeUpdateService,
            UserRepository userRepository,
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository) {
        this.realTimeUpdateService = realTimeUpdateService;
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }
    
    /**
     * Broadcast stats update every 30 seconds
     */
    @Scheduled(fixedRate = 30000)
    public void broadcastStatsUpdate() {
        try {
            long totalUsers = userRepository.count();
            long totalDoctors = doctorRepository.count();
            long totalAppointments = appointmentRepository.count();
            long activeDoctors = doctorRepository.findAll().stream()
                    .filter(d -> d.getIsAvailable() != null && d.getIsAvailable())
                    .count();
            long todayAppointments = appointmentRepository.findAll().stream()
                    .filter(a -> a.getAppointmentDateTime() != null && 
                            a.getAppointmentDateTime().toLocalDate().equals(LocalDate.now()))
                    .count();
            
            Map<String, Object> stats = Map.of(
                    "totalUsers", totalUsers,
                    "totalDoctors", totalDoctors,
                    "activeDoctors", activeDoctors,
                    "totalAppointments", totalAppointments,
                    "todayAppointments", todayAppointments
            );
            
            realTimeUpdateService.broadcastStatsUpdate(stats);
        } catch (Exception e) {
            log.error("Error broadcasting stats update", e);
        }
    }
}

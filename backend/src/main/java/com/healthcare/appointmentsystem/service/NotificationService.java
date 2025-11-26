package com.healthcare.appointmentsystem.service;

import com.healthcare.appointmentsystem.entity.*;
import com.healthcare.appointmentsystem.repository.NotificationLogRepository;
import com.healthcare.appointmentsystem.repository.NotificationTemplateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.CompletableFuture;

@Service
public class NotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a");
    
    @Value("${app.notification.email.enabled:true}")
    private boolean emailNotificationEnabled;
    
    @Value("${app.notification.sms.enabled:false}")
    private boolean smsNotificationEnabled;
    
    @Value("${app.notification.from-email:noreply@healthcareapp.com}")
    private String fromEmail;
    
    @Value("${app.notification.from-name:Healthcare Appointment System}")
    private String fromName;
    
    @Autowired
    private NotificationLogRepository notificationLogRepository;
    
    @Autowired
    private NotificationTemplateRepository notificationTemplateRepository;
    
    /**
     * Send appointment confirmation notification
     */
    @Async
    public CompletableFuture<Void> sendAppointmentConfirmation(Appointment appointment) {
        logger.info("Sending appointment confirmation for appointment ID: {}", appointment.getId());
        
        try {
            String patientEmail = appointment.getPatient().getEmail();
            String patientName = appointment.getPatient().getFullName();
            String doctorName = appointment.getDoctor().getFullName();
            String doctorSpecialty = appointment.getDoctor().getSpecialty();
            String appointmentTime = appointment.getAppointmentDateTime().format(DATE_TIME_FORMATTER);
            
            // Email notification
            if (emailNotificationEnabled) {
                String subject = "Appointment Confirmation - " + appointmentTime;
                String emailBody = buildConfirmationEmailBody(patientName, doctorName, doctorSpecialty, 
                                                            appointmentTime, appointment);
                sendEmailWithLogging(appointment, NotificationType.APPOINTMENT_CONFIRMATION, patientEmail, subject, emailBody);
            }
            
            // SMS notification
            if (smsNotificationEnabled) {
                String smsMessage = buildConfirmationSmsMessage(patientName, doctorName, appointmentTime);
                sendSmsWithLogging(appointment, NotificationType.APPOINTMENT_CONFIRMATION, 
                                 appointment.getPatient().getPhoneNumber(), smsMessage);
            }
            
            logger.info("Appointment confirmation sent successfully for appointment ID: {}", appointment.getId());
            
        } catch (Exception e) {
            logger.error("Failed to send appointment confirmation for appointment ID {}: {}", 
                        appointment.getId(), e.getMessage(), e);
        }
        
        return CompletableFuture.completedFuture(null);
    }
    
    /**
     * Send appointment cancellation notification
     */
    @Async
    public CompletableFuture<Void> sendAppointmentCancellation(Appointment appointment) {
        logger.info("Sending appointment cancellation for appointment ID: {}", appointment.getId());
        
        try {
            String patientEmail = appointment.getPatient().getEmail();
            String patientName = appointment.getPatient().getFullName();
            String doctorName = appointment.getDoctor().getFullName();
            String appointmentTime = appointment.getAppointmentDateTime().format(DATE_TIME_FORMATTER);
            
            // Email notification
            if (emailNotificationEnabled) {
                String subject = "Appointment Cancelled - " + appointmentTime;
                String emailBody = buildCancellationEmailBody(patientName, doctorName, appointmentTime, 
                                                            appointment.getCancellationReason());
                sendEmailWithLogging(appointment, NotificationType.APPOINTMENT_CANCELLATION, patientEmail, subject, emailBody);
            }
            
            // SMS notification
            if (smsNotificationEnabled) {
                String smsMessage = buildCancellationSmsMessage(patientName, doctorName, appointmentTime);
                sendSmsWithLogging(appointment, NotificationType.APPOINTMENT_CANCELLATION, 
                                 appointment.getPatient().getPhoneNumber(), smsMessage);
            }
            
            logger.info("Appointment cancellation notification sent successfully for appointment ID: {}", 
                       appointment.getId());
            
        } catch (Exception e) {
            logger.error("Failed to send appointment cancellation for appointment ID {}: {}", 
                        appointment.getId(), e.getMessage(), e);
        }
        
        return CompletableFuture.completedFuture(null);
    }
    
    /**
     * Send appointment reschedule notification
     */
    @Async
    public CompletableFuture<Void> sendAppointmentReschedule(Appointment appointment, LocalDateTime oldDateTime) {
        logger.info("Sending appointment reschedule notification for appointment ID: {}", appointment.getId());
        
        try {
            String patientEmail = appointment.getPatient().getEmail();
            String patientName = appointment.getPatient().getFullName();
            String doctorName = appointment.getDoctor().getFullName();
            String oldAppointmentTime = oldDateTime.format(DATE_TIME_FORMATTER);
            String newAppointmentTime = appointment.getAppointmentDateTime().format(DATE_TIME_FORMATTER);
            
            // Email notification
            if (emailNotificationEnabled) {
                String subject = "Appointment Rescheduled - New Time: " + newAppointmentTime;
                String emailBody = buildRescheduleEmailBody(patientName, doctorName, oldAppointmentTime, 
                                                          newAppointmentTime, appointment.getReason());
                sendEmailWithLogging(appointment, NotificationType.APPOINTMENT_RESCHEDULE, patientEmail, subject, emailBody);
            }
            
            // SMS notification
            if (smsNotificationEnabled) {
                String smsMessage = buildRescheduleSmsMessage(patientName, doctorName, newAppointmentTime);
                sendSmsWithLogging(appointment, NotificationType.APPOINTMENT_RESCHEDULE, 
                                 appointment.getPatient().getPhoneNumber(), smsMessage);
            }
            
            logger.info("Appointment reschedule notification sent successfully for appointment ID: {}", 
                       appointment.getId());
            
        } catch (Exception e) {
            logger.error("Failed to send appointment reschedule notification for appointment ID {}: {}", 
                        appointment.getId(), e.getMessage(), e);
        }
        
        return CompletableFuture.completedFuture(null);
    }
    
    /**
     * Send appointment reminder notification
     */
    @Async
    public CompletableFuture<Void> sendAppointmentReminder(Appointment appointment) {
        logger.info("Sending appointment reminder for appointment ID: {}", appointment.getId());
        
        try {
            String patientEmail = appointment.getPatient().getEmail();
            String patientName = appointment.getPatient().getFullName();
            String doctorName = appointment.getDoctor().getFullName();
            String appointmentTime = appointment.getAppointmentDateTime().format(DATE_TIME_FORMATTER);
            
            // Email notification
            if (emailNotificationEnabled) {
                String subject = "Appointment Reminder - Tomorrow at " + appointmentTime;
                String emailBody = buildReminderEmailBody(patientName, doctorName, appointmentTime, appointment);
                sendEmailWithLogging(appointment, NotificationType.APPOINTMENT_REMINDER, patientEmail, subject, emailBody);
            }
            
            // SMS notification
            if (smsNotificationEnabled) {
                String smsMessage = buildReminderSmsMessage(patientName, doctorName, appointmentTime);
                sendSmsWithLogging(appointment, NotificationType.APPOINTMENT_REMINDER, 
                                 appointment.getPatient().getPhoneNumber(), smsMessage);
            }
            
            logger.info("Appointment reminder sent successfully for appointment ID: {}", appointment.getId());
            
        } catch (Exception e) {
            logger.error("Failed to send appointment reminder for appointment ID {}: {}", 
                        appointment.getId(), e.getMessage(), e);
        }
        
        return CompletableFuture.completedFuture(null);
    }
    
    /**
     * Send email notification with logging
     */
    private void sendEmail(String toEmail, String subject, String body) {
        sendEmailWithLogging(null, NotificationType.APPOINTMENT_CONFIRMATION, toEmail, subject, body);
    }
    
    /**
     * Send email notification with logging
     */
    private void sendEmailWithLogging(Appointment appointment, NotificationType type, String toEmail, String subject, String body) {
        NotificationLog log = new NotificationLog(appointment, type, NotificationChannel.EMAIL, toEmail, subject, body);
        
        try {
            // Save initial log entry
            log = notificationLogRepository.save(log);
            
            // In a real implementation, this would integrate with an email service like:
            // - Spring Mail with SMTP
            // - AWS SES
            // - SendGrid
            // - Mailgun
            
            logger.info("Sending email to: {} with subject: {}", toEmail, subject);
            logger.debug("Email body: {}", body);
            
            // Simulate email sending
            Thread.sleep(100); // Simulate network delay
            
            // Mark as sent
            log.markAsSent();
            notificationLogRepository.save(log);
            
            logger.info("Email sent successfully to: {}", toEmail);
            
        } catch (Exception e) {
            logger.error("Failed to send email to {}: {}", toEmail, e.getMessage(), e);
            
            // Mark as failed
            log.markAsFailed(e.getMessage());
            notificationLogRepository.save(log);
            
            throw new RuntimeException("Email sending failed", e);
        }
    }
    
    /**
     * Send SMS notification with logging
     */
    private void sendSms(String phoneNumber, String message) {
        sendSmsWithLogging(null, NotificationType.APPOINTMENT_CONFIRMATION, phoneNumber, message);
    }
    
    /**
     * Send SMS notification with logging
     */
    private void sendSmsWithLogging(Appointment appointment, NotificationType type, String phoneNumber, String message) {
        NotificationLog log = new NotificationLog(appointment, type, NotificationChannel.SMS, 
                                                 appointment != null ? appointment.getPatient().getEmail() : "unknown", 
                                                 "SMS Notification", message);
        log.setRecipientPhone(phoneNumber);
        
        try {
            // Save initial log entry
            log = notificationLogRepository.save(log);
            
            // In a real implementation, this would integrate with an SMS service like:
            // - Twilio
            // - AWS SNS
            // - Nexmo/Vonage
            // - TextMagic
            
            logger.info("Sending SMS to: {} with message: {}", phoneNumber, message);
            
            // Simulate SMS sending
            Thread.sleep(50); // Simulate network delay
            
            // Mark as sent
            log.markAsSent();
            notificationLogRepository.save(log);
            
            logger.info("SMS sent successfully to: {}", phoneNumber);
            
        } catch (Exception e) {
            logger.error("Failed to send SMS to {}: {}", phoneNumber, e.getMessage(), e);
            
            // Mark as failed
            log.markAsFailed(e.getMessage());
            notificationLogRepository.save(log);
            
            throw new RuntimeException("SMS sending failed", e);
        }
    }
    
    /**
     * Build confirmation email body
     */
    private String buildConfirmationEmailBody(String patientName, String doctorName, String doctorSpecialty,
                                            String appointmentTime, Appointment appointment) {
        return String.format("""
            Dear %s,
            
            Your appointment has been confirmed with the following details:
            
            Doctor: Dr. %s (%s)
            Date & Time: %s
            Duration: %d minutes
            %s
            
            Please arrive 15 minutes early for check-in.
            
            If you need to reschedule or cancel this appointment, please do so at least 24 hours in advance.
            
            Thank you for choosing our healthcare services.
            
            Best regards,
            %s
            """, 
            patientName, 
            doctorName, 
            doctorSpecialty,
            appointmentTime,
            appointment.getDurationMinutes(),
            appointment.getReason() != null ? "Reason: " + appointment.getReason() : "",
            fromName
        );
    }
    
    /**
     * Build cancellation email body
     */
    private String buildCancellationEmailBody(String patientName, String doctorName, String appointmentTime, 
                                            String cancellationReason) {
        return String.format("""
            Dear %s,
            
            Your appointment with Dr. %s scheduled for %s has been cancelled.
            
            %s
            
            You can book a new appointment at your convenience through our system.
            
            We apologize for any inconvenience caused.
            
            Best regards,
            %s
            """, 
            patientName, 
            doctorName, 
            appointmentTime,
            cancellationReason != null ? "Reason: " + cancellationReason : "",
            fromName
        );
    }
    
    /**
     * Build reschedule email body
     */
    private String buildRescheduleEmailBody(String patientName, String doctorName, String oldTime, 
                                          String newTime, String reason) {
        return String.format("""
            Dear %s,
            
            Your appointment with Dr. %s has been rescheduled:
            
            Previous Time: %s
            New Time: %s
            %s
            
            Please make note of the new appointment time.
            
            If you need to make further changes, please do so at least 24 hours in advance.
            
            Best regards,
            %s
            """, 
            patientName, 
            doctorName, 
            oldTime,
            newTime,
            reason != null ? "Reason: " + reason : "",
            fromName
        );
    }
    
    /**
     * Build reminder email body
     */
    private String buildReminderEmailBody(String patientName, String doctorName, String appointmentTime, 
                                        Appointment appointment) {
        return String.format("""
            Dear %s,
            
            This is a reminder that you have an appointment tomorrow:
            
            Doctor: Dr. %s
            Date & Time: %s
            Duration: %d minutes
            %s
            
            Please arrive 15 minutes early for check-in.
            
            If you need to cancel or reschedule, please do so as soon as possible.
            
            Best regards,
            %s
            """, 
            patientName, 
            doctorName, 
            appointmentTime,
            appointment.getDurationMinutes(),
            appointment.getReason() != null ? "Reason: " + appointment.getReason() : "",
            fromName
        );
    }
    
    /**
     * Build confirmation SMS message
     */
    private String buildConfirmationSmsMessage(String patientName, String doctorName, String appointmentTime) {
        return String.format("Hi %s, your appointment with Dr. %s is confirmed for %s. Please arrive 15 min early.", 
                           patientName, doctorName, appointmentTime);
    }
    
    /**
     * Build cancellation SMS message
     */
    private String buildCancellationSmsMessage(String patientName, String doctorName, String appointmentTime) {
        return String.format("Hi %s, your appointment with Dr. %s for %s has been cancelled. You can book a new appointment anytime.", 
                           patientName, doctorName, appointmentTime);
    }
    
    /**
     * Build reschedule SMS message
     */
    private String buildRescheduleSmsMessage(String patientName, String doctorName, String newTime) {
        return String.format("Hi %s, your appointment with Dr. %s has been rescheduled to %s.", 
                           patientName, doctorName, newTime);
    }
    
    /**
     * Build reminder SMS message
     */
    private String buildReminderSmsMessage(String patientName, String doctorName, String appointmentTime) {
        return String.format("Reminder: Hi %s, you have an appointment with Dr. %s tomorrow at %s. Please arrive 15 min early.", 
                           patientName, doctorName, appointmentTime);
    }
}
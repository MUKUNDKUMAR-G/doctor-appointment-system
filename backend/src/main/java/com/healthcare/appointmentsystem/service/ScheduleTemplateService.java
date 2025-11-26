package com.healthcare.appointmentsystem.service;

import com.healthcare.appointmentsystem.entity.Doctor;
import com.healthcare.appointmentsystem.entity.DoctorAvailability;
import com.healthcare.appointmentsystem.entity.ScheduleTemplate;
import com.healthcare.appointmentsystem.repository.DoctorAvailabilityRepository;
import com.healthcare.appointmentsystem.repository.DoctorRepository;
import com.healthcare.appointmentsystem.repository.ScheduleTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
@Service
@Transactional
public class ScheduleTemplateService {
    
    @Autowired
    private ScheduleTemplateRepository templateRepository;
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private DoctorAvailabilityRepository availabilityRepository;
    
    /**
     * Create a new schedule template
     */
    public ScheduleTemplate createTemplate(Long doctorId, String templateName, String description,
                                          DayOfWeek dayOfWeek, LocalTime startTime, LocalTime endTime,
                                          Integer slotDurationMinutes) {
        Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
        if (doctorOpt.isEmpty()) {
            throw new IllegalArgumentException("Doctor not found with ID: " + doctorId);
        }
        
        // Check if template name already exists for this doctor
        if (templateRepository.existsByDoctorIdAndTemplateName(doctorId, templateName)) {
            throw new IllegalStateException("Template with name '" + templateName + "' already exists");
        }
        
        Doctor doctor = doctorOpt.get();
        ScheduleTemplate template = new ScheduleTemplate(doctor, templateName, dayOfWeek, startTime, endTime);
        template.setDescription(description);
        template.setSlotDurationMinutes(slotDurationMinutes != null ? slotDurationMinutes : 30);
        
        return templateRepository.save(template);
    }
    
    /**
     * Create a weekly schedule template (all 7 days)
     */
    public List<ScheduleTemplate> createWeeklyTemplate(Long doctorId, String templateNamePrefix,
                                                      LocalTime startTime, LocalTime endTime,
                                                      Integer slotDurationMinutes,
                                                      List<DayOfWeek> activeDays) {
        Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
        if (doctorOpt.isEmpty()) {
            throw new IllegalArgumentException("Doctor not found with ID: " + doctorId);
        }
        
        Doctor doctor = doctorOpt.get();
        List<ScheduleTemplate> templates = new ArrayList<>();
        
        for (DayOfWeek day : activeDays) {
            String templateName = templateNamePrefix + " - " + day.toString();
            
            // Skip if template already exists
            if (templateRepository.existsByDoctorIdAndTemplateName(doctorId, templateName)) {
                continue;
            }
            
            ScheduleTemplate template = new ScheduleTemplate(doctor, templateName, day, startTime, endTime);
            template.setSlotDurationMinutes(slotDurationMinutes != null ? slotDurationMinutes : 30);
            templates.add(templateRepository.save(template));
        }
        
        return templates;
    }
    
    /**
     * Update a schedule template
     */
    public ScheduleTemplate updateTemplate(Long templateId, String templateName, String description,
                                          DayOfWeek dayOfWeek, LocalTime startTime, LocalTime endTime,
                                          Integer slotDurationMinutes, Boolean isActive) {
        Optional<ScheduleTemplate> templateOpt = templateRepository.findById(templateId);
        if (templateOpt.isEmpty()) {
            throw new IllegalArgumentException("Template not found with ID: " + templateId);
        }
        
        ScheduleTemplate template = templateOpt.get();
        
        if (templateName != null && !templateName.equals(template.getTemplateName())) {
            // Check if new name already exists
            if (templateRepository.existsByDoctorIdAndTemplateName(
                    template.getDoctor().getId(), templateName)) {
                throw new IllegalStateException("Template with name '" + templateName + "' already exists");
            }
            template.setTemplateName(templateName);
        }
        
        if (description != null) {
            template.setDescription(description);
        }
        if (dayOfWeek != null) {
            template.setDayOfWeek(dayOfWeek);
        }
        if (startTime != null) {
            template.setStartTime(startTime);
        }
        if (endTime != null) {
            template.setEndTime(endTime);
        }
        if (slotDurationMinutes != null) {
            template.setSlotDurationMinutes(slotDurationMinutes);
        }
        if (isActive != null) {
            template.setIsActive(isActive);
        }
        
        return templateRepository.save(template);
    }
    
    /**
     * Delete a schedule template
     */
    public void deleteTemplate(Long templateId) {
        if (!templateRepository.existsById(templateId)) {
            throw new IllegalArgumentException("Template not found with ID: " + templateId);
        }
        templateRepository.deleteById(templateId);
    }
    
    /**
     * Get all templates for a doctor
     */
    @Transactional(readOnly = true)
    public List<ScheduleTemplate> getDoctorTemplates(Long doctorId) {
        return templateRepository.findByDoctorId(doctorId);
    }
    
    /**
     * Get active templates for a doctor
     */
    @Transactional(readOnly = true)
    public List<ScheduleTemplate> getActiveDoctorTemplates(Long doctorId) {
        return templateRepository.findByDoctorIdAndIsActiveTrue(doctorId);
    }
    
    /**
     * Get template by ID
     */
    @Transactional(readOnly = true)
    public ScheduleTemplate getTemplate(Long templateId) {
        return templateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("Template not found with ID: " + templateId));
    }
    
    /**
     * Get template by name
     */
    @Transactional(readOnly = true)
    public ScheduleTemplate getTemplateByName(Long doctorId, String templateName) {
        return templateRepository.findByDoctorIdAndTemplateName(doctorId, templateName)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Template not found with name: " + templateName));
    }
    
    /**
     * Apply template to create actual availability
     */
    public DoctorAvailability applyTemplate(Long templateId) {
        ScheduleTemplate template = getTemplate(templateId);
        
        if (!template.getIsActive()) {
            throw new IllegalStateException("Cannot apply inactive template");
        }
        
        Doctor doctor = template.getDoctor();
        
        // Check for overlapping availability
        List<DoctorAvailability> overlapping = availabilityRepository
                .findOverlappingAvailability(doctor.getId(), template.getDayOfWeek(), null,
                                           template.getStartTime(), template.getEndTime());
        
        if (!overlapping.isEmpty()) {
            throw new IllegalStateException("Overlapping availability already exists for this time slot");
        }
        
        DoctorAvailability availability = new DoctorAvailability(
                doctor, template.getDayOfWeek(), template.getStartTime(), template.getEndTime());
        availability.setSlotDurationMinutes(template.getSlotDurationMinutes());
        
        return availabilityRepository.save(availability);
    }
    
    /**
     * Apply template to multiple days
     */
    public List<DoctorAvailability> applyTemplateToMultipleDays(Long templateId, List<DayOfWeek> daysOfWeek) {
        ScheduleTemplate template = getTemplate(templateId);
        
        if (!template.getIsActive()) {
            throw new IllegalStateException("Cannot apply inactive template");
        }
        
        Doctor doctor = template.getDoctor();
        List<DoctorAvailability> createdAvailabilities = new ArrayList<>();
        
        for (DayOfWeek dayOfWeek : daysOfWeek) {
            // Check for overlapping availability
            List<DoctorAvailability> overlapping = availabilityRepository
                    .findOverlappingAvailability(doctor.getId(), dayOfWeek, null,
                                               template.getStartTime(), template.getEndTime());
            
            if (overlapping.isEmpty()) {
                DoctorAvailability availability = new DoctorAvailability(
                        doctor, dayOfWeek, template.getStartTime(), template.getEndTime());
                availability.setSlotDurationMinutes(template.getSlotDurationMinutes());
                createdAvailabilities.add(availabilityRepository.save(availability));
            }
        }
        
        return createdAvailabilities;
    }
    
    /**
     * Apply all active templates for a doctor
     */
    public List<DoctorAvailability> applyAllActiveTemplates(Long doctorId) {
        List<ScheduleTemplate> activeTemplates = getActiveDoctorTemplates(doctorId);
        List<DoctorAvailability> createdAvailabilities = new ArrayList<>();
        
        for (ScheduleTemplate template : activeTemplates) {
            try {
                DoctorAvailability availability = applyTemplate(template.getId());
                createdAvailabilities.add(availability);
            } catch (IllegalStateException e) {
                // Skip templates that would create conflicts
                continue;
            }
        }
        
        return createdAvailabilities;
    }
    
    /**
     * Clone a template
     */
    public ScheduleTemplate cloneTemplate(Long templateId, String newTemplateName) {
        ScheduleTemplate original = getTemplate(templateId);
        
        // Check if new name already exists
        if (templateRepository.existsByDoctorIdAndTemplateName(
                original.getDoctor().getId(), newTemplateName)) {
            throw new IllegalStateException("Template with name '" + newTemplateName + "' already exists");
        }
        
        ScheduleTemplate clone = new ScheduleTemplate(
                original.getDoctor(), newTemplateName, original.getDayOfWeek(),
                original.getStartTime(), original.getEndTime());
        clone.setDescription(original.getDescription());
        clone.setSlotDurationMinutes(original.getSlotDurationMinutes());
        clone.setIsActive(original.getIsActive());
        
        return templateRepository.save(clone);
    }
    
    /**
     * Copy template to another day
     */
    public ScheduleTemplate copyTemplateToDay(Long templateId, DayOfWeek targetDay, String newTemplateName) {
        ScheduleTemplate original = getTemplate(templateId);
        
        // Check if new name already exists
        if (templateRepository.existsByDoctorIdAndTemplateName(
                original.getDoctor().getId(), newTemplateName)) {
            throw new IllegalStateException("Template with name '" + newTemplateName + "' already exists");
        }
        
        ScheduleTemplate copy = new ScheduleTemplate(
                original.getDoctor(), newTemplateName, targetDay,
                original.getStartTime(), original.getEndTime());
        copy.setDescription(original.getDescription());
        copy.setSlotDurationMinutes(original.getSlotDurationMinutes());
        copy.setIsActive(original.getIsActive());
        
        return templateRepository.save(copy);
    }
    
    /**
     * Create template from existing availability
     */
    public ScheduleTemplate createTemplateFromAvailability(Long availabilityId, String templateName, String description) {
        DoctorAvailability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new IllegalArgumentException("Availability not found with ID: " + availabilityId));
        
        if (availability.getDayOfWeek() == null) {
            throw new IllegalArgumentException("Cannot create template from specific date availability");
        }
        
        Doctor doctor = availability.getDoctor();
        
        // Check if template name already exists
        if (templateRepository.existsByDoctorIdAndTemplateName(doctor.getId(), templateName)) {
            throw new IllegalStateException("Template with name '" + templateName + "' already exists");
        }
        
        ScheduleTemplate template = new ScheduleTemplate(
                doctor, templateName, availability.getDayOfWeek(),
                availability.getStartTime(), availability.getEndTime());
        template.setDescription(description);
        template.setSlotDurationMinutes(availability.getSlotDurationMinutes());
        
        return templateRepository.save(template);
    }
    
    /**
     * Get template statistics
     */
    @Transactional(readOnly = true)
    public TemplateStatistics getTemplateStatistics(Long doctorId) {
        long totalTemplates = templateRepository.countByDoctorId(doctorId);
        long activeTemplates = templateRepository.countByDoctorIdAndIsActiveTrue(doctorId);
        
        return new TemplateStatistics(totalTemplates, activeTemplates);
    }
    
    /**
     * Inner class for template statistics
     */
    public static class TemplateStatistics {
        private final long totalTemplates;
        private final long activeTemplates;
        
        public TemplateStatistics(long totalTemplates, long activeTemplates) {
            this.totalTemplates = totalTemplates;
            this.activeTemplates = activeTemplates;
        }
        
        public long getTotalTemplates() { return totalTemplates; }
        public long getActiveTemplates() { return activeTemplates; }
    }
}

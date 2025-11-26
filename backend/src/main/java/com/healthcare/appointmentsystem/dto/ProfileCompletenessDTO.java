package com.healthcare.appointmentsystem.dto;

import java.util.ArrayList;
import java.util.List;

public class ProfileCompletenessDTO {
    
    private Integer percentage;
    private List<MissingField> missingFields;
    
    public ProfileCompletenessDTO() {
        this.missingFields = new ArrayList<>();
    }
    
    public ProfileCompletenessDTO(Integer percentage, List<MissingField> missingFields) {
        this.percentage = percentage;
        this.missingFields = missingFields != null ? missingFields : new ArrayList<>();
    }
    
    public Integer getPercentage() {
        return percentage;
    }
    
    public void setPercentage(Integer percentage) {
        this.percentage = percentage;
    }
    
    public List<MissingField> getMissingFields() {
        return missingFields;
    }
    
    public void setMissingFields(List<MissingField> missingFields) {
        this.missingFields = missingFields;
    }
    
    public void addMissingField(String field, String label, String priority) {
        this.missingFields.add(new MissingField(field, label, priority));
    }
    
    public static class MissingField {
        private String field;
        private String label;
        private String priority; // "high", "medium", "low"
        
        public MissingField() {}
        
        public MissingField(String field, String label, String priority) {
            this.field = field;
            this.label = label;
            this.priority = priority;
        }
        
        public String getField() {
            return field;
        }
        
        public void setField(String field) {
            this.field = field;
        }
        
        public String getLabel() {
            return label;
        }
        
        public void setLabel(String label) {
            this.label = label;
        }
        
        public String getPriority() {
            return priority;
        }
        
        public void setPriority(String priority) {
            this.priority = priority;
        }
    }
    
    @Override
    public String toString() {
        return "ProfileCompletenessDTO{" +
                "percentage=" + percentage +
                ", missingFieldsCount=" + (missingFields != null ? missingFields.size() : 0) +
                '}';
    }
}

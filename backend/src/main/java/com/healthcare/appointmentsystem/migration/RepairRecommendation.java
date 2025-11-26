package com.healthcare.appointmentsystem.migration;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Repair recommendation object containing analysis and suggested actions
 * Provides guidance for administrators on repair strategies
 */
public class RepairRecommendation {
    
    private ChecksumValidationResult validationResult;
    private SchemaRepairService.RepairStrategy recommendedStrategy;
    private List<String> recommendations;
    private LocalDateTime analysisTimestamp;
    private String riskLevel;
    private String impactAssessment;
    
    public RepairRecommendation() {
        this.recommendations = new ArrayList<>();
        this.analysisTimestamp = LocalDateTime.now();
    }
    
    public ChecksumValidationResult getValidationResult() {
        return validationResult;
    }
    
    public void setValidationResult(ChecksumValidationResult validationResult) {
        this.validationResult = validationResult;
    }
    
    public SchemaRepairService.RepairStrategy getRecommendedStrategy() {
        return recommendedStrategy;
    }
    
    public void setRecommendedStrategy(SchemaRepairService.RepairStrategy recommendedStrategy) {
        this.recommendedStrategy = recommendedStrategy;
    }
    
    public List<String> getRecommendations() {
        return new ArrayList<>(recommendations);
    }
    
    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations != null ? new ArrayList<>(recommendations) : new ArrayList<>();
    }
    
    public void addRecommendation(String recommendation) {
        this.recommendations.add(recommendation);
    }
    
    public LocalDateTime getAnalysisTimestamp() {
        return analysisTimestamp;
    }
    
    public void setAnalysisTimestamp(LocalDateTime analysisTimestamp) {
        this.analysisTimestamp = analysisTimestamp;
    }
    
    public String getRiskLevel() {
        return riskLevel;
    }
    
    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }
    
    public String getImpactAssessment() {
        return impactAssessment;
    }
    
    public void setImpactAssessment(String impactAssessment) {
        this.impactAssessment = impactAssessment;
    }
    
    /**
     * Gets a summary of the repair recommendation
     * 
     * @return Summary string
     */
    public String getSummary() {
        if (validationResult == null) {
            return "No validation data available";
        }
        
        if (validationResult.getMismatchCount() == 0) {
            return "No repair needed - schema is healthy";
        }
        
        return String.format("Repair needed: %d mismatches found, recommended strategy: %s", 
            validationResult.getMismatchCount(), recommendedStrategy);
    }
    
    /**
     * Checks if repair is needed
     * 
     * @return true if repair is needed, false otherwise
     */
    public boolean isRepairNeeded() {
        return validationResult != null && validationResult.getMismatchCount() > 0;
    }
    
    @Override
    public String toString() {
        return "RepairRecommendation{" +
                "recommendedStrategy=" + recommendedStrategy +
                ", recommendationsCount=" + recommendations.size() +
                ", analysisTimestamp=" + analysisTimestamp +
                ", riskLevel='" + riskLevel + '\'' +
                ", impactAssessment='" + impactAssessment + '\'' +
                ", repairNeeded=" + isRepairNeeded() +
                '}';
    }
}
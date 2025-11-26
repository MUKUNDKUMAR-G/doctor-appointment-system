package com.healthcare.appointmentsystem.migration;

import java.util.ArrayList;
import java.util.List;

/**
 * Analysis of the impact of pending migrations
 * Provides insights into what changes will be made
 * 
 * Requirements addressed:
 * - 5.4: Implement impact analysis reporting
 */
public class ImpactAnalysis {
    
    private int tablesCreated;
    private int tablesModified;
    private int tablesDropped;
    private int indexesCreated;
    private int dataInsertions;
    private int dataUpdates;
    private int dataDeletions;
    private int estimatedExecutionTimeSeconds;
    private List<String> riskyOperations = new ArrayList<>();
    
    public int getTablesCreated() {
        return tablesCreated;
    }
    
    public void setTablesCreated(int tablesCreated) {
        this.tablesCreated = tablesCreated;
    }
    
    public void incrementTablesCreated() {
        this.tablesCreated++;
    }
    
    public int getTablesModified() {
        return tablesModified;
    }
    
    public void setTablesModified(int tablesModified) {
        this.tablesModified = tablesModified;
    }
    
    public void incrementTablesModified() {
        this.tablesModified++;
    }
    
    public int getTablesDropped() {
        return tablesDropped;
    }
    
    public void setTablesDropped(int tablesDropped) {
        this.tablesDropped = tablesDropped;
    }
    
    public void incrementTablesDropped() {
        this.tablesDropped++;
    }
    
    public int getIndexesCreated() {
        return indexesCreated;
    }
    
    public void setIndexesCreated(int indexesCreated) {
        this.indexesCreated = indexesCreated;
    }
    
    public void incrementIndexesCreated() {
        this.indexesCreated++;
    }
    
    public int getDataInsertions() {
        return dataInsertions;
    }
    
    public void setDataInsertions(int dataInsertions) {
        this.dataInsertions = dataInsertions;
    }
    
    public void incrementDataInsertions() {
        this.dataInsertions++;
    }
    
    public int getDataUpdates() {
        return dataUpdates;
    }
    
    public void setDataUpdates(int dataUpdates) {
        this.dataUpdates = dataUpdates;
    }
    
    public void incrementDataUpdates() {
        this.dataUpdates++;
    }
    
    public int getDataDeletions() {
        return dataDeletions;
    }
    
    public void setDataDeletions(int dataDeletions) {
        this.dataDeletions = dataDeletions;
    }
    
    public void incrementDataDeletions() {
        this.dataDeletions++;
    }
    
    public int getEstimatedExecutionTimeSeconds() {
        return estimatedExecutionTimeSeconds;
    }
    
    public void setEstimatedExecutionTimeSeconds(int estimatedExecutionTimeSeconds) {
        this.estimatedExecutionTimeSeconds = estimatedExecutionTimeSeconds;
    }
    
    public void addEstimatedExecutionTime(int seconds) {
        this.estimatedExecutionTimeSeconds += seconds;
    }
    
    public List<String> getRiskyOperations() {
        return riskyOperations;
    }
    
    public void setRiskyOperations(List<String> riskyOperations) {
        this.riskyOperations = riskyOperations;
    }
    
    public void addRiskyOperation(String operation) {
        this.riskyOperations.add(operation);
    }
    
    public boolean hasRiskyOperations() {
        return !riskyOperations.isEmpty();
    }
    
    public boolean hasSchemaChanges() {
        return tablesCreated > 0 || tablesModified > 0 || tablesDropped > 0;
    }
    
    public boolean hasDataChanges() {
        return dataInsertions > 0 || dataUpdates > 0 || dataDeletions > 0;
    }
    
    @Override
    public String toString() {
        return "ImpactAnalysis{" +
                "tablesCreated=" + tablesCreated +
                ", tablesModified=" + tablesModified +
                ", tablesDropped=" + tablesDropped +
                ", indexesCreated=" + indexesCreated +
                ", dataInsertions=" + dataInsertions +
                ", dataUpdates=" + dataUpdates +
                ", dataDeletions=" + dataDeletions +
                ", estimatedExecutionTimeSeconds=" + estimatedExecutionTimeSeconds +
                ", riskyOperationsCount=" + riskyOperations.size() +
                '}';
    }
}

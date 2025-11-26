package com.healthcare.appointmentsystem.migration;

import java.util.ArrayList;
import java.util.List;

/**
 * Report containing error analysis for failed migrations
 * 
 * Requirements addressed:
 * - 4.2: Generate detailed error reports
 */
public class ErrorAnalysisReport {
    
    private int totalFailures;
    private int checksumErrors;
    private int syntaxErrors;
    private int timeoutErrors;
    private int connectionErrors;
    private int otherErrors;
    private List<MigrationExecutionLog> failedExecutions = new ArrayList<>();
    
    public int getTotalFailures() {
        return totalFailures;
    }
    
    public void setTotalFailures(int totalFailures) {
        this.totalFailures = totalFailures;
    }
    
    public int getChecksumErrors() {
        return checksumErrors;
    }
    
    public void setChecksumErrors(int checksumErrors) {
        this.checksumErrors = checksumErrors;
    }
    
    public void incrementChecksumErrors() {
        this.checksumErrors++;
    }
    
    public int getSyntaxErrors() {
        return syntaxErrors;
    }
    
    public void setSyntaxErrors(int syntaxErrors) {
        this.syntaxErrors = syntaxErrors;
    }
    
    public void incrementSyntaxErrors() {
        this.syntaxErrors++;
    }
    
    public int getTimeoutErrors() {
        return timeoutErrors;
    }
    
    public void setTimeoutErrors(int timeoutErrors) {
        this.timeoutErrors = timeoutErrors;
    }
    
    public void incrementTimeoutErrors() {
        this.timeoutErrors++;
    }
    
    public int getConnectionErrors() {
        return connectionErrors;
    }
    
    public void setConnectionErrors(int connectionErrors) {
        this.connectionErrors = connectionErrors;
    }
    
    public void incrementConnectionErrors() {
        this.connectionErrors++;
    }
    
    public int getOtherErrors() {
        return otherErrors;
    }
    
    public void setOtherErrors(int otherErrors) {
        this.otherErrors = otherErrors;
    }
    
    public void incrementOtherErrors() {
        this.otherErrors++;
    }
    
    public List<MigrationExecutionLog> getFailedExecutions() {
        return failedExecutions;
    }
    
    public void setFailedExecutions(List<MigrationExecutionLog> failedExecutions) {
        this.failedExecutions = failedExecutions;
    }
    
    @Override
    public String toString() {
        return "ErrorAnalysisReport{" +
                "totalFailures=" + totalFailures +
                ", checksumErrors=" + checksumErrors +
                ", syntaxErrors=" + syntaxErrors +
                ", timeoutErrors=" + timeoutErrors +
                ", connectionErrors=" + connectionErrors +
                ", otherErrors=" + otherErrors +
                ", failedExecutionsCount=" + failedExecutions.size() +
                '}';
    }
}

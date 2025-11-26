package com.healthcare.appointmentsystem.dto;

import java.util.ArrayList;
import java.util.List;

public class BulkOperationResult {
    private int successCount;
    private int failureCount;
    private List<BulkOperationError> errors;
    
    public BulkOperationResult() {
        this.errors = new ArrayList<>();
    }
    
    public BulkOperationResult(int successCount, int failureCount, List<BulkOperationError> errors) {
        this.successCount = successCount;
        this.failureCount = failureCount;
        this.errors = errors != null ? errors : new ArrayList<>();
    }
    
    public int getSuccessCount() {
        return successCount;
    }
    
    public void setSuccessCount(int successCount) {
        this.successCount = successCount;
    }
    
    public int getFailureCount() {
        return failureCount;
    }
    
    public void setFailureCount(int failureCount) {
        this.failureCount = failureCount;
    }
    
    public List<BulkOperationError> getErrors() {
        return errors;
    }
    
    public void setErrors(List<BulkOperationError> errors) {
        this.errors = errors;
    }
    
    public void addError(Long itemId, String error) {
        this.errors.add(new BulkOperationError(itemId, error));
        this.failureCount++;
    }
    
    public void incrementSuccess() {
        this.successCount++;
    }
}

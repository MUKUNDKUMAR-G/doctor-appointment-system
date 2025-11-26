package com.healthcare.appointmentsystem.migration;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Result object for migration repair operations
 * Contains success/failure status and detailed information about the repair
 */
public class RepairResult {
    
    private final boolean success;
    private final String message;
    private final List<String> errors;
    private final LocalDateTime timestamp;
    
    private RepairResult(boolean success, String message, List<String> errors) {
        this.success = success;
        this.message = message;
        this.errors = errors != null ? new ArrayList<>(errors) : new ArrayList<>();
        this.timestamp = LocalDateTime.now();
    }
    
    /**
     * Creates a successful repair result
     * 
     * @param message Success message
     * @return RepairResult indicating success
     */
    public static RepairResult success(String message) {
        return new RepairResult(true, message, null);
    }
    
    /**
     * Creates a failed repair result
     * 
     * @param message Failure message
     * @param errors List of error details
     * @return RepairResult indicating failure
     */
    public static RepairResult failure(String message, List<String> errors) {
        return new RepairResult(false, message, errors);
    }
    
    /**
     * Creates a failed repair result with a single error
     * 
     * @param message Failure message
     * @return RepairResult indicating failure
     */
    public static RepairResult failure(String message) {
        return new RepairResult(false, message, List.of(message));
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public List<String> getErrors() {
        return new ArrayList<>(errors);
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public boolean hasErrors() {
        return !errors.isEmpty();
    }
    
    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("RepairResult{")
          .append("success=").append(success)
          .append(", message='").append(message).append('\'')
          .append(", timestamp=").append(timestamp);
        
        if (!errors.isEmpty()) {
            sb.append(", errors=").append(errors);
        }
        
        sb.append('}');
        return sb.toString();
    }
}
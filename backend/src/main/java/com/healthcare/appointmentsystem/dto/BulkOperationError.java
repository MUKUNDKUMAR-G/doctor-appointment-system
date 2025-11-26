package com.healthcare.appointmentsystem.dto;

public class BulkOperationError {
    private Long itemId;
    private String error;
    
    public BulkOperationError() {}
    
    public BulkOperationError(Long itemId, String error) {
        this.itemId = itemId;
        this.error = error;
    }
    
    public Long getItemId() {
        return itemId;
    }
    
    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }
    
    public String getError() {
        return error;
    }
    
    public void setError(String error) {
        this.error = error;
    }
}

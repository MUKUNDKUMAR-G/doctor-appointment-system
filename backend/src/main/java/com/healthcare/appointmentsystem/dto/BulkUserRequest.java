package com.healthcare.appointmentsystem.dto;

import java.util.List;

public class BulkUserRequest {
    private List<Long> userIds;
    
    public BulkUserRequest() {}
    
    public BulkUserRequest(List<Long> userIds) {
        this.userIds = userIds;
    }
    
    public List<Long> getUserIds() {
        return userIds;
    }
    
    public void setUserIds(List<Long> userIds) {
        this.userIds = userIds;
    }
}

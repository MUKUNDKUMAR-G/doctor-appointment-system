package com.healthcare.appointmentsystem.dto;

public class AvatarUploadResponse {
    
    private String avatarUrl;
    private String message;
    private Boolean success;
    
    public AvatarUploadResponse() {}
    
    public AvatarUploadResponse(String avatarUrl, String message, Boolean success) {
        this.avatarUrl = avatarUrl;
        this.message = message;
        this.success = success;
    }
    
    public static AvatarUploadResponse success(String avatarUrl) {
        return new AvatarUploadResponse(avatarUrl, "Avatar uploaded successfully", true);
    }
    
    public static AvatarUploadResponse failure(String message) {
        return new AvatarUploadResponse(null, message, false);
    }
    
    public String getAvatarUrl() {
        return avatarUrl;
    }
    
    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public Boolean getSuccess() {
        return success;
    }
    
    public void setSuccess(Boolean success) {
        this.success = success;
    }
    
    @Override
    public String toString() {
        return "AvatarUploadResponse{" +
                "avatarUrl='" + avatarUrl + '\'' +
                ", message='" + message + '\'' +
                ", success=" + success +
                '}';
    }
}
